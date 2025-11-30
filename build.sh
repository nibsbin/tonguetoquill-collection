#!/bin/bash

echo "Building cmu-template..."
echo

if typst compile --font-path . --root . template/cmu-template.typ pdfs/cmu-template.pdf --; then
  echo "  ✓ Generated: $(pwd)/pdfs/cmu-template.pdf"
else
  echo "  ✗ Failed to compile cmu-template"
  exit 1
fi

echo
echo "Compilation completed."
