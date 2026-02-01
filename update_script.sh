#!/bin/bash
echo "Update script started at $(date)" > /Users/kato/clawd/update_log.txt
npm -v >> /Users/kato/clawd/update_log.txt
node -v >> /Users/kato/clawd/update_log.txt
pnpm -v >> /Users/kato/clawd/update_log.txt
echo "Environment check done" >> /Users/kato/clawd/update_log.txt
