param()

Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\yosef haim\.gemini\antigravity\brain\babbc15b-578b-4254-a64f-f25c7cf3daf1\bakery_house_app_icon_clean_1792411164134.jpg"
$destDir = "C:\Users\yosef haim\Desktop\the-bakery-house"

function Generate-ResizedPng($src, $dst, $w, $h) {
    $srcImg = [System.Drawing.Image]::FromFile($src)
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $g.DrawImage($srcImg, 0, 0, $w, $h)
    $bmp.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $g.Dispose()
    $bmp.Dispose()
    $srcImg.Dispose()
    Write-Host "Created: $dst ($w x $h)"
}

Generate-ResizedPng $sourcePath (Join-Path $destDir "icon-512.png") 512 512
Generate-ResizedPng $sourcePath (Join-Path $destDir "icon-192.png") 192 192
Generate-ResizedPng $sourcePath (Join-Path $destDir "apple-touch-icon.png") 180 180
Generate-ResizedPng $sourcePath (Join-Path $destDir "favicon.png") 64 64
Generate-ResizedPng $sourcePath (Join-Path $destDir "app-logo.png") 512 512
Generate-ResizedPng $sourcePath (Join-Path $destDir "assets\app-logo.png") 512 512
Generate-ResizedPng $sourcePath (Join-Path $destDir "assets\icon-512.png") 512 512
Generate-ResizedPng $sourcePath (Join-Path $destDir "assets\icon-192.png") 192 192
