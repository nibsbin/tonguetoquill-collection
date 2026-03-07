# @tonguetoquill/collection

This package redistributes the core Quills and supporting templates from the [TTQ Quills and Templates Collection](https://github.com/nibsbin/tonguetoquill-collection) for consumption in Node.js environments.

## Installation

```bash
# npm
npm install @tonguetoquill/collection
```

## Usage

This package doesn't export any logic. Instead, it exports two string constants—`QUILLS_DIR` and `TEMPLATES_DIR`—that represent the absolute file paths to the bundled quills and templates on your local filesystem.

You can use `QUILLS_DIR` with the `FileSystemSource` from the [`@quillmark/registry`](https://www.npmjs.com/package/@quillmark/registry) package to load them into the engine.

```typescript
import { Quillmark } from '@quillmark/wasm';
import { QuillRegistry, FileSystemSource } from '@quillmark/registry';
import { QUILLS_DIR } from '@tonguetoquill/collection';

async function setupRegistry() {
  const engine = new Quillmark();
  
  // Point the filesystem source to the quills directory provided by this package
  const source = new FileSystemSource(QUILLS_DIR);
  
  // Initialize the registry
  const registry = new QuillRegistry({ source, engine });
  
  // You can now resolve specific quills!
  const usafMemoBundle = await registry.resolve('usaf_memo');
}
```

### Compatibility

This package relies on standard Node builtin modules (`node:path` and `node:url`) and standard ES Module constants (`import.meta.url`) under the hood to calculate the absolute paths at runtime. It is 100% compatible and robust across **Node.js (16+)**, **Bun**, and **Deno**.
