#!/bin/bash

# Change to the project directory
cd "$(dirname "$0")"

# Add all changes
git add .

# Get the current date and time for the commit message
timestamp=$(date "+%Y-%m-%d %H:%M:%S")

# Commit with timestamp
git commit -m "Auto commit at $timestamp"

# Push to GitHub
git push

echo "Changes pushed to GitHub successfully!" 