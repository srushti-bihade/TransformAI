from fastapi import FastAPI, UploadFile, File
from dotenv import load_dotenv
import os

from document_processor import extract_text

# Load variables from .env
load_dotenv()

app = FastAPI(title="TransformAI")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.get("/")
def home():
    return {
        "message": "TransformAI backend is running!"
    }


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    # Save uploaded file
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # Extract text from the uploaded document
    try:
        extracted_text = extract_text(file_path)

        return {
            "message": "File uploaded and text extracted successfully!",
            "filename": file.filename,
            "text": extracted_text
        }

    except ValueError as error:
        return {
            "message": str(error),
            "filename": file.filename
        }