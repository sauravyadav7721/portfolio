# Saurav Yadav, portfolio

A static site: `index.html`, `styles.css`, `script.js`. No build step.

## Before you deploy

In `index.html`, find the Contact section and replace:
- `your-email@example.com` (in two places: the link and its text)
- `https://www.linkedin.com/in/your-linkedin`
- `https://www.instagram.com/your-handle`

## Deploy on Vercel

Option 1, drag and drop: go to vercel.com/new, choose to import a folder or use the Vercel CLI.

Option 2, CLI:
```
npm i -g vercel
cd saurav-portfolio
vercel --prod
```

Option 3, GitHub: push this folder to a repo, import it on Vercel, and leave the framework preset as "Other". No build command and no output directory are needed.

## Preview locally

```
npx serve .
```
