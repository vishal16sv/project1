#!/bin/bash

# Create deployment directory
mkdir -p deploy

# Copy necessary files
cp -r src/ deploy/
cp package.json deploy/
cp package-lock.json deploy/
cp .env.example deploy/
cp start.js deploy/
cp .htaccess deploy/
cp captain-definition deploy/

# Create ZIP file
cd deploy
zip -r ../cricket_api.zip .
