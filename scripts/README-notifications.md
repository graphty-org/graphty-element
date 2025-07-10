# Claude Pushover Notifications

This directory contains scripts to send Pushover notifications when Claude needs input or completes tasks.

## Setup

1. **Get Pushover credentials:**
   - Sign up at [pushover.net](https://pushover.net)
   - Create an application to get an API token
   - Note your User Key from your dashboard

2. **Set environment variables:**
   ```bash
   export PUSHOVER_USER_KEY="your-user-key-here"
   export PUSHOVER_APP_TOKEN="your-app-token-here"
   ```
   
   Add these to your `~/.bashrc` or `~/.zshrc` to make them permanent.

3. **Test the notification:**
   ```bash
   ./scripts/claude-notify.sh "info" "Test notification"
   ```

## Usage

### Direct notification
```bash
# Send different types of notifications
./scripts/claude-notify.sh "waiting" "Need your input on which layout to use"
./scripts/claude-notify.sh "done" "Finished implementing 2D rendering fix"
./scripts/claude-notify.sh "error" "Build failed with TypeScript errors"
./scripts/claude-notify.sh "info" "Starting analysis of codebase"
```

### With Claude wrapper
```bash
# This will notify when starting and completing
./scripts/claude-with-notify.sh "implement dark mode for the graph"
```

### Manual notifications during Claude sessions

When I need your input, you can run:
```bash
./scripts/claude-notify.sh "waiting" "Claude needs: <description of what I need>"
```

When I complete a task:
```bash
./scripts/claude-notify.sh "done" "Claude completed: <task description>"
```

## Notification Types

- **waiting** (⏳): When Claude needs input - normal priority, pushover sound
- **done** (✅): When Claude completes a task - normal priority, cosmic sound
- **error** (❌): When something fails - high priority, falling sound
- **info** (ℹ️): General information - low priority, no sound

## Integration Ideas

1. **Alias for quick notifications:**
   ```bash
   alias cn-wait='~/Projects/graphty/graphty-element/scripts/claude-notify.sh waiting'
   alias cn-done='~/Projects/graphty/graphty-element/scripts/claude-notify.sh done'
   ```

2. **Watch for long builds:**
   ```bash
   npm run build && cn-done "Build completed" || cn-error "Build failed"
   ```

3. **Notify on test completion:**
   ```bash
   npm test && cn-done "Tests passed" || cn-error "Tests failed"
   ```