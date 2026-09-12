import requests


# =========================================================
# OLLAMA CONFIGURATION
# =========================================================

OLLAMA_URL = "http://localhost:11434/api/generate"

MODEL_NAME = "llama3.2:3b"


# =========================================================
# TRANSFORM CONTENT
# =========================================================

def transform_content(
    text,
    output_type,
    audience,
    tone,
    language,
    detail_level,
    objective,
    style
):

    prompt = f"""
You are TransformAI, an intelligent content transformation
assistant.

Your job is to transform the user's source information
into professional communication content.

IMPORTANT RULES:

1. Preserve the important facts from the source.
2. Do not invent facts, statistics, names, dates or events.
3. Do not change the meaning of the source.
4. Adapt the content according to the user's selected
   parameters.
5. Make the final output natural and professional.
6. Do not mention that you are an AI.
7. Do not explain these instructions in your response.

==================================================
SOURCE INFORMATION
==================================================

{text}

==================================================
TRANSFORMATION PARAMETERS
==================================================

OUTPUT TYPE:
{output_type}

TARGET AUDIENCE:
{audience}

TONE:
{tone}

LANGUAGE:
{language}

DETAIL LEVEL:
{detail_level}

COMMUNICATION OBJECTIVE:
{objective}

STYLE:
{style}

==================================================
TRANSFORMATION INSTRUCTIONS
==================================================

Create a high-quality {output_type} based on the
source information.

The content must be appropriate for:

Audience: {audience}

Tone: {tone}

Language: {language}

Detail level: {detail_level}

Objective: {objective}

Style: {style}

Make sure the output type is actually followed.

If the output type is an Advisory Report:
include appropriate sections such as overview,
risk/impact, recommendations and actions.

If the output type is a LinkedIn Post:
create engaging professional social-media content.

If the output type is an X Thread:
create a clear sequence of connected posts.

If the output type is an Executive Summary:
focus on the most important information and decisions.

If the output type is a Presentation:
organize the information into logical slides.

If the output type is a Video Script:
create scenes, narration and useful visual directions.

==================================================
CONSISTENCY REQUIREMENT
==================================================

The generated content must remain faithful to the
source information.

Important dates, numbers, names, events and facts
must remain consistent.

==================================================
SUGGESTIONS
==================================================

After the main output, provide exactly 4 practical
suggestions that could improve the communication.

Return ONLY this structure:

OUTPUT:

<generated content>

SUGGESTIONS:

1. <suggestion>

2. <suggestion>

3. <suggestion>

4. <suggestion>
"""


    # =====================================================
    # SEND REQUEST TO OLLAMA
    # =====================================================

    response = requests.post(

        OLLAMA_URL,

        json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False
        },

        timeout=180
    )


    # =====================================================
    # CHECK RESPONSE
    # =====================================================

    response.raise_for_status()

    data = response.json()


    # =====================================================
    # RETURN AI RESPONSE
    # =====================================================

    return data["response"]