from anthropic import Anthropic
from dotenv import load_dotenv

import os

# Load environment variables
load_dotenv()

anthropic = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

def generate_language_response(prompt, language="Mandarin", model_type="fast"):
    model = "claude-3-5-haiku-20241022" if model_type == "fast" else "claude-3-sonnet-20241022"

    # TODO: make this more configurable and tailored to our use case
    try:
        message = anthropic.messages.create(
            model=model,        # aiming for speed for now
            max_tokens=1000,
            temperature=0.7,
            system="You are a helpful language teacher.",
            messages=[{
                "role": "user",
                "content": f"Teach me how to say '{prompt}' in {language}. Include pronunciation guide."
            }]
        )
        return message.content
    except Exception as e:
        print(f"Error generating response: {e}")
        return None

response = generate_language_response("Hello")
print(response)