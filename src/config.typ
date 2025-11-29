// config.typ: Configuration constants and defaults for CMU letterhead template
//
// This module defines core configuration values that implement Carnegie Mellon
// University letterhead standards as specified in the official guidelines.

// =============================================================================
// COLOR PALETTE
// =============================================================================
// CMU Brand Colors per guidelines section 2.3

#let CMU_RED = rgb("#C41230")      // Carnegie Red - restricted to wordmark/logo
#let CMU_IRON_GRAY = rgb("#6D6E71") // Iron Gray - for footer/secondary text
#let CMU_BLACK = rgb("#000000")     // Black - standard for body correspondence

// =============================================================================
// TYPOGRAPHY DEFAULTS
// =============================================================================
// Guidelines section 2.2: Primary typeface is Open Sans
// Fallbacks: Helvetica or Arial if Open Sans unavailable

#let DEFAULT_BODY_FONTS = ("Open Sans", "Helvetica", "Arial")
#let DEFAULT_SERIF_FONTS = ("Source Serif Pro", "Times New Roman")

// Font sizes per guidelines: 10pt or 11pt for body text
#let DEFAULT_FONT_SIZE = 11pt

// =============================================================================
// PAGE GEOMETRY - "LEFTHEAD" LAYOUT
// =============================================================================
// Guidelines section 2.1: The "Lefthead" Layout
// - Left margin: 2.25 inches (clears logo and address block)
// - Right margin: 1.0 inch (standard business margin)
// - Top margin: 1.0 inch
// - Bottom margin: 1.0 inch

#let MARGINS = (
  left: 2.25in,
  right: 1in,
  top: 1in,
  bottom: 1in,
)

// =============================================================================
// SPACING CONSTANTS
// =============================================================================

#let spacing = (
  line: 0.5em,          // Internal line spacing
  line-height: 0.7em,   // Base line height
  paragraph: 1em,       // Space between paragraphs (approx 10-12pt per guidelines)
)

// =============================================================================
// HEADER COLUMN (LEFT MARGIN AREA)
// =============================================================================
// The "Active" left margin contains: logo, department name, address, URL

#let HEADER_COLUMN_WIDTH = 2in  // Width of the header content in left margin
