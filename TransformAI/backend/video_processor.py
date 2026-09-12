from faster_whisper import WhisperModel


MODEL_NAME = "base"

_model = None


def get_whisper_model():
    global _model

    if _model is None:
        print("Loading Whisper model...")

        _model = WhisperModel(
            MODEL_NAME,
            device="cpu",
            compute_type="int8"
        )

        print("Whisper model loaded successfully!")

    return _model


def transcribe_video(file_path):

    model = get_whisper_model()

    segments, info = model.transcribe(
        file_path,
        language="en",
        beam_size=5
    )

    transcript_parts = []

    for segment in segments:

        text = segment.text.strip()

        if text:
            transcript_parts.append(text)

    transcript = " ".join(
        transcript_parts
    )

    return transcript