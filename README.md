# tonguetoquill: CMU Letter Template for Typst


[![github-repository](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/nibsbin/tonguetoquill-cmu-letter)
[![typst-universe](https://img.shields.io/badge/Typst-Universe-aqua)](https://github.com/nibsbin/tonguetoquill-cmu-letter)
[![nibs](https://img.shields.io/badge/author-Nibs-white?logo=github)](https://github.com/nibsbin)

A Typst template for creating official Carnegie Mellon University letters that comply with the standardized letterhead guidelines.

## Features

### Core Formatting
- **CMU Letterhead compliance** with official "Lefthead" layout standards
- **Automatic header column** with wordmark, department, address, and URL
- **Proper typography** using Open Sans (or fallback fonts) at 10-11pt
- **Block style paragraphs** with no indentation and proper spacing
- **Carnegie Red** (#C41230) restricted to wordmark only per brand guidelines
- **Iron Gray** (#6D6E71) for secondary text elements

## Quick Start

### Typst.app (Easiest)

1. Go to [the package page](https://typst.app/universe/package/tonguetoquill-cmu-letter) and click "Create project in app".

2. Start with the template file: `template/cmu-template.typ`

### Local Installation

1. [Install Typst](https://github.com/typst/typst?tab=readme-ov-file#installation).

2. Initialize template from Typst Universe:
```bash
typst init @preview/tonguetoquill-cmu-letter:0.1.0 my-letter
cd my-letter
```

3. Compile the template:
```bash
typst compile template/cmu-template.typ my-letter.pdf
```

### Local Development

Clone [the repo](https://github.com/nibsbin/tonguetoquill-cmu-letter) and follow [these instructions](https://github.com/typst/packages/tree/main?tab=readme-ov-file#local-packages) to install the package locally for development.

```bash
git clone https://github.com/nibsbin/tonguetoquill-cmu-letter.git
cd tonguetoquill-cmu-letter
./build.sh  # Compile template example
```

### Basic Usage

Import the core functions for creating letters:

```typst
#import "@preview/tonguetoquill-cmu-letter:0.1.0": frontmatter, mainmatter, backmatter
```

**Minimal Example:**
```typst
#show: frontmatter.with(
  wordmark: image("assets/cmu-wordmark.svg"),
  department: "School of Computer Science",
  address: ("5000 Forbes Avenue", "Pittsburgh, PA 15213"),
  url: "cs.cmu.edu",
  recipient: ("Dr. Jane Smith", "University of Example"),
  salutation: "Dear Dr. Smith,",
)

#show: mainmatter

Your letter content goes here.

#backmatter(
  closing: "Sincerely,",
  sender_name: "John Doe",
  sender_title: "Associate Professor",
)
```

See the [API Reference](#api-reference) section below for complete parameter documentation.

## API Reference

The template uses a **composable show rules architecture** where you apply each section in order: frontmatter → mainmatter → backmatter.

### Core Functions

#### `frontmatter(...)`

Configures the letter header and establishes document-wide settings. Applied as a show rule.

**Key Parameters:**
```typst
#show: frontmatter.with(
  // Header column content
  wordmark: image("assets/cmu-wordmark.svg"),  // CMU wordmark image
  department: "School of Computer Science",     // Department name
  address: ("5000 Forbes Avenue", "Pittsburgh, PA 15213"),  // Physical address
  url: "cs.cmu.edu",                           // Web URL

  // Letter metadata
  date: datetime.today(),                      // Date (defaults to today)
  recipient: ("Name", "Title", "Address"),     // Recipient information
  salutation: "Dear Dr. Smith,",               // Greeting

  // Typography options
  body_font: ("Open Sans", "Helvetica", "Arial"),  // Body fonts
  font_size: 11pt,                             // Font size (10-11pt per guidelines)
)
```

**Responsibilities:**
- Sets page layout with "Lefthead" margins (2.25" left, 1" others)
- Renders header column with wordmark, department, address, URL
- Renders date, recipient, and salutation
- Establishes typography settings

#### `mainmatter`

Processes the letter body content with proper block style formatting. Applied as a show rule with no parameters.

```typst
#show: mainmatter
```

**Responsibilities:**
- Applies block style paragraph formatting
- No first-line indentation
- Single line spacing with blank line between paragraphs
- Flush left / ragged right alignment

#### `backmatter(...)`

Renders the closing section. Called as a function (not a show rule).

**Key Parameters:**
```typst
#backmatter(
  closing: "Sincerely,",           // Closing phrase
  signature_lines: 4,              // Blank lines for signature
  sender_name: "John Doe",         // Sender's name
  sender_title: "Associate Professor",  // Sender's title
)
```

**Responsibilities:**
- Renders closing phrase
- Provides space for signature
- Renders sender name and title

## CMU Letterhead Guidelines Summary

This template implements the official CMU "Lefthead" stationery format:

| Specification | Value |
|---------------|-------|
| Left Margin | 2.25 inches |
| Right/Top/Bottom Margins | 1.0 inch |
| Primary Font | Open Sans |
| Font Size | 10-11pt |
| Line Spacing | 1.0-1.15 |
| Paragraph Style | Block (no indentation) |
| Text Alignment | Flush left / ragged right |

### Color Palette
- **Carnegie Red** (#C41230): Wordmark only
- **Iron Gray** (#6D6E71): Secondary text
- **Black** (#000000): Body text

## Development

### Contributing

Contributions are welcome! Please explore `src/` for core functions and `template/` for user-facing examples.

### Project Structure

```
├── src/                     # Core implementation
│   ├── lib.typ              # Public API exports
│   ├── config.typ           # Configuration constants
│   ├── frontmatter.typ      # Header section show rule
│   ├── mainmatter.typ       # Body content show rule
│   ├── backmatter.typ       # Closing section rendering
│   ├── primitives.typ       # Reusable rendering functions
│   └── utils.typ            # Utility functions
├── template/                # Example templates
│   ├── cmu-template.typ     # Standard CMU letter
│   └── assets/              # Images (wordmark)
├── pdfs/                    # Compiled example outputs
└── README.md                # This documentation
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The CMU wordmark is property of Carnegie Mellon University and subject to their brand guidelines.
