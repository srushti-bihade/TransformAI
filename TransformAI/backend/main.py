from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException,
    Depends
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from sqlalchemy.orm import Session

from jose import jwt, JWTError

import os
import hashlib
import shutil

from database import engine, Base, SessionLocal
from models import User, Document, AuditLog

from document_processor import extract_text
from ai_service import transform_content
from video_processor import transcribe_video
from video_url_processor import transcribe_video_url

from auth import router as auth_router


# ==================================================
# DATABASE
# ==================================================

Base.metadata.create_all(bind=engine)


# ==================================================
# FASTAPI APP
# ==================================================

app = FastAPI(
    title="TransformAI",
    description="AI Content Transformation Platform"
)


# ==================================================
# CORS
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# AUTHENTICATION
# ==================================================

SECRET_KEY = "transformai-change-this-secret-key"
ALGORITHM = "HS256"

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")
        email = payload.get("email")

        if user_id is None or email is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token."
            )

        return {
            "id": user_id,
            "email": email
        }

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token."
        )


# ==================================================
# DATABASE SESSION
# ==================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ==================================================
# AUTH ROUTES
# ==================================================

app.include_router(
    auth_router
)


# ==================================================
# UPLOAD DIRECTORY
# ==================================================

UPLOAD_DIR = "uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


# ==================================================
# ROOT
# ==================================================

@app.get("/")
def root():

    return {
        "message": "TransformAI backend is running!"
    }


# ==================================================
# DOCUMENT UPLOAD
# ==================================================

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    allowed_extensions = {
        ".pdf",
        ".docx",
        ".txt"
    }

    filename = file.filename or ""

    extension = os.path.splitext(
        filename
    )[1].lower()

    if extension not in allowed_extensions:

        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX and TXT files are supported."
        )

    file_path = os.path.join(
        UPLOAD_DIR,
        filename
    )

    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    try:

        text = extract_text(
            file_path
        )

        # ------------------------------------------
        # SHA-256 HASH
        # ------------------------------------------

        sha256 = hashlib.sha256()

        with open(file_path, "rb") as f:

            for chunk in iter(
                lambda: f.read(4096),
                b""
            ):

                sha256.update(chunk)

        file_hash = sha256.hexdigest()

        # ------------------------------------------
        # SAVE DOCUMENT
        # ------------------------------------------

        document = Document(
            filename=filename,
            sha256_hash=file_hash
        )

        db.add(document)

        # ------------------------------------------
        # AUDIT LOG
        # ------------------------------------------

        audit = AuditLog(
            user_email=current_user["email"],
            action="DOCUMENT_UPLOADED",
            details=f"Uploaded {filename}"
        )

        db.add(audit)

        db.commit()

        return {
            "message": "File uploaded successfully!",
            "filename": filename,
            "text": text
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ==================================================
# VIDEO → TEXT
# ==================================================

@app.post("/video-to-text")
async def video_to_text(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    allowed_extensions = {
        ".mp4",
        ".mov",
        ".avi",
        ".mkv",
        ".webm"
    }

    filename = file.filename or ""

    extension = os.path.splitext(
        filename
    )[1].lower()

    # ----------------------------------------------
    # CHECK FILE TYPE
    # ----------------------------------------------

    if extension not in allowed_extensions:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported video format. "
                "Use MP4, MOV, AVI, MKV or WEBM."
            )
        )

    # ----------------------------------------------
    # SAVE VIDEO
    # ----------------------------------------------

    file_path = os.path.join(
        UPLOAD_DIR,
        filename
    )

    try:

        with open(file_path, "wb") as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

        # ------------------------------------------
        # TRANSCRIBE VIDEO
        # ------------------------------------------

        transcript = transcribe_video(
            file_path
        )

        if not transcript.strip():

            raise HTTPException(
                status_code=400,
                detail="No speech could be detected in the video."
            )

        # ------------------------------------------
        # AUDIT LOG
        # ------------------------------------------

        audit = AuditLog(
            user_email=current_user["email"],
            action="VIDEO_TRANSCRIBED",
            details=f"Video converted to text: {filename}"
        )

        db.add(audit)

        db.commit()

        # ------------------------------------------
        # RESPONSE
        # ------------------------------------------

        return {
            "message": "Video converted to text successfully!",
            "filename": filename,
            "transcript": transcript
        }

    except HTTPException:

        raise

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Video transcription failed: {str(e)}"
        )


