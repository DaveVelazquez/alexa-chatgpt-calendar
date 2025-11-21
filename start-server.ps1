$nodeExe = "C:\Users\velazqud\AppData\Local\Temp\npm-install\node-v18.17.0-win-x64\node.exe"
$npmCmd = "C:\Users\velazqud\AppData\Local\Temp\npm-install\node-v18.17.0-win-x64\npm.cmd"

Write-Host "=== Starting Alexa ChatGPT Calendar Skill Backend ==="
Write-Host "Node.js Version:" -NoNewline
& $nodeExe --version
Write-Host "NPM Version:" -NoNewline  
& $npmCmd --version

Set-Location "C:\dev\GPT 21\server"
Write-Host "Starting server..."
& $nodeExe index.js