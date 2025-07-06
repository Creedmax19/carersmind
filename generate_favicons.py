from PIL import Image
import os

def create_favicons(logo_path, output_dir):
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Open the logo
    try:
        logo = Image.open(logo_path)
        # Convert to RGBA if not already to handle transparency
        if logo.mode != 'RGBA':
            logo = logo.convert('RGBA')
    except Exception as e:
        print(f"Error opening logo: {e}")
        return
    
    # Define sizes for different favicon types
    sizes = {
        'favicon.ico': [(16, 16), (32, 32), (48, 48)],
        'favicon-16x16.png': (16, 16),
        'favicon-32x32.png': (32, 32),
        'apple-touch-icon.png': (180, 180),
        'favicon-192x192.png': (192, 192),
        'favicon-512x512.png': (512, 512)
    }
    
    # Generate each favicon
    for filename, size in sizes.items():
        try:
            output_path = os.path.join(output_dir, filename)
            if filename.endswith('.ico'):
                # For ICO, save all sizes in one file
                logo_ico = logo.copy()
                logo_ico.thumbnail((48, 48))  # Resize to largest needed size
                logo_ico.save(output_path, format='ICO', sizes=[s for s in sizes[filename]])
            else:
                # For PNGs, resize and save
                img = logo.copy()
                img.thumbnail(size, Image.LANCZOS)
                
                # Create a white background for apple-touch-icon
                if filename == 'apple-touch-icon.png':
                    background = Image.new('RGBA', size, (255, 255, 255, 255))
                    # Calculate position to center the logo
                    img.thumbnail((size[0] - 40, size[1] - 40), Image.LANCZOS)  # Add some padding
                    position = ((size[0] - img.size[0]) // 2, (size[1] - img.size[1]) // 2)
                    background.paste(img, position, img)
                    img = background
                
                img.save(output_path, 'PNG')
            print(f"Created: {output_path}")
        except Exception as e:
            print(f"Error creating {filename}: {e}")

if __name__ == "__main__":
    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Define paths
    logo_path = os.path.join(script_dir, 'docs', 'images', 'logo-removebg-preview.png')
    output_dir = os.path.join(script_dir, 'docs', 'images')
    
    print(f"Source logo: {logo_path}")
    print(f"Output directory: {output_dir}")
    
    # Check if source logo exists
    if not os.path.exists(logo_path):
        print(f"Error: Source logo not found at {logo_path}")
    else:
        create_favicons(logo_path, output_dir)
