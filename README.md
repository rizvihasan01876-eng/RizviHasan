# Rizvi Hasan — Portfolio

A premium, single-page portfolio built with plain HTML/CSS/JS, GSAP + ScrollTrigger for animation, and Lenis for smooth scrolling.

## Files
- `index.html` — all page content and structure
- `style.css` — all styling and design tokens
- `script.js` — all animation and interaction logic, plus the editable `CONFIG` object
- `assets/rizvi-hasan.png` — your portrait, used in the About section

## Run it locally
No build step is required. Because the page loads local files with `fetch`-like module behavior in some browsers, the simplest reliable way to preview it is a tiny local server:

```bash
cd rizvi-portfolio
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

(Double-clicking `index.html` will also mostly work, since everything here uses plain `<script src>` tags rather than ES modules.)

## Deploy it
This is a fully static site — drag the `rizvi-portfolio` folder into any static host:
- **Netlify / Vercel**: drag-and-drop the folder, or connect a GitHub repo.
- **GitHub Pages**: push the folder to a repo and enable Pages on the `main` branch.
- Any shared hosting: upload the three files + `assets/` folder via FTP.

## Things to edit before you launch

### 1. Contact details — `script.js`
At the very top of `script.js`:
```js
const CONFIG = {
  email: "your-email@example.com",
  linkedin: "https://www.linkedin.com/in/your-profile",
  formEndpoint: null, // optional — see below
};
```
Replace the email and LinkedIn URL. These automatically populate every "Let's connect" / "View LinkedIn" button, the footer link, and the mobile menu.

### 2. Contact form backend (optional)
Right now, submitting the form opens the visitor's email client with a pre-filled message (no backend needed). If you'd rather receive submissions directly, sign up for a free form backend like Formspree, get your endpoint URL, and set:
```js
formEndpoint: "https://formspree.io/f/xxxxxxx",
```

### 3. Portrait photo
Swap `assets/rizvi-hasan.png` for a different file (keep the same filename, or update the `src` in the About section of `index.html`).

### 4. Project visuals
The five "Selected Work" cards currently use generated placeholder mockups (a subtle grid + project name) rather than real screenshots, since no project imagery was provided. To swap in real screenshots, replace the `.project__media` markup for each project in `index.html` with an `<img>` tag pointing at your image.

## Cinematic scroll background (new)
A full-screen, scroll-scrubbed image-sequence background sits behind the whole site — as you scroll, it plays forward; scroll up and it reverses. It never blocks clicks and always stays behind your content.

**Files added for this feature (nothing else was touched):**
- `bg-frames.js` — the whole engine: preloading, scroll → frame mapping, canvas drawing, mobile/reduced-motion handling. All tuning knobs are in the `BG_FRAMES_CONFIG` object at the very top.
- `assets/frames/` — 102 full-resolution frames (`frame_000.webp` … `frame_101.webp`), used on desktop/tablet.
- `assets/frames-mobile/` — the same 102 frames downscaled to 640px wide, used automatically on screens ≤ 760px to keep mobile fast.
- A small CSS block was appended to the bottom of `style.css` for the background layer, plus `main`/`.footer` were given `position: relative; z-index: 1` so they always render above the background (nothing about their layout changed).

**Note on the source files:** the ZIP you provided contained 102 `.webp` frames (not exactly 300 JPGs) — I used what was actually there. `.webp` is smaller and renders identically to JPG in all modern browsers, so this keeps things fast without any visual downside.

**To swap in a different sequence later:**
1. Drop your new frames into `assets/frames/` (and optionally a downscaled copy into `assets/frames-mobile/`), named `frame_000.webp`, `frame_001.webp`, etc.
2. Update `frameCount` in `bg-frames.js` to match your new total.
3. That's it — everything else (loading, scroll mapping, mobile switching) adapts automatically.

**Performance behavior:**
- Frame 0 loads first and is shown immediately; the rest load progressively in the background (6 at a time) without blocking the page.
- Scrolling always requests the exact frame it needs first, so scrubbing stays responsive even mid-preload — it shows the nearest already-loaded frame as a placeholder until the exact one arrives.
- Users with `prefers-reduced-motion` enabled see a single static frame instead of the scroll animation.
- Mobile automatically uses the smaller 640px frame set.

## Content honesty
No numbers, client names, revenue figures, awards, or certifications were invented anywhere on this site — only the information provided in the brief. Where an exact job title or date wasn't available, the timeline uses neutral labels instead (e.g. "Leadership & Growth").
