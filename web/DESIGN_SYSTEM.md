# Design System: Quantum Nebula (Web Redesign)

## 1. Creative North Star: "The Cosmic Navigator"
We move away from basic grid layouts and standard dark themes toward an immersive, atmospheric, and futuristic visual experience called **Quantum Nebula**. 

The brand personality is **Enlightening, High-Performance, and Accessible**. It features floating frosted glass structures suspended in a deep cosmic space filled with subtle gaseous glows (violet and cyan). Every element is defined by translucent volumes, ambient glowing light sources, and crisp, modern typography.

---

## 2. Color Palette & Atmospheric Depth
Our palette is deeply atmospheric, using contrast and glows to create absolute readability (WCAG AAA compliant) while maintaining a luxury gaming-grade aesthetic.

### Core Color Strategy
*   **Primary (Electric Violet):** `#7C3AED` - The core brand color, used for primary call-to-actions, prominent headers, and high-frequency active states.
*   **Secondary (Neon Cyan):** `#00F2FE` - Represents action, interactivity, and learning progress. Used for success states, interactive buttons, progress indicators, and neon glow effects.
*   **Accent (Vibrant Rose):** `#F43F5E` - Used for specialty features (like the expert coaching spaces, community labs) and key callouts.
*   **Background (Cosmic Void):** `#080711` - A deep, luxury obsidian-violet base. Never use flat black.
*   **Surface (Nebula Glass):** `rgba(22, 18, 44, 0.6)` - Translucent dark purple-indigo glass.
*   **Surface Elevated (Nebula Glow):** `rgba(32, 27, 60, 0.8)` - For modals, floating panels, and elevated popovers.
*   **Outline / Borders (Ghost Border):** `rgba(124, 58, 237, 0.2)` - Subtle indigo borders that outline glass surfaces.

### Surface Hierarchy & Nesting
To convey volume and depth without solid boxes:
1.  **Base Layer:** `background` (`#080711`) with multi-layered violet/cyan mesh gradient blobs.
2.  **Broad Sections:** Translucent panels (`rgba(22, 18, 44, 0.4)`) with high backdrop-blur (`30px`).
3.  **Content Cards:** Elevated glass (`rgba(32, 27, 60, 0.6)`) with a top-left stroke of `rgba(0, 242, 254, 0.3)` to catch the virtual light.
4.  **Action Elements:** Semi-transparent gradient fills (`from-[#7C3AED]/20 to-[#00F2FE]/20`) with bright borders.

---

## 3. Typography: Editorial Sophistication
We pair **Space Grotesk** (for architectural, geometric headings) with **Inter** (for maximum readability, high x-height body copy).

*   **Display (Display-LG):** `Space Grotesk` - `64px`, Weight `700`, Line-height `1.1`. Perfect for landing hooks.
*   **Headline (Headline-MD):** `Space Grotesk` - `32px`, Weight `600`, Line-height `1.3`. For section titles.
*   **Body (Body-LG):** `Inter` - `18px`, Weight `400`, Line-height `1.6`. Default reading.
*   **Body (Body-MD):** `Inter` - `16px`, Weight `400`, Line-height `1.5`. Secondary reading.
*   **Labels (Label-MD):** `Inter` - `12px`, Weight `600`, All-Caps, Tracking `+0.1em`. Used for tags and system pills.

---

## 4. Elevation, Blur & Glows
In the Quantum Nebula design system, depth is built using **light physics, refraction, and glows**, not shadow overlays.

*   **Backdrop Blur:** All glass cards and headers must use `backdrop-filter: blur(24px)`.
*   **Light Catch Border:** Elements are defined by 1px solid strokes. The top and left borders use `rgba(255, 255, 255, 0.25)` or `rgba(0, 242, 254, 0.3)` while the bottom and right borders use `rgba(255, 255, 255, 0.05)`.
*   **Neon Outer Glows:** Primary active elements emit a soft outer blur: `box-shadow: 0 0 25px rgba(0, 242, 254, 0.3)`.
*   **Mesh Background Blobs:** Large, organic background blobs of `#7C3AED` and `#00F2FE` with 15% opacity and a `150px` blur float in the background to provide a dynamic sense of depth.

---

## 5. Shape Language & Corners
We use a **highly fluid, rounded approach** to offset the geometric, tech-forward font.
*   **Container Panels:** Rounded corners at `3xl` (`32px` / `2rem`) to feel welcoming and organic.
*   **Cards & Modals:** Rounded corners at `2xl` (`24px` / `1.5rem`).
*   **Interactive Controls / Buttons / Inputs:** Fully pill-shaped (`rounded-full` / `9999px`) or `xl` (`16px`).

---

## 6. Premium Signature Components

### Quantum Buttons
*   **Primary CTA:** Linear gradient from `#7C3AED` (Violet) to `#00F2FE` (Cyan). No border. Deep shadow glow on hover.
*   **Secondary Glass Button:** Translucent glass surface, neon cyan border stroke (`rgba(0, 242, 254, 0.4)`), scale up slightly and increase blur on hover.

### Nebula Bento Cards
*   Cards of varying sizes nested together seamlessly. 
*   Frosted glass backdrop, subtle 1px neon border.
*   On hover, the top-left highlight border animates or shifts.

### Integrated Progress Rings
*   A circular arc that glows like a light filament. Uses `#00F2FE` with 100% saturation and an outer glow.

---

## 7. Do's and Don'ts

### Do:
*   Use massive headings followed by clean, generous negative space to create a magazine-like feel.
*   Keep background gradients alive by slowly animating the position of background mesh blobs.
*   Use standard Next.js semantic tags with specific, high-contrast states.

### Don't:
*   Never use standard flat black or boring mid-grey boxes.
*   Do not use sharp 90-degree corners.
*   Never use standard drop shadows. Always use ambient glow or tonal stacking.
