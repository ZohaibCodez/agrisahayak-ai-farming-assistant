@echo off
REM Quick configuration checker for Google Places API

echo ========================================
echo Google Places API Configuration Checker
echo ========================================
echo.

REM Check if .env.local exists
if not exist ".env.local" (
    echo [ERROR] .env.local file not found!
    echo Please create .env.local file in project root.
    echo.
    pause
    exit /b 1
)

echo [OK] .env.local file found
echo.

REM Check if API key is configured
findstr /C:"NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIza" .env.local >nul
if %errorlevel%==0 (
    echo [OK] Google Places API key appears to be configured
    echo.
    echo Your API key starts with: AIza...
    echo.
    echo Next steps:
    echo 1. Make sure you've enabled Places API in Google Cloud Console
    echo 2. Restart your dev server: npm run dev
    echo 3. Visit http://localhost:9002/marketplace
    echo 4. Check terminal for "Fetching suppliers from Google Places API..."
) else (
    findstr /C:"NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here" .env.local >nul
    if %errorlevel%==0 (
        echo [WARNING] Google Places API key is still the placeholder
        echo.
        echo To configure:
        echo 1. Get API key from: https://console.cloud.google.com/
        echo 2. Edit .env.local file
        echo 3. Replace "your_google_places_api_key_here" with your real API key
        echo 4. See docs/google-places-api-setup.md for detailed guide
    ) else (
        echo [INFO] Google Places API key configuration not found
        echo.
        echo Your app will use free fallback methods:
        echo - OpenStreetMap ^(free, unlimited^)
        echo - Curated list of Pakistani agricultural companies
        echo.
        echo This works fine! But if you want more data:
        echo - See docs/google-places-api-setup.md for setup guide
    )
)

echo.
echo ========================================
echo Documentation: docs/google-places-api-setup.md
echo ========================================
echo.
pause
