$wsh = New-Object -ComObject WScript.Shell
$desktop = "C:\Users\yosef haim\Desktop"
$shortcutPath = Join-Path $desktop "בית האפיות - The Bakery House.lnk"
$iconPath = "C:\Users\yosef haim\Desktop\the-bakery-house\favicon.ico"
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chromePath)) {
    $chromePath = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
}

$sc = $wsh.CreateShortcut($shortcutPath)
if (Test-Path $chromePath) {
    $sc.TargetPath = $chromePath
    $sc.Arguments = "--app=https://the-bakery-house-app.netlify.app"
} else {
    $sc.TargetPath = "https://the-bakery-house-app.netlify.app"
}
$sc.Description = "בית האפיות - The Bakery House"
$sc.IconLocation = "$iconPath,0"
$sc.Save()
Write-Host "Created Desktop Shortcut successfully!"
