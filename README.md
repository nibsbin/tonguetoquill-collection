# Tonguetoquill Collection

Quills for the Tonguetoquill project. Less formatting. More lethality.

## Getting Started

### Downloading release artifacts from GitHub Releases

Release assets are published as zip files. Quill archives are prefixed with `quill-` (for example `quill-usaf_memo.zip`) to avoid name collisions. The repository also publishes a `templates.zip` if templates are present and a `manifest.txt` that lists the released artifact filenames and their sources.

#### Using curl or wget

Download a specific quill from the latest release:

```bash
# Download the usaf_memo quill (note the quill- prefix)
curl -LO https://github.com/nibsbin/tonguetoquill-collection/releases/latest/download/quill-usaf_memo.zip

# Or using wget
wget https://github.com/nibsbin/tonguetoquill-collection/releases/latest/download/quill-usaf_memo.zip
```

Download `templates.zip` from the latest release:

```bash
curl -LO https://github.com/nibsbin/tonguetoquill-collection/releases/latest/download/templates.zip
```

Download the manifest to see all available artifacts (the manifest contains lines like `quill-usaf_memo.zip : usaf_memo`):

```bash
curl -LO https://github.com/nibsbin/tonguetoquill-collection/releases/latest/download/manifest.txt
```

#### Using GitHub CLI (gh)

```bash
# Download all release assets
gh release download --repo nibsbin/tonguetoquill-collection

# Download a specific quill by pattern
gh release download --repo nibsbin/tonguetoquill-collection --pattern "quill-usaf_memo.zip"

# Download templates.zip
gh release download --repo nibsbin/tonguetoquill-collection --pattern "templates.zip"
```

#### Using the API

Fetch the latest release information (assets are listed in the JSON response):

```bash
curl -s https://api.github.com/repos/nibsbin/tonguetoquill-collection/releases/latest
```

## Notes & Rules

- Artifact naming: quill archives are named `quill-<name>.zip`. Templates (if present) are published as `templates.zip`. The `manifest.txt` maps artifact filenames to their source directories.
- Do not add proprietary or licensed content without permission.
