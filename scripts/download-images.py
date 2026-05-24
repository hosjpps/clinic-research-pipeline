#!/usr/bin/env python3
"""
Download images from URL list (JSON array) into target dir.

Usage:
  python3 download-images.py <urls_json> <output_dir> [prefix]
"""
import json
import os
import sys
import urllib.request
from pathlib import Path

if len(sys.argv) < 3:
    print("Usage: python3 download-images.py <urls_json> <output_dir> [prefix]")
    sys.exit(1)

URLS_JSON = Path(sys.argv[1])
OUT_DIR = Path(sys.argv[2])
PREFIX = sys.argv[3] if len(sys.argv) > 3 else 'img'

data = json.load(open(URLS_JSON, 'r', encoding='utf-8'))
urls = data.get('urls', data) if isinstance(data, dict) else data

OUT_DIR.mkdir(parents=True, exist_ok=True)

for i, url in enumerate(urls):
    out = OUT_DIR / f"{PREFIX}_{i:02d}.jpg"
    if out.exists():
        continue
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=20) as r:
            with open(out, 'wb') as f:
                f.write(r.read())
        print(f"  {i:02d} ok")
    except Exception as e:
        print(f"  {i:02d} fail: {e}")
print(f"Done. {OUT_DIR}/")
