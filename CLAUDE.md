# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **static digital design portfolio** showcasing interactive CSS design experiments. No build process, no dependencies—just pure HTML, CSS, and JavaScript. The project features:

- 14+ design experiments across 4 categories (3D Effects, Geometric Designs, Gradient Effects, Experimental)
- Dynamic gallery system with search, filtering, and sorting
- Modal preview system with iframe-based rendering
- Theme toggle (light/dark mode)
- Responsive design with glassmorphism effects

**Deployed at:** https://chanmeng666.github.io/design-pages

## Key Architecture Concepts

### Data-Driven Gallery System

The entire gallery is driven by `data/works.json`:
- **categories**: Defines design categories with metadata (name, description, color, icon)
- **works**: Array of design experiments with metadata (title, description, technologies, path, category, featured status)

The Gallery class (assets/js/gallery.js) loads this JSON and dynamically generates:
1. Gallery cards with iframe previews
2. Category filters
3. Search functionality
4. Modal previews

**Important:** When adding new designs, ALWAYS update `data/works.json` first—the gallery system automatically picks up the changes.

### Iframe-Based Preview System

Design experiments are standalone HTML files in `demos/` subdirectories. The gallery embeds them via iframes:
- **Card preview**: Small iframe showing live preview
- **Modal preview**: Full-screen iframe when clicking a card
- **Sandboxing**: Uses `sandbox="allow-scripts allow-same-origin"` for security
- **Lazy loading**: Iframes have `loading="lazy"` attribute

### CSS Architecture (Design System)

1. **variables.css**: Single source of truth for all design tokens
   - CSS custom properties for colors, spacing, typography, shadows
   - Theme-specific values (light/dark modes)
   - Glassmorphism variables (--glass-bg, --glass-card-bg, etc.)

2. **main.css**: Core layout, components, and utilities
   - Header/footer components
   - Responsive layouts
   - Theme transitions
   - Animated background (Lottie player)

3. **gallery.css**: Gallery-specific styles
   - Work card layouts (grid/list views)
   - Modal styles
   - Filter controls
   - Empty states

**Pattern:** Always use CSS custom properties from variables.css rather than hardcoding colors/spacing.

### JavaScript Organization

**App class (main.js):**
- Theme management (localStorage persistence)
- Navigation highlighting
- Mobile menu toggle
- Intersection Observer for animations
- Performance monitoring
- Global error handling

**Gallery class (gallery.js):**
- Data fetching from works.json
- Search and filtering logic
- View mode toggling (grid/list)
- Modal management
- URL parameter handling (deep linking)
- Dynamic rendering

**Pattern:** Both classes are auto-initialized on DOMContentLoaded and exported to window for external access.

## Common Development Commands

### Running Locally

```bash
# Option 1: Python (built-in)
python -m http.server 8000

# Option 2: Node.js (if installed)
npx serve .

# Option 3: PHP (if installed)
php -S localhost:8000

# Then open: http://localhost:8000
```

### Viewing Individual Demos

```bash
# Open any demo directly:
open demos/3d-effects/rotating-cube.html
# Or navigate to: http://localhost:8000/demos/3d-effects/rotating-cube.html
```

## Adding New Design Experiments

**Step-by-step workflow:**

1. **Create the HTML file** in the appropriate category folder:
   ```
   demos/{category}/{design-name}.html
   ```

2. **Structure of design files:**
   - Self-contained HTML with inline CSS/JS
   - Use semantic HTML
   - Include viewport meta tag
   - Keep animations performant (use transforms/opacity)

3. **Update data/works.json:**
   ```json
   {
     "id": "unique-id",
     "title": "Display Name",
     "category": "category-slug",
     "description": "Brief description",
     "technologies": ["CSS 3D", "JavaScript"],
     "path": "demos/category/filename.html",
     "featured": false,
     "createDate": "2024-MM-DD"
   }
   ```

4. **Test in gallery:**
   - Reload index.html
   - Search for the new design
   - Test iframe preview
   - Test modal preview
   - Check responsiveness

## Modifying Existing Designs

**Important patterns:**

- Design files are **standalone** and **self-contained**
- Each has its own `<style>` and `<script>` tags
- Most use **CSS 3D transforms**, **animations**, or **gradients**
- Many have **interactive JavaScript** (click handlers, mouse tracking)

