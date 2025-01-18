import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express from "express";
import { promises as fs } from "fs";
import OpenAI from "openai";
dotenv.config();

let shouldZoom = false;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "-", // Your OpenAI API key here, I used "-" to avoid errors when the key is not set but you should not do that
});

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = "9BWtsMINqrJLrRacOk9x";
const modelID = "eleven_multilingual_v2";

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/voices", async (req, res) => {
  res.send(await voice.getVoices(elevenLabsApiKey));
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

const lipSyncMessage = async (message) => {
  const time = new Date().getTime();
  console.log(`Starting conversion for message ${message}`);
  await execCommand(
    `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`
    // -y to overwrite the file
  );
  console.log(`Conversion done in ${new Date().getTime() - time}ms`);
  await execCommand(
    `./bin/rhubarb -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
  );
  // -r phonetic is faster but less accurate
  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    res.send({
      messages: [
        {
          text: "Hey! How waas your day.",
          audio: await audioFileToBase64("audios/intro_0.wav"),
          lipsync: await readJsonTranscript("audios/intro_0.json"),
          facialExpression: "smile",
          animation: "Talking_1",
        },
        {
          text: "What's up! I'm the UofTHacks Bot, ready to chat with you.",
          audio: await audioFileToBase64("audios/intro_1.wav"),
          lipsync: await readJsonTranscript("audios/intro_1.json"),
          facialExpression: "sad",
          animation: "Crying",
        },
      ],
    });
    return;
  }
  if (!elevenLabsApiKey || openai.apiKey === "-") {
    res.send({
      messages: [
        {
          text: "Please my dear, don't forget to add your API keys!",
          audio: await audioFileToBase64("audios/api_0.wav"),
          lipsync: await readJsonTranscript("audios/api_0.json"),
          facialExpression: "angry",
          animation: "Angry",
        },
        {
          text: "You don't want to ruin this with a crazy ChatGPT and ElevenLabs bill, right?",
          audio: await audioFileToBase64("audios/api_1.wav"),
          lipsync: await readJsonTranscript("audios/api_1.json"),
          facialExpression: "smile",
          animation: "Laughing",
        },
      ],
    });
    return;
  }

  // Replacing this chat completion with a call to my LLM
  const FLASK_BACKEND_URL = "http://0.0.0.0:8000"
  const trans_response = await fetch(`${FLASK_BACKEND_URL}/api/translation`, {
    method: 'POST',  // or 'GET' depending on your endpoint
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        // your data here
        prompt: userMessage,
        language: "French"    // hardcoded to french for now, but we could make it dynamic if we store the language as state
    })
  });

  const trans_json = await trans_response.json();
  const translation = trans_json['message'];

  // The basic translation response will always generate three paragraphs, which we split 
  // into three components using regex
  const responses = translation.split(/\n\s*\n/);
  console.log(responses);
  const langs = ["English", "French", "English"]  // likely not necessary ElevenLabs can prob recognize language 

  // const completion = await openai.chat.completions.create({
  //   model: "gpt-4o",
  //   max_tokens: 1000,
  //   temperature: 0.6,
  //   response_format: {
  //     type: "json_object",
  //   },
  //   messages: [
  //     {
  //       role: "system",
  //       content: `
  //       You are a teacher.
  //       You will always reply with a JSON array of messages. With a maximum of 3 messages.
  //       Each message has a text, facialExpression, and animation property.
  //       The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
  //       The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, and Angry. 
  //       `,
  //     },
  //     {
  //       role: "user",
  //       content: userMessage || "Hello",
  //     },
  //   ],
  // });
  // let messages = JSON.parse(completion.choices[0].message.content);
  // if (messages.messages) {
  //   messages = messages.messages; // ChatGPT is not 100% reliable, sometimes it directly returns an array and sometimes a JSON object with a messages property
  // }

  const messages = [];
  for (let i = 0; i < responses.length; i++) {
    // const message = messages[i];
    const message = {
        text: responses[i],
        audio: undefined,
        lipsync: undefined,
        facialExpression: "smile",
        animation: "Talking_1"
    }
    // generate audio file
    const fileName = `audios/message_${i}.mp3`; // The name of your audio file
    const textInput = responses[i]; // The text you wish to convert to speech
    // Do we need to specify the language
    await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput, modelID);
    // generate lipsync
    await lipSyncMessage(i);
    message.audio = await audioFileToBase64(fileName);
    message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
    messages.push(message);
  }

  res.send({ messages });
});

const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

app.listen(port, () => {
  console.log(`UofTHacks Bot listening on port ${port}`);
});

app.post('/zoom', (req, res) => {
  shouldZoom = true;
  res.json({ success: true });
});

app.get('/should-zoom', (req, res) => {
  console.log('Got should-zoom request');
  const current = shouldZoom;
  shouldZoom = false;
  res.json({ shouldZoom: current });
});