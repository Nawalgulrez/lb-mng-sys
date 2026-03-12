# Library Management Practice App

Simple **library management** web app built with **HTML, CSS and JavaScript** that you can use to practice **DevOps workflows** (Git, CI/CD pipelines, Docker, static hosting, etc.).

The app stores data in **localStorage** so you do not need a backend service.

## Features

- **Books**
  - Add, edit, delete books (title, author, ISBN)
  - See whether a book is **available** or **on loan**
- **Members**
  - Add, edit, delete members (name, email)
- **Loans**
  - Create a loan (pick book + member, set loan & due date)
  - Mark loans as **returned**
  - Filter by **All / Active / Returned**
- **Demo data**
  - First run seeds sample books and members
  - `Reset Demo Data` button clears localStorage and reseeds

## Tech stack

- **Frontend**: HTML, CSS, vanilla JavaScript
- **Storage**: `localStorage` in the browser
- **DevOps‑friendly**: static site, easy to:
  - put under Git
  - build and deploy with CI/CD
  - host on any static host (S3, GitHub Pages, Netlify, etc.)
  - wrap in a simple Docker image (Nginx or any static web server)

## Project structure

- `index.html` – main page and layout (navigation, tables, modals)
- `styles.css` – modern, responsive UI styling
- `app.js` – all client‑side logic and localStorage handling
- `package.json` – minimal metadata + a `start` script

## Running locally

In the `library-app` directory:

```bash
npm install
npm run start
```

Then open the URL printed in your terminal (usually `http://localhost:3000` or `http://localhost:5000`, depending on the `serve` tool).

> If you do not want Node/npm, you can also just open `index.html` directly in your browser by double‑clicking it.

## Example DevOps exercises

- **Git basics**
  - Initialize a repo, make commits for features (books, members, loans)
  - Create feature branches, merge with pull requests
- **CI pipeline**
  - Add a workflow that:
    - installs Node
    - runs `npm install`
    - runs a placeholder `npm run lint`
    - (optional) runs basic HTML/CSS linters
- **CD / deployment**
  - Build a pipeline that deploys this folder to:
    - GitHub Pages
    - Netlify / Vercel
    - S3 + CloudFront
- **Containerization**
  - Create a `Dockerfile` that serves the app via Nginx
  - Push the image to a registry and deploy it

