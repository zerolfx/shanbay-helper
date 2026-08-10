#!/usr/bin/env python3
"""Build a deterministic Chrome Web Store ZIP for Shanbay Helper."""

from __future__ import annotations

import argparse
import json
from pathlib import Path, PurePosixPath
from zipfile import ZIP_STORED, ZipFile, ZipInfo


PROJECT_ROOT = Path(__file__).resolve().parents[1]
PACKAGE_FILES = (
    Path("manifest.json"),
    Path("src/css/words.css"),
    Path("src/js/background.js"),
    Path("src/js/words.js"),
    Path("static/icon128.png"),
    Path("THIRD_PARTY_NOTICES.md"),
    Path("third-party/hyphen-LICENSE.txt"),
    Path("third-party/hyphen-en-us.js"),
    Path("third-party/hyphen.js"),
)
FIXED_TIMESTAMP = (1980, 1, 1, 0, 0, 0)


def extension_files() -> list[Path]:
    files: list[Path] = []
    archive_names: set[str] = set()
    for relative_path in PACKAGE_FILES:
        path = PROJECT_ROOT / relative_path
        if not path.is_file() or path.is_symlink():
            raise SystemExit(f"Required package file is missing or invalid: {relative_path}")
        archive_name = relative_path.as_posix()
        folded_name = archive_name.casefold()
        if folded_name in archive_names:
            raise SystemExit(f"Duplicate package path: {archive_name}")
        archive_names.add(folded_name)
        files.append(path)
    return sorted(files, key=lambda item: item.relative_to(PROJECT_ROOT).as_posix())


def manifest_references(manifest: dict) -> set[str]:
    references: set[str] = set(manifest.get("icons", {}).values())
    action = manifest.get("action", {})
    for key in ("default_icon", "default_popup"):
        value = action.get(key)
        if isinstance(value, str):
            references.add(value)
        elif isinstance(value, dict):
            references.update(value.values())

    background = manifest.get("background", {})
    if isinstance(background.get("service_worker"), str):
        references.add(background["service_worker"])

    for content_script in manifest.get("content_scripts", []):
        references.update(content_script.get("css", []))
        references.update(content_script.get("js", []))
    return references


def validate_manifest() -> dict:
    manifest_path = PROJECT_ROOT / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("manifest_version") != 3:
        raise SystemExit("Chrome Web Store builds must use Manifest V3")

    package = json.loads((PROJECT_ROOT / "package.json").read_text(encoding="utf-8"))
    if manifest.get("version") != package.get("version"):
        raise SystemExit("manifest.json and package.json versions do not match")

    missing = sorted(
        reference
        for reference in manifest_references(manifest)
        if not (PROJECT_ROOT / PurePosixPath(reference)).is_file()
    )
    if missing:
        raise SystemExit(f"Manifest references missing files: {', '.join(missing)}")
    return manifest


def write_archive(output_path: Path, files: list[Path]) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(output_path, "w", compression=ZIP_STORED) as archive:
        for path in files:
            archive_name = path.relative_to(PROJECT_ROOT).as_posix()
            info = ZipInfo(archive_name, FIXED_TIMESTAMP)
            info.compress_type = ZIP_STORED
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            archive.writestr(info, path.read_bytes(), compress_type=ZIP_STORED)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=PROJECT_ROOT / "dist",
        help="Directory in which to place the extension ZIP",
    )
    args = parser.parse_args()

    manifest = validate_manifest()
    output_path = args.output_dir.resolve() / f"shanbay-helper-{manifest['version']}.zip"
    files = extension_files()
    write_archive(output_path, files)
    print(f"Built {output_path} ({len(files)} files)")


if __name__ == "__main__":
    main()
