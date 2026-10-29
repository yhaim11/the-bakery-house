# Powershell packaging script for The Bakery House
$sourceDir = $PSScriptRoot
$zipPath = Join-Path $sourceDir "the_bakery_house_deploy.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Add-Type -AssemblyName System.IO.Compression.FileSystem
$compressionLevel = [System.IO.Compression.CompressionLevel]::Optimal

$files = @("index.html", "style.css", "app.js", "recipes.json", "manifest.json", "app-logo.png", "favicon.png", "favicon.ico", "apple-touch-icon.png", "icon-192.png", "icon-512.png")
$archive = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')

foreach ($f in $files) {
  $filePath = Join-Path $sourceDir $f
  if (Test-Path $filePath) {
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $filePath, $f, $compressionLevel)
    Write-Host "  + Added $f"
  }
}

$assetsDir = Join-Path $sourceDir "assets"
if (Test-Path $assetsDir) {
  Get-ChildItem -Path $assetsDir -Recurse -File | ForEach-Object {
    $relative = "assets/" + $_.FullName.Substring($assetsDir.Length + 1).Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $relative, $compressionLevel)
    Write-Host "  + Added $relative"
  }
}

$archive.Dispose()
Write-Host "✅ Zip archive successfully created at $zipPath"
