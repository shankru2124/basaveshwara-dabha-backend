import uuid
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.config import settings
from app.utils.security import get_optional_user

router = APIRouter(prefix="/upload", tags=["Media Upload"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".jfif", ".svg", ".bmp", ".gif", ".avif"}
MIME_TO_EXT = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "image/bmp": ".bmp",
    "image/gif": ".gif",
    "image/avif": ".avif"
}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB max to support high-res smartphone camera QR photos

@router.post("")
@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    user: Optional[dict] = Depends(get_optional_user)
):
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    file_ext = Path(file.filename or "").suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        # Fallback to MIME type detection
        content_type = file.content_type or ""
        if content_type in MIME_TO_EXT:
            file_ext = MIME_TO_EXT[content_type]
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format '{file_ext or file.content_type}'. Please upload JPG, PNG, WEBP, or SVG."
            )

    # Read and validate size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({len(contents) // (1024*1024)}MB). Maximum allowed size is 25MB."
        )

    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    filename = f"{uuid.uuid4().hex}{file_ext}"
    dest_path = settings.UPLOAD_DIR / filename
    with open(dest_path, "wb") as f:
        f.write(contents)

    image_url = f"/uploads/{filename}"
    return {
        "url": image_url,
        "filename": filename,
        "size": len(contents)
    }
