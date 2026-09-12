import os
import uuid
import yt_dlp

from video_processor import transcribe_video


VIDEO_URL_DIR = "uploads/video_urls"

os.makedirs(VIDEO_URL_DIR, exist_ok=True)


def is_supported_url(url):
    supported_domains = [
        "youtube.com",
        "youtu.be",
        "www.youtube.com",
        "m.youtube.com",
    ]

    url_lower = url.lower()

    return any(
        domain in url_lower
        for domain in supported_domains
    )


def download_video_audio(url):

    if not is_supported_url(url):
        raise ValueError(
            "Currently only YouTube video links are supported."
        )

    unique_id = str(uuid.uuid4())

    output_template = os.path.join(
        VIDEO_URL_DIR,
        unique_id
    )

    ydl_options = {
        "format": "bestaudio/best",
        "outtmpl": output_template + ".%(ext)s",
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_options) as ydl:

            info = ydl.extract_info(
                url,
                download=True
            )

            downloaded_file = ydl.prepare_filename(
                info
            )

        return downloaded_file

    except Exception as e:
        raise RuntimeError(
            f"Could not download the video: {str(e)}"
        )


def transcribe_video_url(url):

    audio_file = None

    try:

        audio_file = download_video_audio(url)

        transcript = transcribe_video(
            audio_file
        )

        if not transcript.strip():
            raise ValueError(
                "No speech could be detected in this video."
            )

        return transcript

    finally:

        if audio_file and os.path.exists(audio_file):

            try:
                os.remove(audio_file)
            except Exception:
                pass
