# Limitations and Notes

This document catalogs known limitations of the `tonguetoquill-cmu-letter` implementation relative to the full CMU letterhead guidelines.

## Reference Document
All references are to the Carnegie Mellon University Standardized Letterhead & Correspondence Guidelines.

---

## 1. Font Availability

**Guideline Requirement:**
- Primary Typeface: Open Sans
- Serif Alternative: Source Serif Pro
- Acceptable Fallbacks: Helvetica, Arial, Times New Roman

**Current Implementation:**
- Template specifies Open Sans with Helvetica and Arial as fallbacks
- **Limitation:** Open Sans may not be available on all systems. The template will fall back to system fonts if Open Sans is not installed.

---

## 2. Adaptive Margins for Short Letters

**Guideline Note:**
- For short communications, margins may be adjusted to balance content toward vertical center

**Current Implementation:**
- Fixed "Lefthead" margins (2.25" left, 1" others) for all documents
- **Limitation:** No automatic vertical centering for short letters. Users must manually adjust if desired.

---

## 3. Digital Signature Support

**Guideline Requirement:**
- Leave space blank for signature, or insert high-quality scan of wet-ink signature
- Do not use "script" fonts to simulate signatures

**Current Implementation:**
- Provides 4 blank lines for signature space
- **Limitation:** No built-in support for inserting signature images. Users can manually add an image in the signature space.

---

## 4. Paper Stock Recommendations

**Guideline Requirement:**
- Use 24lb or 28lb bond paper with slight cotton content for printing
- Standard copier paper (20lb) is not recommended

**Current Implementation:**
- **Note:** This is a print production consideration outside the scope of digital typesetting.

---

## Summary

This implementation provides a solid foundation for creating CMU-compliant letters with the core "Lefthead" layout features. Users should be aware of font availability on their systems and may need to manually handle:

- Installing Open Sans font if not available
- Adding signature images manually
- Adjusting layout for very short letters

For questions or to report additional limitations, please file an issue at the project repository.
