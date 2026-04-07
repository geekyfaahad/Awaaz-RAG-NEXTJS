# Implementation Plan - UI Overhaul for Awaaz AI Fact Checker

The goal is to transform the current barebones interface into a premium, modern, and interactive fact-checking dashboard that "WOWs" the user.

## 1. Research & Design Inspiration
- **Theme**: Premium Dark Mode with subtle gradients and glassmorphism.
- **Branding**: "Awaaz" (The Voice) - focusing on trust and speed.
- **Palette**:
  - Background: `#030303` (Deep Black)
  - Accent: `#6366f1` (Indigo) / `#10b981` (Emerald for True) / `#ef4444` (Rose for Fake)
  - Surface: Transparent with white/10 overlay (Glassmorphism)

## 2. Structural Changes
### Frontend (`app/page.tsx`)
- **Hero Section**: A large, centered heading and subtitle.
- **Search Bar**: A prominent, glassmorphic input field with a search icon and a "Verify" button featuring a gradient pulse effect.
- **Trending Section**: A horizontal scroll or grid of "Trending Claims" that users can click to instantly verify.
- **Results Display**:
  - **Verdict Card**: Large status indicator (Icon + Text), Reason snippet, and a Confidence Gauge.
  - **Sources List**: A cleanly styled list of links to the evidence used by the AI.
- **State Management**: Handling loading states with skeletons or shimmering effects.

### Styling (`app/globals.css`)
- Update to include custom animations (`shimmer`, `float`).
- Set Geist as the primary font family.
- Define common glassmorphism classes.

## 3. Implementation Steps

### Phase 1: Dependencies & Base Styles
- Install `lucide-react` for premium icons.
- Update `app/globals.css` with modern dark theme variables and base components.

### Phase 2: Building the Main Layout
- Update `app/layout.tsx` to ensure a consistent high-end background.
- Refactor `app/page.tsx` into a multi-section component.

### Phase 3: Implementing Features
- **Fetch Trending**: Implement `useEffect` to load trending claims from `/api/trending`.
- **Enhanced Verification**: Update the `verify` function to handle the JSON response from the API more robustly (parsing the result string if it's JSON).

### Phase 4: Polish & Micro-animations
- Add hover states to all interactive elements.
- Add "entering" animations for verification results.

## 4. Verification Plan
- [ ] Test the search bar accessibility.
- [ ] Ensure "Trending" claims are clickable and launch verification.
- [ ] Verify that results are displayed in structured cards, not raw JSON.
- [ ] Check dark/light mode consistency (though dark-first is preferred).
