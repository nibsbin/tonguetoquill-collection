// config.typ: Configuration constants and defaults for CMU letterhead template
//
// This module defines core configuration values that implement Carnegie Mellon
// University letterhead standards as specified in the official guidelines.

// =============================================================================
// COLOR PALETTE
// =============================================================================
// CMU Brand Colors per guidelines section 3.3

#let CMU_RED = rgb("#C41230")      // Carnegie Red - restricted to wordmark/logo
#let CMU_DARK_GREY = rgb("#333333") // Dark Grey - for body text option
#let CMU_BLACK = rgb("#000000")     // Black - standard for body correspondence

// =============================================================================
// TYPOGRAPHY DEFAULTS
// =============================================================================
// Guidelines section 3.1: Primary typeface is Open Sans
// Fallbacks: Arial or Helvetica if Open Sans unavailable
// Serif fonts are strictly prohibited.

#let DEFAULT_BODY_FONTS = ("Open Sans", "Arial", "Helvetica")
#let DEFAULT_SERIF_FONTS = () // Serif fonts prohibited

// Font sizes per guidelines: 10pt or 11pt for body text
#let DEFAULT_FONT_SIZE = 11pt

// =============================================================================
// PAGE GEOMETRY
// =============================================================================
// Guidelines section 2.1: Canvas Specifications
// - Paper Size: US Letter
// - Margins: 1.0 inch on all sides

#let MARGINS = (
  left: 1in,
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
  paragraph: 1em,       // Space between paragraphs
)
