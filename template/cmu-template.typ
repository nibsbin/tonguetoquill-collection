#import "../src/lib.typ": frontmatter, mainmatter, backmatter

#show: frontmatter.with(
  wordmark: image("assets/cmu-wordmark.svg"),
  department: "School of Computer Science",
  address: (
    "5000 Forbes Avenue",
    "Pittsburgh, PA 15213"
  ),
  url: "cs.cmu.edu",
  recipient: (
    "Dr. Jane Smith",
    "Department of Engineering",
    "University of Example",
    "123 Main Street",
    "City, ST 12345"
  ),
  salutation: "Dear Dr. Smith,",
)

#show: mainmatter

This letter demonstrates the official Carnegie Mellon University letterhead format following the standardized guidelines. The layout places the university wordmark and sender's address block at the top left of the page.

The body text uses Open Sans font at 11 point size with single line spacing. Paragraphs follow block style formatting with no indentation and one blank line between paragraphs. Text is aligned flush left with a ragged right edge, as justified text can disrupt readability.

Carnegie Mellon University maintains strict brand guidelines for official correspondence. The Carnegie Red color (\#C41230) is restricted to the University Wordmark only and should never be used for body text. Body text should be Black (\#000000) or Dark Grey (\#333333).

For questions about letterhead standards or to request official stationery, please contact the Office of Communications.

#backmatter(
  closing: "Sincerely,",
  sender_name: "John Doe",
  sender_title: "Associate Professor of Computer Science",
)
