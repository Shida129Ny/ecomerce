# Goodsly Store Dashboard

A clean, responsive ecommerce catalog dashboard for managing products and categories.
Built with Vue 3 and Vite, it runs entirely in the browser and persists catalog changes in local storage.

![Vue](https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/license-Not%20specified-lightgrey)

## Features

- Dashboard overview with product, category, stock, and inventory totals
- Create, edit, search, sort, and delete products
- Create, edit, search, and delete categories
- Low-stock indicators for products with fewer than 10 units
- Automatic duplicate checks for category names and SKU values
- Protection against deleting categories that still contain products
- Responsive navigation and data tables
- Starter catalog data on first launch
- Browser-local persistence with no backend required

## Tech stack

- [Vue 3](https://vuejs.org/) with the Composition API
- [Vite](https://vite.dev/)
- JavaScript
- CSS
- Browser `localStorage`

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm

### Installation

```sh
git clone https://github.com/Shida129Ny/ecomerce.git
cd ecomerce
npm install
```

### Development

```sh
npm run dev
```

Open the local URL printed by Vite, typically `http://localhost:5173`.

### Production build

```sh
npm run build
npm run preview
```

The production-ready files are generated in `dist/`.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |

## Project structure

```text
src/
├── category/
│   ├── CategoryForm.vue    # Category create/edit form
│   └── CategoryList.vue    # Category cards and actions
├── product/
│   ├── ProductForm.vue     # Product create/edit form
│   └── ProductList.vue     # Product table and actions
├── App.vue                 # Dashboard state and navigation
├── main.js                 # Vue application entry point
└── style.css               # Global application styles
```

## Data storage

The dashboard uses the `goodsly-store-data` key in browser `localStorage`. Product and category changes are saved automatically.

Clearing site data or using a different browser profile will reset the dashboard to its starter catalog.

## Notes

- This is a client-side demo; it does not include authentication or a remote database.
- Product prices are displayed in USD.
- A category must exist before a product can be added.
