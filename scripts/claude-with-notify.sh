#!/bin/bash

# Example wrapper for running Claude with notifications
# Usage: ./claude-with-notify.sh "your prompt here"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
NOTIFY_SCRIPT="$SCRIPT_DIR/claude-notify.sh"

# Get the prompt
PROMPT="$1"

if [ -z "$PROMPT" ]; then
    echo "Usage: $0 \"your claude prompt\""
    exit 1
fi

# Extract first 50 chars of prompt for notification
PROMPT_PREVIEW="${PROMPT:0:50}..."

# Send start notification
"$NOTIFY_SCRIPT" "info" "Starting: $PROMPT_PREVIEW"

# Run Claude (replace with actual claude command)
# For now, we'll simulate with echo and sleep
echo "Running Claude with prompt: $PROMPT"
# claude "$PROMPT"

# Simulate some work
sleep 2

# Check exit code
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    "$NOTIFY_SCRIPT" "done" "Completed: $PROMPT_PREVIEW"
else
    "$NOTIFY_SCRIPT" "error" "Failed: $PROMPT_PREVIEW (exit code: $EXIT_CODE)"
fi

# Example of waiting for input notification
# "$NOTIFY_SCRIPT" "waiting" "Need input: Please provide the API credentials"

exit $EXIT_CODE