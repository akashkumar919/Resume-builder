# Resume Studio — Reference Resume Builder

A React + Vite resume builder with dynamic sections, live A4 preview, browser autosave, JSON import/export, and selectable-text PDF export using `@react-pdf/renderer`.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Build for production

```bash
npm run build
npm run preview
```

## Features

- Edit personal details and all resume sections.
- Add, delete, reorder entries.
- Hide and restore sections; change section headings and section order.
- Live A4-style resume preview.
- Download a PDF with selectable text and automatic multi-page support.
- Autosaves to browser `localStorage`.
- Export/import resume data as JSON.
- Includes sample content based on the provided reference resume; replace it with your own information.

## Notes

- The PDF layout follows the provided reference's compact, black-and-white structure, but browser preview and PDF renderer can differ slightly in font metrics and page breaks.
- Use complete URLs (including `https://`) for clickable links in the PDF.
- Data stays in the current browser; there is no account or cloud sync.