**Common modification requests:**
- Adjusting animation speed: Look for `animation-duration` or `transition` properties
- Changing colors: Look for gradient definitions or color variables
- Modifying 3D effects: Look for `transform`, `perspective`, `transform-style: preserve-3d`

## Theme System

The theme toggle works across the entire site:

1. User clicks theme toggle button
2. App.setTheme() adds/removes `.light-theme` or `.dark-theme` class on `<body>`
3. CSS custom properties in variables.css respond to the class change
4. Theme preference saved to localStorage
5. Theme restored on page load

**Key CSS variables that change:**
- `--primary-bg`, `--secondary-bg`, `--card-bg`
- `--text-primary`, `--text-secondary`, `--text-muted`
- `--glass-bg`, `--glass-card-bg` (glassmorphism effects)
- `--border-color`, `--hover-bg`

## Gallery Features

### Search
- Searches across: title, description, technologies
- Debounced (300ms) for performance
- Case-insensitive

### Filtering
- Category filter (dropdown)
- Sort options: newest, oldest, title, category
- Filters are combinable (search + category)

### View Modes
- Grid view (default): Card-based layout
- List view: Expanded horizontal cards

### URL Parameters
The gallery supports deep linking via URL parameters:
- `?category=3d-effects` - Auto-filter by category
- `?work=rotating-cube` - Auto-open specific work modal
- `?view=list` - Set view mode
- `?search=gradient` - Pre-fill search

## Performance Considerations

- **Lazy loading**: Iframes use `loading="lazy"`
- **Intersection Observer**: Used for scroll-based animations
- **Debouncing**: Search input debounced at 300ms
- **Hardware acceleration**: Animations use `transform` and `opacity` (GPU-accelerated)
- **No external dependencies**: Zero npm packages, no build step
- **Performance monitoring**: Built-in timing with PerformanceMonitor class

## Deployment

This is a **static site** deployed via GitHub Pages:
1. Push to `main` branch
2. GitHub Pages automatically serves from root
3. No build process needed

**Deployment checklist:**
- All paths are relative (no hardcoded domains)
- Images optimized
- CSS/JS minified (optional, but recommended for production)

## Common Gotchas

1. **Iframe pointer events**: Gallery cards disable pointer events on iframes during hover to prevent interference with card interactions.

2. **Modal iframe cleanup**: When closing modal, iframe `src` is cleared to stop animations/sounds.

3. **Category slugs**: Must match between `data/works.json` categories object and works array `category` field.

4. **Theme classes**: Body must have either `.light-theme` or `.dark-theme` class—never both, never neither.

5. **Gallery initialization**: Gallery class requires an element with `id="worksGrid"` to exist in the DOM.

6. **Standalone demos**: Design files should work independently when opened directly (not just via iframe).

## File Structure Reference

```
design-pages/
├── index.html                 # Main gallery page
├── assets/
│   ├── css/
│   │   ├── variables.css     # Design tokens (colors, spacing, etc.)
│   │   ├── main.css          # Core styles & components
│   │   └── gallery.css       # Gallery-specific styles
│   ├── js/
│   │   ├── main.js           # App class, theme, navigation
│   │   └── gallery.js        # Gallery class, filtering, modal
│   ├── images/               # Screenshots, logos, assets
│   └── fonts/                # Web fonts (if any)
├── data/
│   └── works.json            # Portfolio data (categories + works)
├── demos/                    # Design experiment HTML files
│   ├── 3d-effects/
│   ├── experimental/
│   ├── geometric-designs/
│   └── gradient-effects/
└── README.md                 # Project documentation
```

## Troubleshooting

### Gallery not loading
- Check console for JSON fetch errors
- Verify `data/works.json` is valid JSON
- Ensure Gallery class initialized (check `window.gallery`)

### Design not appearing in gallery
- Verify entry exists in `data/works.json`
- Check `category` field matches a valid category slug
- Verify `path` is correct relative to project root

### Iframe preview blank/broken
- Check if HTML file exists at specified path
- Open demo directly to test if it works standalone
- Check for console errors in iframe (use browser DevTools)

### Theme not persisting
- Check if localStorage is enabled in browser
- Verify App.setTheme() is setting localStorage correctly
- Check for JS errors preventing theme code from running

### Modal not closing
- Check if escape key handler is registered
- Verify modal close button has click handler
- Check if modal class is being toggled correctly
