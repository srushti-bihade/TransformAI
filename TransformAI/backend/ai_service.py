from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_summary(text):
    response = client.responses.create(
        model="gpt-5-mini",
        input=f"""
Create a clear and concise executive summary of the following document.

Document:
{text}
"""
    )

    return response.output_text
