param()

Add-Type -AssemblyName System.Drawing

$src = "C:\Users\yosef haim\Desktop\the-bakery-house\icon-192.png"
$dstIco = "C:\Users\yosef haim\Desktop\the-bakery-house\favicon.ico"

$bmp = [System.Drawing.Bitmap]::FromFile($src)
$hIcon = $bmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)

$fs = New-Object System.IO.FileStream($dstIco, [System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()

$icon.Dispose()
$bmp.Dispose()
Write-Host "Created favicon.ico"
