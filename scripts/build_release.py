"""Build what a release attaches: from the tag, and from nothing else.

    python scripts/build_release.py v1.2.3      writes dist/pocket-band-1.2.3-source.zip
                                                and dist/pocket-band.html

.github/workflows/release.yml runs this after every check has passed, and attaches whatever
is in dist/ to a draft release.

IT BUILDS TWO FILES. The source: the tracked files as they were at the tag, in one zip. And
the player: the one self-contained page that people download and open, made by the tag's own
scripts/export_html.py from the tag's own src/. Its name has no version in it, because the
README links to it by that name in the latest release. Three properties hold for both, and
tests/test_release.py holds each of them:

1. THE BUILD IS MADE FROM THE TAG, never from the working tree. A tree on a maintainer's
   machine has edits that are not committed and commits made after the tag.
2. dist/ HOLDS ONLY WHAT THIS BUILD MADE. The workflow attaches everything in it, so a file
   left by an earlier build would be attached under this release's name.
3. NOTHING GIT IGNORES IS INSIDE. A maintainer's working material is gitignored in a public
   repository; an archive of the tag cannot contain what was never committed.
"""

import argparse
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

# Run as a script or imported by its tests, release_notes is this file's neighbour. The rule
# for what a tag looks like is read from it, never written a second time.
sys.path.insert(0, str(Path(__file__).resolve().parent))
import release_notes  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]

# The repository's name. When a project is made from this template, the script that sets the
# project up replaces this text. Until then project_name() uses the folder's name.
PROJECT = "pocket-band"

# The player a release attaches, and the script at the tag that makes it.
PLAYER = "pocket-band.html"
EXPORTER = "scripts/export_html.py"
EXPORT_SECONDS = 120


def project_name(root: Path) -> str:
    """Return the configured project name, or the repository folder name as a fallback.

    Templates begin with a placeholder PROJECT name. Once initialized, PROJECT is set to
    the repository's name; until then, the folder name provides the default identity.
    """
    if not PROJECT.startswith("<"):
        return PROJECT
    return Path(root).name


def archive_name(project: str, version: str) -> str:
    """Return the release archive filename combining project name and version.

    Releases are packaged as zip files containing the tagged source code with a standard
    naming convention for distribution.
    """
    return f"{project}-{version}-source.zip"


def build(root: Path, tag: str) -> Path:
    """Build a zip archive from git at `tag` inside `root / 'dist'` and return its path.

    Validates that the tag conforms to the version schema and exists in the repository
    before touching dist/. Recreates dist/ to ensure only this release artifact is present,
    and archives tracked files from git at the tag.
    """
    root = Path(root)

    try:
        version = release_notes.version_of(tag)
    except ValueError as err:
        raise SystemExit(f"Malformed tag {tag!r}: {err}")

    proc = subprocess.run(
        ["git", "rev-parse", "--verify", "--quiet", f"refs/tags/{tag}"],
        cwd=root,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    # BEFORE dist/ IS TOUCHED: a build that is refused leaves nothing behind, and leaves the
    # last good build where it was.
    if proc.returncode != 0:
        detail = (proc.stderr or "").strip()
        raise SystemExit(f"Tag {tag} does not exist in the repository at {root}"
                         + (f": {detail}" if detail else ". Create the tag first: the build is made from it."))

    # Emptied whole, then made again: see property 2 at the top of this file.
    dist = root / "dist"
    try:
        if dist.exists():
            shutil.rmtree(dist)
        dist.mkdir(parents=True, exist_ok=True)
    except OSError as err:
        raise SystemExit(f"dist/ could not be emptied: {err}")

    proj = project_name(root)
    archive = dist / archive_name(proj, version)
    # core.autocrlf=false: `git archive` writes files the way a checkout would, so on a
    # machine set to convert line endings the archive would hold CRLF where the commit
    # holds LF. The archive is the committed bytes, the same on every machine.
    cmd = [
        "git",
        "-c",
        "core.autocrlf=false",
        "archive",
        "--format=zip",
        f"--prefix={proj}-{version}/",
        "-o",
        str(archive),
        tag,
    ]
    done = subprocess.run(
        cmd,
        cwd=root,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if done.returncode != 0:
        if archive.exists():
            archive.unlink()
        raise SystemExit(f"git archive failed: {done.stderr.strip()}")

    try:
        _export_player(archive, f"{proj}-{version}/", dist / PLAYER)
    except SystemExit:
        # Half a release is not attached: dist/ is left empty, and the workflow stops here.
        shutil.rmtree(dist, ignore_errors=True)
        dist.mkdir(parents=True, exist_ok=True)
        raise

    return archive


def _export_player(archive: Path, prefix: str, out: Path) -> None:
    """Run the tag's own exporter, unpacked from the source archive, to write the player.

    The archive is what the tag holds, so the player is made from the tag, never from the
    working tree. A tag without the exporter is refused: a release without its player would
    break the README's download link without a word.
    """
    with tempfile.TemporaryDirectory() as folder:
        with zipfile.ZipFile(archive) as held:
            held.extractall(folder)
        exporter = Path(folder) / prefix / EXPORTER
        if not exporter.is_file():
            raise SystemExit(f"the tag has no {EXPORTER}: the player cannot be built from it")
        try:
            done = subprocess.run([sys.executable, str(exporter), str(out)], cwd=exporter.parents[1],
                                  capture_output=True, text=True, encoding="utf-8", errors="replace",
                                  timeout=EXPORT_SECONDS)
        except subprocess.TimeoutExpired:
            raise SystemExit(f"{EXPORTER} ran over {EXPORT_SECONDS} s and was stopped")
    if done.returncode != 0 or not out.is_file():
        raise SystemExit(f"{EXPORTER} did not write {out.name}: {(done.stderr or done.stdout).strip()}")


def main(argv: list[str] | None = None) -> int:
    """Entry point for the release build command line tool.

    Parses the version tag argument, builds the release archive from git at that tag,
    and outputs the relative archive path and byte size.
    """
    parser = argparse.ArgumentParser(
        description="Build a release archive from a git tag."
    )
    parser.add_argument("tag", help="Release tag to build (e.g. v1.2.3)")
    args = parser.parse_args(argv)

    archive = build(ROOT, args.tag)
    for built in sorted(archive.parent.iterdir()):
        print(f"{built.relative_to(ROOT).as_posix()} ({built.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
