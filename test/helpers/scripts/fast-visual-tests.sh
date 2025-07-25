#!/bin/bash
# Fast visual test runner - trades some accuracy for 5x speed

echo "Running visual tests in FAST MODE..."
echo "This mode reduces accuracy but runs ~5x faster"
echo ""

# Set fast mode environment variable
export FAST_VISUAL_TESTS=true

# Run tests with reduced workers to avoid context issues
npx playwright test --project=visual --workers=2 "$@"