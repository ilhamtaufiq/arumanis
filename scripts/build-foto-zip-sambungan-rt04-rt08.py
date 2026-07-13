"""Extract foto 0% from DAFTAR PENERIMA PDFs and pack as import ZIP.

Naming matches template_import_sambungan_rumah_RT04_RT08_ciloto.xlsx:
  001_0.jpg … 029_0.jpg  → RT08 (29 foto)
  030_0.jpg … 055_0.jpg  → RT04 (26 foto)
"""

from __future__ import annotations

import io
import zipfile
from pathlib import Path

import fitz  # PyMuPDF
from PIL import Image

RT08_PDF = Path(r"C:\Users\asusg\Downloads\DAFTAR PERIMA RT08.pdf")
RT04_PDF = Path(r"C:\Users\asusg\Downloads\DAFTAR PERIMA RT04.pdf")
OUT_ZIP = Path(r"C:\Users\asusg\Downloads\foto_sambungan_rumah_0_RT04_RT08_ciloto.zip")
OUT_DIR = Path(r"C:\Users\asusg\Downloads\foto_sambungan_rumah_0_RT04_RT08_ciloto")


def extract_page_photos(doc: fitz.Document, page_index: int) -> list[Image.Image]:
    page = doc[page_index]
    blocks = [b for b in page.get_text("dict")["blocks"] if b.get("type") == 1]
    # Top-to-bottom (then left-to-right) = urutan baris penerima di PDF
    blocks.sort(key=lambda b: (round(b["bbox"][1], 1), round(b["bbox"][0], 1)))

    images: list[Image.Image] = []
    for block in blocks:
        # Prefer raw image bytes from block when present
        image_bytes = block.get("image")
        if image_bytes:
            img = Image.open(io.BytesIO(image_bytes))
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")
            elif img.mode == "L":
                img = img.convert("RGB")
            images.append(img)
            continue

        # Fallback: clip page region of the photo cell
        rect = fitz.Rect(block["bbox"])
        pix = page.get_pixmap(clip=rect, matrix=fitz.Matrix(2, 2), alpha=False)
        img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        images.append(img)

    return images


def extract_all(pdf_path: Path) -> list[Image.Image]:
    doc = fitz.open(pdf_path)
    photos: list[Image.Image] = []
    for i in range(doc.page_count):
        page_photos = extract_page_photos(doc, i)
        photos.extend(page_photos)
        print(f"  {pdf_path.name} page {i + 1}: {len(page_photos)} foto")
    doc.close()
    return photos


def save_jpeg(img: Image.Image, path: Path, quality: int = 90) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if img.mode != "RGB":
        img = img.convert("RGB")
    img.save(path, format="JPEG", quality=quality, optimize=True)


def main() -> None:
    print("Extract RT08…")
    rt08 = extract_all(RT08_PDF)
    print("Extract RT04…")
    rt04 = extract_all(RT04_PDF)

    if len(rt08) != 29:
        raise SystemExit(f"RT08 expected 29 photos, got {len(rt08)}")
    if len(rt04) != 26:
        raise SystemExit(f"RT04 expected 26 photos, got {len(rt04)}")

    all_photos = rt08 + rt04  # 001–029 then 030–055
    print(f"Total foto: {len(all_photos)}")

    if OUT_DIR.exists():
        for old in OUT_DIR.glob("*.jpg"):
            old.unlink()
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    names: list[str] = []
    for i, img in enumerate(all_photos, start=1):
        name = f"{i:03d}_0.jpg"
        save_jpeg(img, OUT_DIR / name)
        names.append(name)

    if OUT_ZIP.exists():
        OUT_ZIP.unlink()

    with zipfile.ZipFile(OUT_ZIP, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for name in names:
            zf.write(OUT_DIR / name, arcname=name)

    size_mb = OUT_ZIP.stat().st_size / (1024 * 1024)
    print(f"Folder: {OUT_DIR}")
    print(f"ZIP:    {OUT_ZIP} ({size_mb:.2f} MB)")
    print(f"Files:  {names[0]} … {names[-1]}")


if __name__ == "__main__":
    main()
