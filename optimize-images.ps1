# Load Windows Forms for image processing
Add-Type -AssemblyName System.Drawing

# Create optimized directory if it doesn't exist
$optimizedDir = "c:\Users\USER\Carer's-care CIC\docs\images\optimized"
if (-not (Test-Path $optimizedDir)) {
    New-Item -ItemType Directory -Path $optimizedDir -Force | Out-Null
}

# Function to optimize an image
function Optimize-Image {
    param (
        [string]$sourcePath,
        [int]$maxWidth = 800,
        [int]$quality = 80
    )
    
    try {
        # Load the original image
        $originalImage = [System.Drawing.Image]::FromFile($sourcePath)
        
        # Calculate new dimensions while maintaining aspect ratio
        $originalWidth = $originalImage.Width
        $originalHeight = $originalImage.Height
        $ratio = $originalWidth / $originalHeight
        
        $newWidth = [Math]::Min($originalWidth, $maxWidth)
        $newHeight = [int]($newWidth / $ratio)
        
        # Create a new bitmap with the new dimensions
        $bitmap = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        
        # Set high-quality rendering settings
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        
        # Draw the resized image
        $graphics.DrawImage($originalImage, 0, 0, $newWidth, $newHeight)
        
        # Get the output path
        $fileName = [System.IO.Path]::GetFileName($sourcePath)
        $outputPath = Join-Path $optimizedDir $fileName
        
        # Save the optimized image with quality settings
        $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.FormatDescription -eq 'JPEG' }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)
        
        $bitmap.Save($outputPath, $encoder, $encoderParams)
        
        # Clean up
        $graphics.Dispose()
        $bitmap.Dispose()
        $originalImage.Dispose()
        
        # Return the original and new file sizes
        $originalSize = (Get-Item $sourcePath).Length
        $newSize = (Get-Item $outputPath).Length
        
        return @{
            FileName = $fileName
            OriginalSizeKB = [math]::Round($originalSize / 1KB, 2)
            NewSizeKB = [math]::Round($newSize / 1KB, 2)
            SavingsKB = [math]::Round(($originalSize - $newSize) / 1KB, 2)
            SavingsPercent = [math]::Round((1 - ($newSize / $originalSize)) * 100, 2)
            OutputPath = $outputPath
        }
    }
    catch {
        Write-Error "Error processing $sourcePath : $_"
        return $null
    }
}

# Process each product image
$images = @(
    "c:\Users\USER\Carer's-care CIC\docs\images\mug.jpg"
    "c:\Users\USER\Carer's-care CIC\docs\images\cap.jpg"
    "c:\Users\USER\Carer's-care CIC\docs\images\t-shirt.jpg"
    "c:\Users\USER\Carer's-care CIC\docs\images\wristband.jpg"
)

$results = @()

foreach ($image in $images) {
    if (Test-Path $image) {
        $result = Optimize-Image -sourcePath $image -maxWidth 800 -quality 75
        if ($result) {
            $results += $result
        }
    }
    else {
        Write-Warning "File not found: $image"
    }
}

# Display optimization results
$results | Format-Table -AutoSize

# Ask if user wants to replace original files
if ($results.Count -gt 0) {
    $replace = Read-Host "Do you want to replace the original files with the optimized versions? (Y/N)"
    if ($replace -eq 'Y') {
        foreach ($result in $results) {
            if ($result.OutputPath) {
                $originalPath = Join-Path (Split-Path $result.OutputPath -Parent) "..\" (Split-Path $result.OutputPath -Leaf)
                Copy-Item -Path $result.OutputPath -Destination $originalPath -Force
                Write-Host "Replaced: $($result.FileName)" -ForegroundColor Green
            }
        }
        Write-Host "Original files have been replaced with optimized versions." -ForegroundColor Green
    }
    else {
        Write-Host "Original files were not modified. Optimized versions are saved in: $optimizedDir" -ForegroundColor Yellow
    }
}

Write-Host "Optimization complete!"
