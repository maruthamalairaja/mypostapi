# SAM API Client (My Post API)

A modern, professional, lightweight, completely client-side API testing tool built with **Svelte**, tailored in an enterprise-grade Executive Crimson & Mahogany theme with comprehensive light and dark mode handling.

Designed as an in-browser REST API workspace with instant reactivity, zero persistent storage, and zero tracking.

---

## Key Features

- **100% Client-Side Execution**: All requests are executed directly in the browser using the native Fetch API. No backend, no proxy, no telemetry.
- **Strict In-Memory State**: Zero LocalStorage, SessionStorage, IndexedDB, or cookies. Refreshing or closing the tab instantly clears all request configurations, URLs, headers, and credentials.
- **Request Builder**:
  - Full HTTP method support: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS` with distinct visual badges.
  - Bidirectional Query Parameter synchronization between URL bar and Params table.
  - Key-Value parameter table + Bulk text editor mode (`key:value`).
  - Common header chips and autocomplete (`Content-Type`, `Accept`, `Authorization`, `X-API-Key`, `Cache-Control`, `User-Agent`).
  - Intelligent `Content-Type` management when switching body formats.
  - Browser-restricted header warnings (e.g. `User-Agent`, `Cookie`, `Origin`).
- **Comprehensive Body Types**:
  - `None`
  - `JSON` with Format, Minify, Validate, syntax error line/column tracking, and execution safeguard.
  - `Text`, `XML`, `HTML`, `JavaScript` with structure validation and formatting.
  - `Form URL Encoded` with dynamic key-value row editor.
  - `Multipart Form Data` with dynamic field & file uploads (boundary managed natively by browser).
  - `Binary / File` payload picker with size and type inspection.
- **Authentication**:
  - `No Auth`
  - `Basic Auth` (Username & Password with Base64 encoding)
  - `Bearer Token` with masking toggle
  - `API Key` (configurable as Header or Query Parameter)
  - `Custom Header`
- **Response Viewer**:
  - Status code indicators (2xx Success, 3xx Redirect, 4xx Client Error, 5xx Server Error, Network/CORS Failed).
  - Response metrics: status, duration (ms), total payload size (B / KB / MB), Content-Type, and timestamp.
  - **Pretty Mode**: Formatted JSON with syntax highlighting and interactive collapsible/expandable Tree View.
  - **Raw Mode**: Monospace response text with line wrap toggle.
  - **Preview Mode**: Sandboxed HTML `iframe` preview and image viewer.
  - **Headers Mode**: Key-value table with search/filter and copy actions.
  - Quick actions: Copy response body, Download payload with proper file extension, Clear response.
- **Executive Crimson & Mahogany Enterprise Theme**:
  - Engineered for enterprise developers with high-clarity Obsidian Mahogany & Tuscan Carmine aesthetics.
  - Comprehensive dark and light mode precision across all cards, navigation tabs, segmented controls, syntax highlighting, and dialogs.
  - Responsive across desktop, tablet, and mobile screens.

---

## Getting Started

### Prerequisites

- Node.js 18+ (tested on Node.js 24)
- npm or pnpm

### Development Server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Production Build

```bash
npm run build
npm run preview
```

The static site is generated inside the `build/` directory ready for deployment on GitHub Pages or any static host.

