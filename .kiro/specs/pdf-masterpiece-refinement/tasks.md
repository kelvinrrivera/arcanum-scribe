# Implementation Plan

## Phase 1: Critical Tactical Fixes

- [x] 1. Fix Page Numbering System

  - Implement CSS counter-reset and counter-increment for accurate page numbers
  - Add enhanced styling with golden borders and gradient backgrounds
  - Ensure cover page exclusion from numbering
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 2. Restructure Monster Stat Block Layout

  - [x] 2.1 Implement 3x2 Ability Score Grid

    - Modify abilities-grid CSS to use 3 columns, 2 rows layout
    - Position STR/DEX/CON in top row, INT/WIS/CHA in bottom row
    - Ensure consistent spacing and alignment
    - _Requirements: 1.4_

  - [x] 2.2 Add Stat Block Section Headers

    - Create stat-section-header CSS class with Cinzel font
    - Implement "Special Abilities", "Actions", and "Reactions" sections
    - Add visual separation lines between sections
    - _Requirements: 1.1, 1.2_

  - [x] 2.3 Enhance Ability Name Formatting
    - Apply bold styling to ability names
    - Add period after ability names for scanning efficiency
    - Implement ability-name CSS class with ::after pseudo-element
    - _Requirements: 1.3_

## Phase 2: Typography and Readability Enhancement

- [ ] 3. Improve Text Alignment and Hierarchy

  - [x] 3.1 Fix Scene Text Alignment

    - Change "Read Aloud" and "Behind the Scenes" text from justified to left-aligned
    - Update scene-section CSS to prevent text rivers
    - Maintain justified text only for narrative Background & Lore sections
    - _Requirements: 2.1_

  - [x] 3.2 Enhance Sidebar Title Styling

    - Increase sidebar-title font size from 14pt to 16pt
    - Change font-weight from 600 to 700 for better visual hierarchy
    - Increase letter-spacing from 1px to 2px
    - _Requirements: 2.2_

  - [x] 3.3 Implement Character Card Height Consistency
    - Add CSS Grid alignment for character cards in same row
    - Use align-items: stretch to maintain consistent heights
    - Test with varying content lengths
    - _Requirements: 2.3_

## Phase 3: Combat Tactics and Visual Polish

- [x] 4. Enhance Combat Tactics Display

  - [x] 4.1 Implement Stylized Bullet Points

    - Replace plain text tactics with styled list items
    - Add sword emoji (⚔️) bullets with proper positioning
    - Apply text-shadow and color styling to bullets
    - _Requirements: 1.5, 5.2_

  - [x] 4.2 Improve Tactics List Formatting
    - Remove default list styling and implement custom spacing
    - Add proper line-height and margin for readability
    - Ensure consistent indentation and alignment
    - _Requirements: 5.2_

- [x] 5. Professional Visual Refinements

  - [x] 5.1 Add Decorative Page Number Elements

    - Implement gradient backgrounds for page numbers
    - Add subtle golden borders and box-shadow effects
    - Include inset highlights for dimensional appearance
    - _Requirements: 3.2, 4.3_

  - [x] 5.2 Standardize Bullet Point Styling

    - Create consistent bullet styling across all lists
    - Apply fantasy-themed icons where appropriate
    - Ensure proper spacing and alignment
    - _Requirements: 4.2_

  - [x] 5.3 Enhance Border and Frame Consistency
    - Standardize golden accent colors across all elements
    - Ensure consistent border weights and styling
    - Apply proper box-shadow effects for depth
    - _Requirements: 4.1, 4.3_

## Phase 4: Testing and Validation

- [x] 6. Conduct GM Usability Testing

  - [x] 6.1 Test Stat Block Scanning Speed

    - Time ability lookup during mock combat scenarios
    - Verify section separation improves information finding
    - Test with multiple monster types and complexity levels
    - _Requirements: 5.1, 5.3_

  - [x] 6.2 Validate Typography Readability

    - Test document readability under typical gaming lighting
    - Verify text alignment improvements reduce eye strain
    - Confirm hierarchy changes improve content scanning
    - _Requirements: 2.1, 2.2_

  - [x] 6.3 Cross-Platform PDF Testing
    - Test PDF rendering across different viewers
    - Verify print quality on standard home printers
    - Confirm mobile PDF reader compatibility
    - _Requirements: 3.1, 4.3_

## Implementation Notes

- Each task should be implemented incrementally with immediate testing
- Maintain backward compatibility with existing adventure data structures
- Focus on surgical improvements rather than wholesale changes
- Prioritize GM usability over pure aesthetic considerations
- Test each enhancement with real adventure content before proceeding

## Success Metrics

- Page numbers display correctly (not "0") across all pages
- Stat block information can be found 50% faster during combat simulation
- Typography hierarchy enables instant content scanning
- Professional visual polish matches premium published adventures
- Zero regression in existing functionality
