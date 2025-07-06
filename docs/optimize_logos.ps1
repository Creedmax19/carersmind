# Create images directory if it doesn't exist
$imagesDir = Join-Path $PSScriptRoot "images"
if (-not (Test-Path $imagesDir)) {
    New-Item -ItemType Directory -Path $imagesDir -Force
}

# Copy original logo to main logo
$originalLogo = Join-Path $imagesDir "logo.jpg"
$mainLogo = Join-Path $imagesDir "logo.png"
Copy-Item -Path $originalLogo -Destination $mainLogo -Force

# Create favicon sizes
$iconSizes = @{
    "favicon-32x32.png" = @{ Width = 32; Height = 32 }
    "favicon-16x16.png" = @{ Width = 16; Height = 16 }
    "apple-touch-icon.png" = @{ Width = 180; Height = 180 }
    "favicon-192x192.png" = @{ Width = 192; Height = 192 }
    "favicon-512x512.png" = @{ Width = 512; Height = 512 }
}

# Create optimized versions of the logo
foreach ($filename in $iconSizes.Keys) {
    $outputPath = Join-Path $imagesDir $filename
    Copy-Item -Path $originalLogo -Destination $outputPath -Force
}

Write-Host "Logo optimization complete!"
