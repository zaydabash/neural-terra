#!/usr/bin/env python3
"""
Snapshot integrity checker for Neural Terra.
Computes SHA256 hashes for all files in data/snapshots/ and validates against manifest.
"""

import hashlib
import json
import pathlib
import sys
from typing import Dict

def sha256(p: pathlib.Path) -> str:
    """Compute SHA256 hash of a file."""
    h = hashlib.sha256()
    with p.open("rb") as f:
        for chunk in iter(lambda: f.read(1<<20), b""):
            h.update(chunk)
    return h.hexdigest()

def main():
    """Main function to check snapshot integrity."""
    # Get project root (parent of scripts directory)
    root = pathlib.Path(__file__).resolve().parents[1]
    snapshots_dir = root / "data" / "snapshots"
    manifest_path = snapshots_dir.parent / "snapshots.manifest.json"
    
    if not snapshots_dir.exists():
        print(f"Error: Snapshots directory {snapshots_dir} does not exist")
        sys.exit(1)
    
    # Get all files in snapshots directory
    files = sorted([p for p in snapshots_dir.glob("*") if p.is_file()])
    
    if not files:
        print("Error: No snapshot files found")
        sys.exit(1)
    
    # Compute current hashes
    current_manifest = {p.name: sha256(p) for p in files}
    
    # Check against existing manifest if it exists
    if manifest_path.exists():
        try:
            existing_manifest = json.loads(manifest_path.read_text())
            if existing_manifest != current_manifest:
                print("❌ Snapshot hash mismatch detected!")
                print("\nExpected:")
                print(json.dumps(existing_manifest, indent=2))
                print("\nActual:")
                print(json.dumps(current_manifest, indent=2))
                sys.exit(1)
            else:
                print("✅ Snapshot hashes match manifest")
        except json.JSONDecodeError as e:
            print(f"Error parsing manifest: {e}")
            sys.exit(1)
    else:
        print("⚠️  No existing manifest found, creating new one")
    
    # Write/update manifest
    manifest_path.write_text(json.dumps(current_manifest, indent=2))
    print(f"📝 Updated manifest: {manifest_path}")
    
    # Print summary
    print(f"\n📊 Snapshot Summary:")
    print(f"   Files: {len(files)}")
    print(f"   Total size: {sum(f.stat().st_size for f in files):,} bytes")
    
    for file_path in files:
        size = file_path.stat().st_size
        hash_val = current_manifest[file_path.name]
        print(f"   {file_path.name}: {size:,} bytes, {hash_val[:8]}...")

if __name__ == "__main__":
    main()
