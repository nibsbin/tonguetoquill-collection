#!/bin/bash
set -e

mkdir -p release-artifacts
cd release-artifacts

# Zip quills
quills=()
for dir in ../quills/*/; do
  name=$(basename "$dir")
  zip -q -r "quill__${name}.zip" "$dir"
  quills+=("\"quill__${name}.zip\"")
done

# Zip templates
templates="null"
[ -d ../templates ] && {
  zip -q -r "templates.zip" ../templates/
  templates="\"templates.zip\""
}

# Generate JSON
cat > manifest.json <<EOF
{
  "quills": [$(IFS=,; echo "${quills[*]}")],
  "templates_collection": $templates
}
EOF

echo "✓ Created manifest.json"