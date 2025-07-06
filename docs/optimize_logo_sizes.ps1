# Load required assemblies
Add-Type -AssemblyName System.Drawing

# Create images directory if it doesn't exist
$imagesDir = Join-Path $PSScriptRoot "images"
if (-not (Test-Path $imagesDir)) {
    New-Item -ItemType Directory -Path $imagesDir -Force
}

# Define logo sizes and their specific requirements
$logoSizes = @{
    "logo.png" = @{ Width = 512; Height = 512 }
    "favicon-32x32.png" = @{ Width = 32; Height = 32 }
    "favicon-16x16.png" = @{ Width = 16; Height = 16 }
    "apple-touch-icon.png" = @{ Width = 180; Height = 180 }
    "favicon-192x192.png" = @{ Width = 192; Height = 192 }
    "favicon-512x512.png" = @{ Width = 512; Height = 512 }
}

# Get the original logo
$originalLogo = Join-Path $imagesDir "logo.jpg"
if (-not (Test-Path $originalLogo)) {
    Write-Host "Original logo not found at $originalLogo"
    exit 1
}

# Create optimized versions of the logo
foreach ($filename in $logoSizes.Keys) {
    $size = $logoSizes[$filename]
    $outputPath = Join-Path $imagesDir $filename
    
    try {
        # Load original image
        $img = [System.Drawing.Image]::FromFile($originalLogo)
        
        # Create new image with proper size
        $newImg = New-Object System.Drawing.Bitmap($size.Width, $size.Height)
        $graphics = [System.Drawing.Graphics]::FromImage($newImg)
        
        # Set high quality settings
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        
        # Calculate scaling
        $scaleX = $size.Width / $img.Width
        $scaleY = $size.Height / $img.Height
        $scale = [Math]::Min($scaleX, $scaleY)
        
        # Calculate centered position
        $newWidth = [Math]::Floor($img.Width * $scale)
        $newHeight = [Math]::Floor($img.Height * $scale)
        $x = ($size.Width - $newWidth) / 2
        $y = ($size.Height - $newHeight) / 2
        
        # Draw scaled image
        $graphics.DrawImage($img, $x, $y, $newWidth, $newHeight)
        
        # Save with PNG encoder
        $pngEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | 
            Where-Object { $_.MimeType -eq 'image/png' }
        $encoderParameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
            [System.Drawing.Imaging.ImageCodecInfo]::Quality, 95)
        
        $newImg.Save($outputPath, $pngEncoder, $encoderParameters)
        
        # Clean up
        $img.Dispose()
        $newImg.Dispose()
        $graphics.Dispose()
        
        Write-Host "Created optimized $filename"
    }
    catch {
        Write-Host "Error creating $filename: $_"
    }
}

Write-Host "Logo optimization complete!"
