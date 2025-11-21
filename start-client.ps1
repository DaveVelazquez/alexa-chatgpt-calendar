$nodeExe = "C:\Users\velazqud\AppData\Local\Temp\npm-install\node-v18.17.0-win-x64\node.exe"
$npmCmd = "C:\Users\velazqud\AppData\Local\Temp\npm-install\node-v18.17.0-win-x64\npm.cmd"

Write-Host "=== Starting Alexa ChatGPT Calendar Skill Frontend ==="
Set-Location "C:\dev\GPT 21\client"
Write-Host "Starting React development server..."
& $npmCmd start