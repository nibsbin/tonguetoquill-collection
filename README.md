# Tonguetoquill Collection

Quills for the Tonguetoquill project. Less formatting. More lethality.

## Getting Started

### Downloading release artifacts from GitHub Releases

Release assets are published as zip files. Quill archives are prefixed with `quill__` (for example `quill__usaf_memo.zip`) to avoid name collisions. The repository also publishes a `templates.zip` if templates are present and a `manifest.json` that lists the released artifact filenames and their sources.

Important: Consumers should always retrieve `manifest.json` first. The manifest lists the exact artifact filenames in the release and their logical `source` names; use it to discover what to download rather than guessing filenames.

#### Using curl or wget

1) Download the JSON manifest (first):

```bash
# Download the manifest which lists available artifacts
curl -LO https://github.com/nibsbin/tonguetoquill-collection/releases/latest/download/manifest.json
# or with wget
wget https://github.com/nibsbin/tonguetoquill-collection/releases/latest/download/manifest.json
```

An example manifest using the current schema looks like this:

```json
{
  "quills": ["quill__usaf_memo.zip"],
  "templates_collection": "templates.zip"
}
```

2) Use the manifest to decide which artifact(s) to download. Two short examples follow.

Download a specific quill (using the filename found in the manifest):

```bash
# Download the usaf_memo quill (note the quill__ prefix)
curl -LO https://github.com/nibsbin/tonguetoquill-collection/releases/latest/download/quill__usaf_memo.zip
# or using wget
wget https://github.com/nibsbin/tonguetoquill-collection/releases/latest/download/quill__usaf_memo.zip
```

Download `templates.zip` from the latest release:

```bash
curl -LO https://github.com/nibsbin/tonguetoquill-collection/releases/latest/download/templates.zip
```

## Notes & Rules

- Artifact naming: quill archives are named `quill__<name>.zip`. Templates (if present) are published as `templates.zip`. The `manifest.json` uses the schema with a `quills` array (filenames) and a `templates_collection` string (filename).
- Do not add proprietary or licensed content without permission.
