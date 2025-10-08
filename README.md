# Tonguetoquill Collection

Quills for the Tonguetoquill project. Less formatting. More lethality.

## Getting Started

### Downloading release artifacts from GitHub Releases

Release assets are published as zip files. Quill archives are prefixed with `quill__` (for example `quill__usaf_memo.zip`) to avoid name collisions. The repository also publishes a `templates.zip` if templates are present and a `manifest.json` that lists the released artifact filenames and their sources.

#### Using curl or wget

Download a specific quill from the latest release:

```bash
# Download the usaf_memo quill (note the quill__ prefix)
curl -LO https://github.com/nibsbin/tonguetoquill__collection/releases/latest/download/quill__usaf_memo.zip

# Or using wget
wget https://github.com/nibsbin/tonguetoquill__collection/releases/latest/download/quill__usaf_memo.zip
```

Download `templates.zip` from the latest release:

```bash
curl -LO https://github.com/nibsbin/tonguetoquill__collection/releases/latest/download/templates.zip
```

Download the JSON manifest to see all available artifacts (example entry):

```json
[
	{"file":"quill__usaf_memo.zip","source":"usaf_memo"},
	{"file":"templates.zip","source":"templates"}
]
```

```bash
curl -LO https://github.com/nibsbin/tonguetoquill__collection/releases/latest/download/manifest.json
```

#### Using GitHub CLI (gh)

```bash
# Download all release assets
gh release download --repo nibsbin/tonguetoquill__collection

# Download a specific quill by pattern
gh release download --repo nibsbin/tonguetoquill__collection --pattern "quill__usaf_memo.zip"

# Download templates.zip
gh release download --repo nibsbin/tonguetoquill__collection --pattern "templates.zip"
```

#### Using the API

Fetch the latest release information (assets are listed in the JSON response):

```bash
curl -s https://api.github.com/repos/nibsbin/tonguetoquill__collection/releases/latest
```

## Notes & Rules

- Artifact naming: quill archives are named `quill__<name>.zip`. Templates (if present) are published as `templates.zip`. The `manifest.json` contains an array of objects with fields `file` and `source`.
- Do not add proprietary or licensed content without permission.
