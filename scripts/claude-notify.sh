#!/bin/bash

# Claude notification script for Pushover
# Usage: claude-notify "status" "message" ["title"]

# Configuration - Set these environment variables or edit here
PUSHOVER_USER_KEY="${PUSHOVER_USER_KEY:-}"
PUSHOVER_APP_TOKEN="${PUSHOVER_APP_TOKEN:-}"

# Check if credentials are set
if [ -z "$PUSHOVER_USER_KEY" ] || [ -z "$PUSHOVER_APP_TOKEN" ]; then
    echo "Error: Please set PUSHOVER_USER_KEY and PUSHOVER_APP_TOKEN environment variables"
    echo "Export them in your shell config or edit this script directly"
    exit 1
fi

# Parse arguments
STATUS="$1"
MESSAGE="$2"
TITLE="${3:-Claude Code}"

# Set priority and sound based on status
case "$STATUS" in
    "waiting")
        PRIORITY="0"
        SOUND="pushover"
        EMOJI="⏳"
        ;;
    "done")
        PRIORITY="0"
        SOUND="cosmic"
        EMOJI="✅"
        ;;
    "error")
        PRIORITY="1"
        SOUND="falling"
        EMOJI="❌"
        ;;
    "info")
        PRIORITY="-1"
        SOUND="none"
        EMOJI="ℹ️"
        ;;
    *)
        PRIORITY="0"
        SOUND="pushover"
        EMOJI="🤖"
        ;;
esac

# Add emoji to message
FULL_MESSAGE="$EMOJI $MESSAGE"

# Send notification
response=$(curl -s \
    --form-string "token=$PUSHOVER_APP_TOKEN" \
    --form-string "user=$PUSHOVER_USER_KEY" \
    --form-string "title=$TITLE" \
    --form-string "message=$FULL_MESSAGE" \
    --form-string "priority=$PRIORITY" \
    --form-string "sound=$SOUND" \
    https://api.pushover.net/1/messages.json)

# Check if successful
if echo "$response" | grep -q '"status":1'; then
    echo "Notification sent successfully"
else
    echo "Failed to send notification: $response"
    exit 1
fi