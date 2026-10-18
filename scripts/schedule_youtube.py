import json
import os
from pathlib import Path
from datetime import datetime, timezone

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build


# Location of livestream announcements
STREAMS_FOLDER = Path(
    "bizjetpilot-homepage/bizjetpilot-homepage/content/streams"
)

# YouTube permissions
YOUTUBE_SCOPES = [
    "https://www.googleapis.com/auth/youtube"
]


def connect_to_youtube():
    """Connect to YouTube using GitHub's encrypted secret."""

    token_json = os.environ.get("YOUTUBE_TOKEN")

    if not token_json:
        raise RuntimeError(
            "YOUTUBE_TOKEN secret is missing."
        )

    token_data = json.loads(token_json)

    credentials = Credentials.from_authorized_user_info(
        token_data,
        scopes=YOUTUBE_SCOPES
    )

    if credentials.expired and credentials.refresh_token:
        credentials.refresh(Request())

    return build(
        "youtube",
        "v3",
        credentials=credentials
    )


def load_ready_streams():
    """Find livestream announcements ready for scheduling."""

    ready_streams = []

    for file_path in STREAMS_FOLDER.glob("*.json"):
        with file_path.open("r", encoding="utf-8") as file:
            stream = json.load(file)

        # Never schedule unfinished announcements
        if stream.get("status") != "published":
            continue

        # Require a title, date and UTC time
        if not all([
            stream.get("title"),
            stream.get("date"),
            stream.get("time_utc")
        ]):
            continue

        # Avoid announcements already linked to YouTube
        if stream.get("youtube_url"):
            continue

        ready_streams.append((file_path, stream))

    return ready_streams
