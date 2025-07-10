#!/bin/bash

# Function to display usage information
usage() {
    echo "Usage: $0 <destination_path>"
    echo "Example: $0 /path/to/destination"
    exit 1
}

# Check if destination path is provided
if [ $# -ne 1 ]; then
    usage
fi

DESTINATION="$1/shepherd"

# Remove existing shepherd directory if it exists
if [ -d "$DESTINATION" ]; then
    echo "Removing existing shepherd directory: $DESTINATION"
    rm -rf "$DESTINATION" || {
        echo "Error: Failed to remove existing operator directory"
        exit 1
    }
fi

# Create the shepherd directory
echo "Creating shepherd directory: $DESTINATION"
mkdir -p "$DESTINATION" || {
    echo "Error: Failed to create shepherd directory"
    exit 1
}

ROOT_DIRECTORY="."

# List of directories to copy
DIRECTORIES=(
    "app"
    "assets"
    "components"
    "lib"
    "public"
)

# List of files to copy
FILES=(
    ".eslintrc.json"
    ".gitignore"
    ".prettierrc.json"
    "components.json"
    "Dockerfile"
    "middleware.ts"
    "next-env.d.ts"
    "next.config.ts"
    "package.json"
    "package-lock.json"
    "postcss.config.mjs"
    "tsconfig.json"
)

# Copy directories
echo "Copying directories..."
for dir in "${ROOT_DIRECTORY}/${DIRECTORIES[@]}"; do
    if [ -d "$dir" ]; then
        echo "Copying $dir to $DESTINATION"
        cp -r "$dir" "$DESTINATION/" || {
            echo "Error: Failed to copy $dir"
            exit 1
        }
    else
        echo "Warning: Directory $dir does not exist, skipping..."
    fi
done

# Copy files
echo "Copying files..."
for file in "${ROOT_DIRECTORY}/${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Copying $file to $DESTINATION"
        cp "$file" "$DESTINATION/" || {
            echo "Error: Failed to copy $file"
            exit 1
        }
    else
        echo "Warning: File $file does not exist, skipping..."
    fi
done

# Remove all __pycache__ directories and ._ files recursively
echo "Removing .DS_Store files..."
find "$DESTINATION" -name ".DS_Store" -exec rm -rf {} +

echo "Deployment completed successfully!"
