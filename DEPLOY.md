# Deploying

This site is a static folder of HTML, JS, and Markdown. Any static host
works. Below are step-by-step recipes for the most common options. Pick one
— they're all free for a personal site.

Before you start, make sure the site runs locally (see the [Running it
locally](README.md#running-it-locally) section in the main README).

- [GitHub Pages](#github-pages) — best for the workflow `git push → live`
- [Netlify](#netlify) — fastest with a drag-and-drop
- [Vercel](#vercel) — CLI-friendly
- [Cloudflare Pages](#cloudflare-pages) — fast CDN, generous limits
- [Custom domain](#custom-domain)
- [HTTPS](#https) (already included on all four)
- [Disabling cache while editing](#disabling-cache-while-editing)

---

## GitHub Pages

You probably want this one given the resume already points to
`sarangvehale.github.io/portfolio`.

1. Create a repo on GitHub. Either:
   - Name it `<yourusername>.github.io` for a root-domain site, or
   - Name it anything (e.g. `portfolio`) for a subpath site at
     `https://<yourusername>.github.io/portfolio/`.

2. From this folder:

   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin git@github.com:<yourusername>/<reponame>.git
   git push -u origin main
   ```

3. On GitHub → Settings → **Pages**:
   - **Source**: Deploy from a branch
   - **Branch**: `main` / `(root)`
   - Save.

4. Wait ~30 seconds. Your site is at the URL Pages shows you.

5. **Future updates**: edit `content.md` or any file in `content/`, then:

   ```bash
   git add -A && git commit -m "Update" && git push
   ```

   The site rebuilds automatically in under a minute.

### Common Pages gotchas

- If the site loads but shows the "Can't load content.md" screen, your
  fetches are 404ing. Open DevTools → Network and check the paths. On
  GitHub Pages subpath deploys the paths are relative so this should just
  work; if it doesn't, ensure you didn't accidentally hardcode `/content.md`.
- If your repo is private, Pages publishes from the `main` branch only on
  paid plans. Make the repo public or upgrade.
- Pages is case-sensitive. `Photos/foo.jpeg` ≠ `photos/foo.jpeg`. Stick to
  lowercase filenames in `content.md` and the filesystem.

---

## Netlify

Easiest option for a first deploy.

**Drag-and-drop (no Git):**

1. Visit <https://app.netlify.com/drop>.
2. Drag this entire folder onto the page.
3. Your site is live in seconds at a random `*.netlify.app` URL.
4. To update: drag the updated folder again, or hit "Deploy folder".

**Git-connected (recommended for ongoing edits):**

1. Push the folder to a GitHub repo (see GitHub steps 1–2 above).
2. On Netlify → Add new site → Import an existing project → GitHub.
3. Pick the repo. **Build command**: leave blank. **Publish directory**:
   leave as `.` (project root).
4. Deploy. Future `git push` → automatic redeploys.

---

## Vercel

If you already use Vercel for other projects.

```bash
npm i -g vercel
vercel
```

Answer the prompts (link to a project, accept defaults — no build command,
no framework). Future deploys: `vercel --prod`.

Or connect a GitHub repo via the Vercel dashboard — push to deploy.

---

## Cloudflare Pages

Cloudflare's CDN is the fastest of the bunch. Free for personal sites.

1. Push the folder to a GitHub repo.
2. On <https://dash.cloudflare.com> → Pages → Create a project → Connect to
   Git.
3. Build command: leave blank. Build output: leave as `.`.
4. Deploy.

---

## Custom domain

You'll need a domain you've bought from a registrar (Namecheap, Cloudflare,
Porkbun, Google Domains, etc.).

### GitHub Pages

1. Pages → Custom domain → enter `yoursite.com` → Save.
2. At your registrar, point DNS at GitHub:
   - **Apex** (`yoursite.com`): four A records to `185.199.108.153`,
     `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   - **www** (`www.yoursite.com`): a CNAME to
     `<yourusername>.github.io`.
3. Wait up to an hour for DNS, then tick **Enforce HTTPS** in Pages
   settings.

### Netlify / Vercel / Cloudflare

Their dashboards walk you through adding a custom domain — usually a CNAME
to a `*.netlify.app` / `*.vercel.app` / `*.pages.dev` hostname. HTTPS certs
are issued automatically.

---

## HTTPS

All four hosts provision HTTPS automatically via Let's Encrypt. You don't
need to do anything beyond setting up the custom domain.

---

## Disabling cache while editing

The site adds `?v=<timestamp>` to every fetch (`content.md` and each file in
`content/`), so edits should appear on refresh. If a stale photo or `.md`
shows up after pushing, use:

- **Chrome / Firefox**: DevTools → Network → "Disable cache" (only while
  DevTools is open).
- **Force reload**: ⌘⇧R (Mac) / Ctrl+F5 (Windows).

For production, this aggressive cache-busting is fine — the files are
~kilobyte-sized.

---

## Sanity checklist before going public

- Replace every `REPLACE_ME` in `content/experience.md` and
  `content/certificates.md` with real Drive URLs (or remove the field).
- Replace the resume placeholder URL in the header of `content.md`.
- Set Drive sharing to "Anyone with the link" for every cert (see the
  Google Drive section in the main README).
- Add at least one photo if you don't want the empty-hero placeholder to
  show.
- Test all internal nav links and at least one external project link.
- View the site on your phone — the layout adapts but content sometimes
  surprises.
- Toggle dark mode and re-test — make sure no contrast issues remain.
