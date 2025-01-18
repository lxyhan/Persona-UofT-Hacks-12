from anthropic import Anthropic
from dotenv import load_dotenv

import os

# Load environment variables
load_dotenv()

anthropic = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))


def create_translation_prompt(user_input):
    return f"""
        Please answer the user's prompt below asking how to say things in a specific language.
        Please answer first by providing a preamble in English about the generated translation(s), then
        provide the translation(s) in the other language, then explain the result(s) in English again. Keep in mind when
        answering that your answer should have a three paragraph format: English, Other Language, English. Make sure there
        is only language of one type in each paragraph (i.e., please don't include English translations in the "Other Language" paragraph,
        put them in the third paragraph). Here is an example to follow:

        Prompt: I'll be going to France in a month, can you teach me some important phrases I should know to be prepared?
        Your answer: 

        Yes, of course! It is really good to prepare a few greetings and responses to be able to get around a new
        place, comfortably. Here are some good phrases:

        Bonjour!
        Comment ça va? 
        Où se trouvent les toilettes?
        Puis-je avoir un croissant, s'il vous plaît?

        The first phrase means "Hello", so you will be using it all the time. The next one is how you would
        say "How are you?" in French, another important one to have friendly interactions with the locals.
        The last two are particularly helpful for when you are getting around in the cities. The third sentence
        is how you would say "Where is the bathroom?" in case you find yourself needing to go when out and about.
        The last one is how you would say "Could I please get a croissant?", for when you want to indulge in
        a sweet treat at a cafe! With these few phrases, you'll be more prepared to have a great time in France.
        Let me know if you would like to know how to say anything else!

        Your turn:
        Prompt: {user_input}
    """

def generate_translation_response(prompt, language="Mandarin", model_type="fast"):
    # model = "claude-3-5-haiku-20241022" if model_type == "fast" else "claude-3-5-sonnet-20241022"
    model = "claude-3-5-sonnet-20241022"
    message = create_translation_prompt(prompt)

    try:
        # Potentially useful prompt:
        # "content": f"Teach me how to say '{prompt}' in {language}. Include pronunciation guide."
        message = anthropic.messages.create(
            model=model,        # currently aiming for speed by using Haiku over a different model
            max_tokens=1000,
            temperature=0.7,
            system="You are a helpful language teacher.",
            messages=[{
                "role": "user",
                "content": message
            }]
        )
        return message.content
    except Exception as e:
        print(f"Error generating response: {e}")
        return None
    
# TODO: create the follow-up generation for confusion emotions and build an endpoint for it if necessary (check
# the existing ones to see if there is already functionality for it)
def generate_followup_response(prev_input, prev_response, language="French", model_type="slow"):
    model = "claude-3-5-haiku-20241022" if model_type == "fast" else "claude-3-5-sonnet-20241022"

    try:
        message = anthropic.messages.create(
            model=model, 
            max_tokens=1000,
            temperature=0.7,
            system="You are a helpful language teacher.",
            messages=[{
                "role": "user",
                "content": prev_input
            }, {
                "role": "assistant",
                "content": prev_response
            }, {
                "role": "user",
                "content": "I am confused, can you please explain your previous response to me in more detail so I can understand it better?"
            }]
        )
        return message.content
    except Exception as e:
        print(f"Error generating response: {e}")
        return None



# response1 = generate_translation_response("For my upcoming trip to Paris, can you teach me a few greetings that will help me connect with locals?")
# print(response1[0].text)

input2 = "Can you teach me how to say 'Can I get one moon cake please?' in Mandarin?"
response2 = generate_translation_response("Can you teach me how to say 'Can I get one moon cake please?' in Mandarin?")
print(response2[0].text)

# Test out the follow up response
followup = generate_followup_response(prev_input=input2, prev_response=response2, language="French")
print(followup[0].text)