# ==================================================
# VIDEO URL → TEXT
# ==================================================

@app.post("/video-url-to-text")
async def video_url_to_text(
    data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    url = data.get(
        "url",
        ""
    ).strip()

    # ----------------------------------------------
    # CHECK URL
    # ----------------------------------------------

    if not url:

        raise HTTPException(
            status_code=400,
            detail="Please provide a video URL."
        )

    try:

        # ------------------------------------------
        # DOWNLOAD + TRANSCRIBE
        # ------------------------------------------

        transcript = transcribe_video_url(
            url
        )

        if not transcript.strip():

            raise HTTPException(
                status_code=400,
                detail="No speech could be detected in this video."
            )

        # ------------------------------------------
        # AUDIT LOG
        # ------------------------------------------

        audit = AuditLog(
            user_email=current_user["email"],
            action="VIDEO_URL_TRANSCRIBED",
            details=f"Video URL converted to text: {url}"
        )

        db.add(audit)

        db.commit()

        # ------------------------------------------
        # RESPONSE
        # ------------------------------------------

        return {
            "message": "Video URL converted to text successfully!",
            "url": url,
            "transcript": transcript
        }

    except HTTPException:

        raise

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Video URL processing failed: {str(e)}"
        )


# ==================================================
# AI TRANSFORMATION
# ==================================================

@app.post("/transform")
async def transform(
    data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    try:

        result = transform_content(
            text=data.get(
                "text",
                ""
            ),
            output_type=data.get(
                "output_type",
                "Executive Summary"
            ),
            audience=data.get(
                "audience",
                "General"
            ),
            tone=data.get(
                "tone",
                "Professional"
            ),
            language=data.get(
                "language",
                "English"
            ),
            detail_level=data.get(
                "detail_level",
                "Medium"
            ),
            objective=data.get(
                "objective",
                "Inform"
            ),
            style=data.get(
                "style",
                "Professional"
            )
        )

        # ------------------------------------------
        # PARSE SUGGESTIONS
        # ------------------------------------------

        suggestions = []

        if "SUGGESTIONS:" in result:

            output_part, suggestions_part = result.split(
                "SUGGESTIONS:",
                1
            )

            result = output_part.replace(
                "OUTPUT:",
                ""
            ).strip()

            lines = suggestions_part.splitlines()

            for line in lines:

                line = line.strip()

                if line.startswith(
                    (
                        "1.",
                        "2.",
                        "3.",
                        "4."
                    )
                ):

                    suggestion = line[2:].strip()

                    if suggestion:

                        suggestions.append(
                            suggestion
                        )

        else:

            result = result.replace(
                "OUTPUT:",
                ""
            ).strip()

        # ------------------------------------------
        # AUDIT LOG
        # ------------------------------------------

        audit = AuditLog(
            user_email=current_user["email"],
            action="AI_TRANSFORMATION",
            details=(
                f"Output: {data.get('output_type')}, "
                f"Audience: {data.get('audience')}, "
                f"Tone: {data.get('tone')}"
            )
        )

        db.add(audit)

        db.commit()

        return {
            "output": result,
            "suggestions": suggestions
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"AI transformation failed: {str(e)}"
        )


# ==================================================
# HISTORY
# ==================================================

@app.get("/history")
async def history(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    logs = (
        db.query(AuditLog)
        .filter(
            AuditLog.user_email
            == current_user["email"]
        )
        .order_by(
            AuditLog.timestamp.desc()
        )
        .all()
    )

    return [
        {
            "id": log.id,
            "action": log.action,
            "details": log.details,
            "timestamp": log.timestamp
        }
        for log in logs
    ]