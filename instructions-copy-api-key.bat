@echo off
echo ========================================
echo Copy Your Google Places API Key
echo ========================================
echo.
echo I can see you have a "Browser key" in your Google Cloud Console!
echo.
echo STEPS TO COPY YOUR API KEY:
echo.
echo 1. In your browser, click on "Browser key (auto created by Firebase)"
echo    (the blue link in the Name column)
echo.
echo 2. A panel will open on the right side showing:
echo    - API key: AIzaSy.............................
echo.
echo 3. Click the COPY icon (two overlapping squares) next to the API key
echo.
echo 4. The key is now in your clipboard!
echo.
echo 5. Open .env.local file (should be open in VS Code)
echo.
echo 6. Find this line:
echo    NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
echo.
echo 7. Replace "your_google_places_api_key_here" with your copied key
echo.
echo 8. Save the file (Ctrl+S)
echo.
echo 9. Restart dev server:
echo    - Press Ctrl+C to stop
echo    - Run: npm run dev
echo.
echo ========================================
echo Your API key should start with: AIzaSy
echo ========================================
echo.
pause
