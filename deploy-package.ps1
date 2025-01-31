# Create deployment directory
New-Item -ItemType Directory -Force -Path deploy

# Copy necessary files
Copy-Item -Path src -Destination deploy -Recurse
Copy-Item -Path package.json -Destination deploy
Copy-Item -Path package-lock.json -Destination deploy
Copy-Item -Path .env.example -Destination deploy
Copy-Item -Path start.js -Destination deploy
Copy-Item -Path .htaccess -Destination deploy
Copy-Item -Path captain-definition -Destination deploy

# Create ZIP file
Compress-Archive -Path deploy\* -DestinationPath cricket_api.zip -Force

# Clean up
Remove-Item -Path deploy -Recurse -Force
