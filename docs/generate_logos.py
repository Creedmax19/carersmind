import os
from PIL import Image
from pathlib import Path

def create_logos():
    # Create images directory if it doesn't exist
    images_dir = Path("images")
    images_dir.mkdir(exist_ok=True)
    
    # Define logo sizes and filenames
    logo_sizes = {
        "logo.png": (512, 512),  # Main logo
        "favicon-32x32.png": (32, 32),
        "favicon-16x16.png": (16, 16),
        "apple-touch-icon.png": (180, 180),
        "favicon-192x192.png": (192, 192),
        "favicon-512x512.png": (512, 512)
    }
    
    # Create optimized versions of the logo
    for filename, size in logo_sizes.items():
        try:
            # Open the original logo
            img = Image.open("images/logo.jpg")
            
            # Resize and optimize
            img = img.resize(size, Image.Resampling.LANCZOS)
            
            # Save with optimization
            img.save(
                images_dir / filename,
                format="PNG",
                optimize=True,
                quality=95
            )
            print(f"Created {filename}")
            
        except Exception as e:
            print(f"Error creating {filename}: {str(e)}")

if __name__ == "__main__":
    create_logos()
