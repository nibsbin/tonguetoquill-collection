# Tonguetoquill Collection

Quills for the Tonguetoquill project. Less formatting. More lethality.

## Getting Started

### Downloading Quills from Releases

Quills are published as zip files with each release. To download the latest quills:

#### Using curl or wget

Download a specific quill from the latest release:

```bash
# Download usaf_memo quill
curl -LO https://github.com/nibsbin/tonguetoquill-collection/releases/latest/download/usaf_memo.zip

# Or using wget
wget https://github.com/nibsbin/tonguetoquill-collection/releases/latest/download/usaf_memo.zip
```

Download the manifest to see all available quills:

```bash
curl -LO https://github.com/nibsbin/tonguetoquill-collection/releases/latest/download/manifest.txt
```

#### Using GitHub CLI (gh)

```bash
# Download all assets from the latest release
gh release download --repo nibsbin/tonguetoquill-collection

# Download a specific quill
gh release download --repo nibsbin/tonguetoquill-collection --pattern "usaf_memo.zip"
```

#### Using the API

Fetch the latest release information:

```bash
curl -s https://api.github.com/repos/nibsbin/tonguetoquill-collection/releases/latest
```

## Rules

- Don't add any proprietary or licensed content without permission.
