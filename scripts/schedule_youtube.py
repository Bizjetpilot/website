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
        # Require UTC time in HH:MM format
        time_text = stream["time_utc"]

        try:
            datetime.strptime(time_text, "%H:%M")
        except (ValueError, TypeError):
            continue
        # Only schedule livestreams in the future
        try:
            scheduled_time = datetime.fromisoformat(
                f"{stream['date']}T{stream['time_utc'].replace('Z', '')}"
            ).replace(tzinfo=timezone.utc)
        except (ValueError, TypeError):
            continue

        if scheduled_time <= datetime.now(timezone.utc):
            continue
        ready_streams.append((file_path, stream))

    return ready_streams


def create_youtube_broadcast(youtube, stream):
    """Create a private, scheduled YouTube livestream."""

    scheduled_time = (
        f"{stream['date']}T{stream['time_utc']}:00Z"
    )

    description = stream.get("summary", "")

    response = youtube.liveBroadcasts().insert(
        part="snippet,status,contentDetails",
        body={
            "snippet": {
                "title": stream["title"],
                "description": description,
                "scheduledStartTime": scheduled_time
            },
            "status": {
                "privacyStatus": "private",
                "selfDeclaredMadeForKids": False
            },
            "contentDetails": {
                "enableAutoStart": False,
                "enableAutoStop": False
            }
        }
    ).execute()

    return response


def save_youtube_link(file_path, stream, broadcast):
    """Record the scheduled YouTube broadcast in its announcement."""

    broadcast_id = broadcast["id"]

    stream["youtube_url"] = (
        f"https://www.youtube.com/watch?v={broadcast_id}"
    )

    with file_path.open("w", encoding="utf-8") as file:
        json.dump(stream, file, indent=2, ensure_ascii=False)
        file.write("\n")


def find_existing_broadcast(youtube, stream):
    """Check for an existing scheduled broadcast."""

    scheduled_time = (
        f"{stream['date']}T{stream['time_utc']}:00Z"
    )

    request = youtube.liveBroadcasts().list(
        part="snippet,status",
        broadcastStatus="upcoming",
        maxResults=50
    )

    while request is not None:
        response = request.execute()

        for broadcast in response.get("items", []):
            snippet = broadcast.get("snippet", {})

            if (
                snippet.get("title") == stream["title"]
                and snippet.get("scheduledStartTime")
                == scheduled_time
            ):
                return broadcast

        request = youtube.liveBroadcasts().list_next(
            request, response
        )

    return None
def test_youtube_connection():
    """Verify YouTube access without changing anything."""

    youtube = connect_to_youtube()

    response = youtube.channels().list(
        part="snippet",
        mine=True
    ).execute()

    channels = response.get("items", [])

    if not channels:
        raise RuntimeError(
            "No authorised YouTube channel was found."
        )

    print(
        "YouTube connection successful: "
        + channels[0]["snippet"]["title"]
    )


def schedule_ready_streams():
    """Schedule eligible announcements without creating duplicates."""

    youtube = connect_to_youtube()
    ready_streams = load_ready_streams()

    print(f"Duplicate check: {len(ready_streams)} eligible announcement(s).")

    for file_path, stream in ready_streams:
        existing = find_existing_broadcast(youtube, stream)

        if existing:
            print(f"Existing broadcast found: {stream['title']}")
            continue

        print(f"Ready to schedule: {stream['title']}")
        print("SAFE MODE — broadcast creation skipped.")
def main():
    """Check announcements without creating YouTube broadcasts."""
    
    test_youtube_connection()

    schedule_ready_streams()

    ready_streams = load_ready_streams()

    print(f"Found {len(ready_streams)} ready livestream(s).")

    for file_path, stream in ready_streams:
        print(
            f"READY: {file_path.name} | "
            f"{stream['title']} | "
            f"{stream['date']} {stream['time_utc']} UTC"
        )

    print("SAFE TEST COMPLETE — no YouTube broadcasts created.")


if __name__ == "__main__":
    main()
