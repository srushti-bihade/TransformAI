# TransformAI 🚀

### Gen AI Platform for Automated Content Transformation

TransformAI is an AI-powered platform that converts user-provided content such as documents, articles, reports, and videos into different communication formats based on the user's selected audience, tone, language, and output type.

The platform combines document processing, AI transformation, authentication, and video transcription into one unified dashboard.

---

## 🌟 Features

### 📄 Document Processing
- Upload PDF, DOCX, and TXT files
- Automatically extract text from uploaded documents
- Generate a SHA-256 hash for uploaded documents
- Secure authenticated document processing

### 🎥 Video-to-Text
- Upload video files
- Convert speech from videos into text
- Supports common video formats such as:
  - MP4
  - MOV
  - AVI
  - MKV
  - WEBM

### 🔗 Video URL-to-Text
- Provide a video URL
- Download and process the video
- Convert the video's speech into text
- Useful for transforming online video content

### 🤖 AI Content Transformation
Transform the same source content into different outputs based on user requirements.

Users can control:

- Output type
- Target audience
- Tone
- Language
- Detail level
- Objective
- Writing style

### 🔐 Authentication & Security
- User registration
- User login
- JWT-based authentication
- Password hashing
- Protected API endpoints
- User-specific access
- Audit logging
- SHA-256 document hashing

### 📊 Dashboard
The dashboard provides a centralized interface for:

- Uploading documents
- Processing videos
- Processing video URLs
- Selecting transformation settings
- Viewing generated AI content
- Managing authenticated sessions

---

## 🧠 How TransformAI Works

```text
             User Input
                 │
                 ▼
       ┌──────────────────┐
       │   TransformAI    │
       │     Dashboard    │
       └────────┬─────────┘
                │
       ┌────────┼─────────┐
       ▼        ▼         ▼
   Documents  Videos   Video URLs
       │        │         │
       ▼        ▼         ▼
     Text Extraction / Transcription
                │
                ▼
        ┌───────────────┐
        │  AI Processing │
        └───────┬───────┘
                │
                ▼
      User-selected Output
                │
                ▼
       Transformed Content


