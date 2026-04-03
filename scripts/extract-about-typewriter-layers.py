#!/usr/bin/env python3
"""
Split composite reference into three transparent PNGs (edge flood-fill matting).
Re-run after replacing public/images/about-typewriter-composite-source.png.
"""

from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public/images/about-typewriter-composite-source.png"
OUT = ROOT / "public/images"

# Vertical splits (source height 1024): base | paper | front
Y_BASE_END = 352
Y_PAPER_END = 690


def flood_background_mask(rgb: np.ndarray, tol: float = 10.0) -> np.ndarray:
    """Pixels connected to edges that match near-white background."""
    h, w, _ = rgb.shape
    visited = np.zeros((h, w), dtype=bool)
    bg = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        q.append((0, x))
        q.append((h - 1, x))
    for y in range(h):
        q.append((y, 0))
        q.append((y, w - 1))
    ref = np.array([253.0, 253.0, 253.0], dtype=np.float32)
    while q:
        y, x = q.popleft()
        if visited[y, x]:
            continue
        visited[y, x] = True
        if np.abs(rgb[y, x].astype(np.float32) - ref).max() > tol:
            continue
        bg[y, x] = True
        if y > 0:
            q.append((y - 1, x))
        if y < h - 1:
            q.append((y + 1, x))
        if x > 0:
            q.append((y, x - 1))
        if x < w - 1:
            q.append((y, x + 1))
    return bg


def rgba_from_crop(crop: np.ndarray) -> Image.Image:
    bg = flood_background_mask(crop, tol=10.0)
    opaque = ~bg
    a = (opaque.astype(np.uint8) * 255)
    r, g, b = crop[:, :, 0], crop[:, :, 1], crop[:, :, 2]
    rgba = np.stack([r, g, b, a], axis=-1)
    return Image.fromarray(rgba, mode="RGBA")


def main() -> None:
    if not SRC.is_file():
        raise SystemExit(f"Missing source: {SRC}")
    im = Image.open(SRC).convert("RGB")
    arr = np.array(im)
    h, w, _ = arr.shape
    assert h == 1024 and w == 682, f"Unexpected size {w}x{h}"

    base = arr[0:Y_BASE_END, :]
    paper = arr[Y_BASE_END:Y_PAPER_END, :]
    front = arr[Y_PAPER_END:h, :]

    OUT.mkdir(parents=True, exist_ok=True)
    rgba_from_crop(base).save(OUT / "about-typewriter-base.png", optimize=True)
    rgba_from_crop(paper).save(OUT / "about-typewriter-paper.png", optimize=True)
    rgba_from_crop(front).save(OUT / "about-typewriter-front.png", optimize=True)

    print("Wrote:")
    for name in (
        "about-typewriter-base.png",
        "about-typewriter-paper.png",
        "about-typewriter-front.png",
    ):
        p = OUT / name
        imo = Image.open(p)
        print(f"  {name}  {imo.size[0]}x{imo.size[1]}  {imo.mode}")


if __name__ == "__main__":
    main()
