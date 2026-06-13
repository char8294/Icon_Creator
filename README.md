# Icon Creator

A modern, fast, and feature-rich web-based utility for tweaking, processing, outlining, and batch-exporting game assets and application icons. Built with React, TypeScript, and Vite.

## 🚀 Live Demo / Preview
*Simply build and run locally, or deploy to any static hosting service like Vercel, Netlify, or GitHub Pages.*

---

## ✨ Key Features

- **Double Outline (Stroke) Engine**
  - Custom border rendering with up to **two independent outline/stroke layers**.
  - Adjust thickness, color, detail (smoothness), and edge softness (anti-aliasing/blur) for perfect outlines.
- **Dynamic Masking Layer**
  - Crop assets into rounded rectangles/squares.
  - Customizable **Corner Radius**, **Mask Inset**, and **Anti-aliasing (Feather)**.
- **Transform & Align Tools**
  - Fine-grained controls for Position (X, Y) and Scale.
  - **Pivot Alignment**: Instantly center or align elements to the top, bottom, left, or right.
  - **Auto-Crop**: Automatically trim transparent borders to fit the boundary box.
- **Canvas & Background Adjustments**
  - Choose between **Transparent**, **White**, **Black**, or **Custom Color** backgrounds.
  - Toggle light or dark checkered grids for background contrast.
  - Configurable canvas grids and spacing columns.
- **Batch Management & Export**
  - Import multiple image files via drag-and-drop or click-to-select.
  - Search and filter items by name.
  - Sort items by name, upload order, or creation date.
  - **Batch Selection Modes**: Select Single, Multi, or All assets.
  - **Instant Export**: Export assets individually or batch-download them as a single organized `.zip` file.
- **Keyboard Hotkeys**
  - Dynamic controls using your keyboard for speed and efficiency.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `W` / `A` / `S` / `D` | Move selected item(s) |
| `Q` / `E` | Scale selected item(s) up/down |
| `R` | Trigger Auto-Crop on selection |
| `Z` | Reset translation, scale, and offset properties |

---

## 🛠️ Tech Stack

- **Framework**: React 19 (TypeScript)
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Library**: [JSZip](https://github.com/Stuk/jszip) (for zip exporting)

---

## 📦 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (version 18+ recommended).

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Icon_Creator.git
   cd Icon_Creator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to the address shown in your terminal (usually `http://localhost:5173`).

4. **Build for production**
   ```bash
   npm run build
   ```
   The production-ready bundle will be built in the `dist` folder.
