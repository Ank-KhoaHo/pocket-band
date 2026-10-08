# Contributing to pocket-band

This project has a [Code of Conduct](CODE_OF_CONDUCT.md). By participating you are expected to
uphold it.

Thanks for considering a contribution. This file explains what will get a change rejected, not
just the mechanics of building and testing it.

## Building and testing

There is no build step. The whole player is [`src/index.html`](src/index.html): edit it, then
open it in a browser and listen. A change to the music is only checked by hearing it.

The repository's own checks are a docs guard:

```bash
python -m pytest
```

## Branching and pull requests

There is one branch: `main`. Branch from it, make your change, and open a pull request back
into it — there is no direct push and no second way in.

Rebasing onto `main` is preferred over merging it in, for a history that stays easy to read:

```
git pull --rebase origin main
```

## Commit messages

Explain **why** a change was made, not just what changed — the diff already says what. Never
add a `Co-Authored-By` trailer.

**Never summarise what a change hid.** If a commit touches anything this repository keeps
private — see [PUBLIC.md](PUBLIC.md) — its message describes the change, not the material. A
commit message is published exactly like a file, permanently, and a summary of what was
withheld is the same leak wearing different clothes.

## What gets a pull request rejected

- **It publishes working material.** [PUBLIC.md](PUBLIC.md) explains why that material is
  absent; a change that adds it back — even by accident, even only in a commit message — is
  rejected on sight. `python scripts/check_leaks.py` checks the staged diff, the commit
  messages and `.gitignore` for exactly this before you push.
- **It has no explanation.** A change nobody can review for intent gets sent back for one,
  however small the diff.
- **It changes behaviour without changing what the project says about itself.** If a change
  makes a documented limitation untrue, or makes an existing claim untrue, the documentation
  moves in the same pull request, not as a follow-up.

## Review

This project also keeps a further review checklist for its own maintainers. It is not
published, so anything in it that a contributor genuinely needs to know belongs in this file
instead — if you hit a rule that feels undocumented, that is a gap in this file, worth an issue
of its own.

## Questions

Open an issue. If you are unsure whether a change fits, ask before writing it — that is a
cheaper conversation than a rejected pull request.
