# 🏠 RoomGen AI

> **Transform and visualize interior spaces in seconds using AI-powered image generation.**  
> Powered by **React 19**, **TypeScript**, **Puter.js**, and **Google Gemini Image Generation** (`gemini-3.1-flash-image-preview`).

---

## 🌟 Overview

**RoomGen AI** is an intelligent interior redesign web application that allows homeowners, interior designers, and architects to reimagine interior spaces effortlessly. Upload existing room photographs, select from curated design themes, fine-tune the intensity, lock structural furniture layouts, and generate photorealistic transformations.

With zero complicated API key configuration needed, RoomGen AI leverages **Puter.js** to handle authentication and AI inference directly in the browser.

---

## ✨ Features

- 🖼️ **Single View Redesign**
  - Upload a room photo (JPG/PNG, up to 5MB).
  - Instant high-fidelity visual transformation with realistic textures, lighting, and materials.
- 📐 **Consistent Multi-View Redesign**
  - Upload up to 5 angles of the same room simultaneously.
  - Generates synchronized redesigns maintaining uniform materials, colors, and design language across all perspectives.
- 🎚️ **Interactive Before / After Slider**
  - Draggable split-screen comparison slider supporting both mouse and touch gestures.
- 🎨 **9 Curated Interior Themes**
  - **Modern** — Monochromatic greys, charcoal, warm beige, and matte black accents.
  - **Minimal** — Pure white, soft cream, light oak, and clean lines.
  - **Scandinavian** — Light ash wood, muted greys, soft off-whites, and sage green accents.
  - **Japandi** — Warm beige, soft whites, light oak, and natural clay elements.
  - **Industrial** — Raw concrete, exposed red brick, black metal, and weathered leather.
  - **Bohemian** — Warm terracotta, olive green, mustard yellow, and natural rattan/jute textures.
  - **Luxury** — Rich cream, champagne gold, polished white marble, and deep navy velvet accents.
  - **Corporate Office** — Professional slate blue, white, cool grey, and maple wood accents.
  - **Medieval** — Stone grey, dark walnut wood, antique gold, and deep crimson tones.
- 🎛️ **Granular Transformation Controls**
  - **Theme Intensity Slider (0–100%)**: Control whether the transformation is subtle, balanced, or a complete overhaul.
  - **Strict Layout Preservation**: When enabled, enforces 1:1 structural coordinates for walls, ceilings, floors, doors, windows, and existing furniture positions.
  - **Modular Add-Ons**: Quick-toggle additions for *Tables*, *Carpets / Rugs*, *Sofas*, *Wall Art*, *Indoor Plants*, and *Ceiling Lights*.
  - **Custom Directives**: Free-form natural language instructions for specific adjustments (e.g., *"Make walls cream-colored and add recessed lighting"*).
- 👤 **Seamless Puter.js Authentication**
  - No manual API keys required in `.env` files.
  - Built-in user badge and **Account Switcher** in the navigation header.
- 💾 **One-Click Download**
  - Export and save transformed images directly to your machine.

---

## 🛠️ Tech Stack

| Technology | Role |
| :--- | :--- |
| **React 19** | Modern UI components and state management |
| **TypeScript** | Type safety across themes, configs, and services |
| **Vite 6** | Ultra-fast frontend tooling and development server |
| **Tailwind CSS** | Utility-first responsive design and styling |
| **Puter.js (`@heyputer/puter.js`)** | Browser-based AI API client and user authentication |
| **Google Gemini (`gemini-3.1-flash-image-preview`)** | Photorealistic image-to-image room transformation |

---

## 📁 Project Structure

```text
roomgen/
├── components/
│   ├── BeforeAfterSlider.tsx   # Interactive split-view comparison slider
│   ├── Controls.tsx            # Theme, intensity, layout, and add-on controls
│   ├── MultiViewRoom.tsx       # Multi-angle batch room transformation UI
│   └── SingleViewRoom.tsx      # Single room photo transformation UI
├── services/
│   └── geminiService.ts        # Puter.js integration, prompt builder & auth helpers
├── App.tsx                     # Main application layout, tabs, & auth header
├── index.html                  # HTML entry point with Tailwind CDN
├── index.tsx                   # React root mount
├── types.ts                    # TypeScript definitions (Themes, AddOns, Config)
├── vite.config.ts              # Vite configuration
├── package.json                # Project dependencies and npm scripts
└── tsconfig.json               # TypeScript compiler options
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18.0 or higher) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/roomgen.git
   cd roomgen
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:5173` in your web browser.

---

## 🔐 Puter.js Authentication & Account Management

RoomGen AI uses **Puter.js** for AI generation, meaning you **do not need to create or configure a Gemini API key**.

### First-Time Sign In
- When you click **"Generate Transformation"** (or click **"Puter Account"** in the top navigation bar), a Puter login popup will appear.
- Sign in with your existing Puter account or create a free one.

### Switching Your Puter Account
If you want to use a different Puter account (for different quota/credits):
1. Look at the top navigation bar in the application.
2. Next to your username, click the **"Switch"** button.
3. Puter will prompt you to log into or select your preferred account.
4. You can also click **"Logout"** at any time to clear the saved credentials.

> **Tip:** If the popup logs in automatically without prompting, open [puter.com](https://puter.com) in another tab, log out of your active account there, and try again.

---

## 📜 Available Scripts

- `npm run dev` — Starts the local Vite development server.
- `npm run build` — Compiles TypeScript and builds production-ready assets into `dist/`.
- `npm run start` — Previews the production build locally.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
