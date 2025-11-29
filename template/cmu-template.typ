#import "../src/lib.typ": frontmatter, mainmatter, backmatter

#show: frontmatter.with(
  wordmark: image("assets/cmu-wordmark.svg"),
  department: "Department Here",
  address: (
    "5000 Forbes Avenue",
    "Pittsburgh, PA 15213-3890"
  ),
  url: "cmu.edu",
  recipient: (
    "[Recipient Name]",
    "[Address Line 1]",
    "[Address Line 2]",
    "[City, State Zip]"
  ),
  salutation: "Dear [Name],",
)

#show: mainmatter

To maintain the visual integrity of Carnegie Mellon University’s brand, all official correspondence must adhere to the strict layout specifications detailed below. This document defines the "pedantic" standards required to reproduce the official letterhead across any software platform (LaTeX, Microsoft Word, Typst, etc.).

Note: Visual approximation is insufficient. Adherence to typographic hierarchy and spatial relationships is required.

#backmatter(
  closing: "Sincerely,",
  sender_name: "[Sender Name]",
  sender_title: "[Sender Title]",
)
