#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IM_DIR = ROOT / "public/images"

OUT_BODY = IM_DIR / "about-typewriter-body-static.png"
OUT_PAPER_TMPL = IM_DIR / "about-typewriter-paper-frame-{i}.png"

FRAMES = [
    IM_DIR / "about-typewriter-frame-1.png",
    IM_DIR / "about-typewriter-frame-2.png",
    IM_DIR / "about-typewriter-frame-3.png",
    IM_DIR / "about-typewriter-frame-4.png",
]

# Background is pure black in these keyframes.
LUM_THR = 2.5  # non-black threshold
# How much a pixel must differ from the base frame to be considered "paper".
DIFF_LUM_THR = 12.0

PADDING = 14


def lum(rgb: np.ndarray) -> np.ndarray:
    # rgb: HxWx3
    return 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]


def main() -> None:
    imgs = []
    lums = []
    for p in FRAMES:
        im = Image.open(p).convert("RGB")
        arr = np.array(im).astype(np.float32)
        imgs.append(arr)
        lums.append(lum(arr))

    base = imgs[0]
    base_l = lums[0]

    base_mask = base_l > LUM_THR

    # Body: fixed machine content from base frame.
    # Alpha = where base contains any drawing.
    body_rgba = np.dstack([base, np.where(base_mask, 255, 0).astype(np.uint8)])

    paper_masks: list[np.ndarray] = []
    for i in range(4):
        cur_l = lums[i]
        cur_mask = cur_l > LUM_THR

        # luminance delta to base
        delta = np.abs(cur_l - base_l)

        # paper appears where the current frame has content but it differs from the base
        # (or where base was background)
        paper_mask = cur_mask & ((delta > DIFF_LUM_THR) | (~base_mask))

        paper_masks.append(paper_mask)

    # Union bbox across body and all paper masks
    union_mask = base_mask.copy()
    for pm in paper_masks:
        union_mask |= pm

    ys, xs = np.where(union_mask)
    if ys.size == 0:
        raise SystemExit("Could not find object pixels")

    y0, y1 = ys.min(), ys.max()
    x0, x1 = xs.min(), xs.max()

    y0 = max(0, y0 - PADDING)
    x0 = max(0, x0 - PADDING)
    y1 = min(union_mask.shape[0] - 1, y1 + PADDING)
    x1 = min(union_mask.shape[1] - 1, x1 + PADDING)

    # Crop box for PIL: (left, upper, right, lower) with right/lower exclusive.
    crop_box = (int(x0), int(y0), int(x1) + 1, int(y1) + 1)

    # Save body
    cx0, cy0, cx1, cy1 = crop_box
    body_crop = body_rgba[cy0:cy1, cx0:cx1, :]
    Image.fromarray(body_crop, mode="RGBA").save(OUT_BODY, optimize=True)

    # Save paper frames
    for i in range(4):
        cur = imgs[i]
        pm = paper_masks[i]
        alpha = np.where(pm, 255, 0).astype(np.uint8)
        paper_rgba = np.dstack([cur, alpha])
        paper_crop = paper_rgba[cy0:cy1, cx0:cx1, :]
        outp = OUT_PAPER_TMPL.as_posix().format(i=i + 1)
        Image.fromarray(paper_crop, mode="RGBA").save(outp, optimize=True)

    # Print quick diagnostics
    print("Derived assets written:")
    print(" body:", OUT_BODY.relative_to(ROOT))
    for i in range(1, 5):
        print(" paper-", i, ":", OUT_PAPER_TMPL.as_posix().format(i=i).split(str(IM_DIR))[-1])

    def alpha_stats(pth: Path):
        im = Image.open(pth).convert("RGBA")
        a = np.array(im)[..., 3]
        return im.size, int(a.min()), int(a.max()), float((a > 0).mean())

    print(" body stats:", alpha_stats(OUT_BODY))
    for i in range(1, 5):
        pth = Path(OUT_PAPER_TMPL.as_posix().format(i=i))
        print(f" paper {i} stats:", alpha_stats(pth))
    print(" crop_box:", crop_box)


if __name__ == "__main__":
    main()
