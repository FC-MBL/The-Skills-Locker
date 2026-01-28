from firebase_functions import https_fn
from firebase_admin import initialize_app
import io
import base64

initialize_app()

@https_fn.on_call(memory=1024, timeout_sec=60)
def process_image(req: https_fn.CallableRequest) -> any:
    """
    Receives an image (Base64 string or URL), removes background,
    and applies a high-contrast 'posterized' style effect.
    """
    # Lazy imports to prevent cold start/deployment timeout
    from rembg import remove, new_session
    from PIL import Image, ImageOps, ImageFilter, ImageChops
    import numpy as np

    try:
        data = req.data
        image_data = data.get("image")
        
        if not image_data:
            return {"error": "No image data provided"}

        # Decode base64 if provided, or handle URL (future)
        # Assuming client sends Base64 for now
        if "base64," in image_data:
            image_data = image_data.split("base64,")[1]
        
        input_bytes = base64.b64decode(image_data)
        
        # 1. Background Removal
        # rembg expects bytes and returns bytes
        try:
            session = new_session("u2net_human_seg")
            output_bytes = remove(
                input_bytes,
                session=session,
                alpha_matting=True,
                alpha_matting_foreground_threshold=240,
                alpha_matting_background_threshold=10,
                alpha_matting_erode_size=10,
                post_process_mask=True
            )
        except Exception as e:
            print(f"Background removal (human_seg) failed: {e}")
            output_bytes = remove(input_bytes)
        
        # 2. Image Processing (Pillow)
        img = Image.open(io.BytesIO(output_bytes)).convert("RGBA")
        
        # Create a white outline effect
        # Simple approach: Create a larger white copy behind (stroke simulation)
        # OR using simple drop shadow if client prefers, but "deep etch white outline" usually means stroke.
        # Let's do a stroke effect.
        
        # Extract alpha channel
        r, g, b, a = img.split()
        
        # Threshold alpha to get a hard mask
        mask = a.point(lambda x: 255 if x > 10 else 0)
        
        gray_img = ImageOps.grayscale(img)
        # High contrast ("Posterized" look)
        contrast = ImageOps.autocontrast(gray_img, cutoff=5)
        # Maybe explicit posterize?
        poster = ImageOps.posterize(contrast, bits=4) 
        # Converting back to RGBA to keep transparency
        processed_img = poster.convert("RGBA")
        processed_img.putalpha(a)

        # Create a white stroke outline by dilating the mask
        dilated = mask.filter(ImageFilter.MaxFilter(9))
        outline_alpha = ImageChops.subtract(dilated, mask)
        outline = Image.new("RGBA", processed_img.size, (255, 255, 255, 0))
        outline.putalpha(outline_alpha)

        # Composite outline behind the processed image
        processed_img = Image.alpha_composite(outline, processed_img)
        
        # Return processed image as Base64
        buffered = io.BytesIO()
        processed_img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        return {"image": f"data:image/png;base64,{img_str}"}

    except Exception as e:
        print(f"Error processing image: {e}")
        return {"error": str(e)}
