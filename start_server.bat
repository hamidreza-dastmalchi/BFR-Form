@echo off
echo Starting local server...
echo.
echo Please open your browser and navigate to:
echo http://localhost:8000
echo.
echo Press Ctrl+C to stop the server when you're done.
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Using Python's HTTP server...
    python -m http.server 8000
) else (
    REM Use PowerShell to start a simple HTTP server
    echo Using PowerShell HTTP server...
    powershell -Command "Start-Process powershell -ArgumentList '-NoProfile -Command \"$listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add(\"http://localhost:8000/\"); $listener.Start(); Write-Host \"Server started at http://localhost:8000/\"; while ($listener.IsListening) { $context = $listener.GetContext(); $response = $context.Response; $url = $context.Request.Url.LocalPath; if ($url -eq \"/\") { $url = \"/server.html\"; } $filePath = Join-Path (Get-Location) $url.TrimStart(\"/\"); if (Test-Path $filePath) { $content = Get-Content $filePath -Raw; $response.ContentType = if ($filePath -match \".html$\") { \"text/html\" } elseif ($filePath -match \".css$\") { \"text/css\" } elseif ($filePath -match \".js$\") { \"application/javascript\" } elseif ($filePath -match \".png$\") { \"image/png\" } elseif ($filePath -match \".jpg$\") { \"image/jpeg\" } else { \"text/plain\" }; $buffer = [System.Text.Encoding]::UTF8.GetBytes($content); $response.ContentLength64 = $buffer.Length; $response.OutputStream.Write($buffer, 0, $buffer.Length); } else { $response.StatusCode = 404; $response.Close(); } $response.Close(); }\"' -Verb RunAs"
) 