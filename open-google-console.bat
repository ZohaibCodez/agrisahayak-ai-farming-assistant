@echo off
echo Opening Google Cloud Console to create/find API key...
echo.
echo Steps:
echo 1. Sign in to your Google account
echo 2. Select your project
echo 3. Look under "API Keys" section
echo 4. Copy your API key (starts with AIza)
echo 5. Paste it in .env.local file
echo.
start https://console.cloud.google.com/apis/credentials
echo.
echo Browser opening... Follow the steps above!
pause
