# Shrinidhi Hariharasuthan — portfolio

A one-page portfolio for GitHub Pages. Everything the page says comes from
`portfolio-content.json`, so you update the site by editing that one file.

## Files

| File | What it does |
| --- | --- |
| `index.html` | Page structure |
| `styles.css` | Look and feel (colours, type, layout) |
| `script.js` | Reads the JSON and fills in the page |
| `portfolio-content.json` | All your content |
| `assets/` | Your photo, the hero illustration and the college logos |
| `favicon.svg` | Browser-tab icon |
| `.nojekyll` | Tells GitHub Pages to serve the files as-is |

## Put it online with GitHub Pages

1. Sign in to GitHub. Click **+** (top right) → **New repository**.
2. Name it `<your-username>.github.io` (for example `shrinidhi-h.github.io`).
   This gives you the address `https://<your-username>.github.io`.
   Any other name works too; the address becomes `https://<your-username>.github.io/<repo-name>/`.
3. Set it to **Public** (Pages needs a public repo on a free account) and click **Create repository**.
4. On the new repo page, click **uploading an existing file** (or **Add file → Upload files**).
5. Drag in **all the files from inside this folder** — not the folder itself — and click **Commit changes**.
   `.nojekyll` is hidden on Mac/Windows; if it doesn't upload, the site still works.
6. Go to **Settings → Pages**. Under **Build and deployment**, set Source to **Deploy from a branch**,
   pick branch **main** and folder **/ (root)**, then **Save**.
7. Wait a few minutes, then open your address. It can take up to 10 minutes the first time.

## Update your content

Open `portfolio-content.json` on GitHub, click the pencil icon, edit, and **Commit changes**.
The site updates within a few minutes.

- Keep the JSON valid: every item in a list needs a comma after it except the last one.
- In `headlineRich`, wrap words in `<em class="text-terracotta">…</em>` to set them as red italic highlight words.
- Each entry in `roles` becomes a card in the Work column (left) and each entry in `education`
  a card in the Education column (right), newest first by start year. Cards in the same row line up.
- A role whose `period` contains "Now" gets a red dot next to its dates.
- Each entry in `portfolio` becomes a project card (`name` and `description`). Add
  `"link": "https://…"` to a project to show a "View project" link on its card.
- `wordCloud` is the block of skills beside the headline. Each inner list is one line, e.g.
  `["AI Strategy", "A/B Testing"]`. Every line is stretched to the full width, so shorter lines
  come out bigger. Colours alternate automatically.
- Colours live at the top of `styles.css`: white `#FFFFFF`, grey `#D1D1D1` (borders),
  red `#C25F5F` (highlights), dark red `#703030` (titles and buttons), near-black `#2B2B2B` (body text).

## Change the images

Images live in the `assets` folder and the JSON points to them:

- `persona.photo` → `assets/headshot.jpg` (shown as a circle in the About section)
- `experience.education[].logo` → `assets/iimb-logo.png`, `assets/iitm-logo.png`

To swap one, upload a new file with the same name, or upload any name and update the path in the JSON.
Remove a key from the JSON and that image simply disappears from the page.

Keep the folder structure when uploading: on GitHub, drag the whole `assets` folder into the upload
box along with the other files and it keeps its name.

## Preview on your computer

Opening `index.html` by double-clicking won't load the content, because browsers block a page
from reading local files. Run a small local server in this folder instead:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Use your own domain (optional)

In **Settings → Pages → Custom domain**, enter your domain, then add the DNS records GitHub shows you
at your domain registrar.
