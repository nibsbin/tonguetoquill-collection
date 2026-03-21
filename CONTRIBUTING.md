# Contributing to TonguetoQuill Collection

Thank you for your interest in contributing to the TonguetoQuill Collection!

## Project Structure

- **`quills/`**: The bundled Quills and their versions. Note that some Quills are maintained in separate repositories and imported as git subtrees (see `subtrees.json`).
- **`templates/`**: The core fallback Markdown templates.
- **`scripts/`**: Utilities to test, validate, and manage subtree synchronization.

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nibsbin/tonguetoquill-collection.git
   cd tonguetoquill-collection
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```

## Local Development & Testing

Always test your changes before submitting a pull request. The test suite includes checks for duplicates and validates both Quills and Templates against the registry requirements.

```bash
npm test
```

### Git Subtrees

If you are modifying a Quill that is tracked as a subtree (listed in `subtrees.json`), consider whether the change should be made in this repository or in the upstream repository first. You can use the included script to pull downstream updates for subtrees:

```bash
npm run update-subtrees
```

## Pull Requests

1. Fork the repository and create a new branch from `main`.
2. Make your proposed changes.
3. Ensure `npm test` passes successfully.
4. Submit a Pull Request with a clear description of your changes.

We appreciate all contributions!
