# Security notes

This is a **static personal site** rendered entirely client-side. It has
no backend, no database, no user input, no comments, no analytics, no
API calls anywhere. The threat model is correspondingly small. This
document describes what protections are in place anyway, what attacks
they defend against, and where the limits sit.

## Threat model

The realistic attack surface is exactly one thing: **content you
yourself put into your repository**. If your GitHub account is
compromised and an attacker writes to your repo, they could put
malicious content into a `.md` file. Below is what the site does to
limit blast radius even in that case.

For everything else — the deployed site has nothing for an attacker to
target. No login, no form submissions, no third-party scripts that
phone home. The only network requests it makes are:

1. Fetching its own `.md` files from the same origin.
2. Loading Google Fonts (CSS and font files) over HTTPS.

## Defences in place

### 1. Content-Security-Policy

`index.html` ships with a strict CSP via `<meta http-equiv>`:

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src https://fonts.gstatic.com data:;
img-src 'self' data: https:;
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

Key implications:

- **`script-src 'self'`** — only scripts served from your own origin
  run. Inline `<script>` tags are disallowed; even if an attacker
  managed to inject `<script>` HTML through some renderer bug, the
  browser would refuse to execute it.
- **`frame-ancestors 'none'`** — the site cannot be iframed by another
  origin. Mitigates clickjacking.
- **`object-src` and `base-uri`** — locked down.
- **`connect-src 'self'`** — no cross-origin fetches. Prevents data
  exfiltration if any script ever did run.
- **`img-src https:`** is intentionally lenient — Markdown image links
  can point at any HTTPS URL. If you want to lock it to just your
  origin, change this to `img-src 'self'` and stop hot-linking images
  in Markdown.

To deliver this as a real HTTP header (slightly stronger than the
`<meta>` version), most static hosts let you add a `_headers` file
(Netlify, Cloudflare Pages) or `vercel.json`. See your host's docs.

### 2. Markdown sanitisation

The included renderer (`md.js`) does three things:

- **HTML escapes every input** before any inline processing.
- **URL-scheme allow-list on links and images** — only `http(s)`,
  `mailto`, `tel`, relative paths, and `#`-hashes pass through. Other
  schemes (notably `javascript:` and untrusted `data:` URIs) are
  rewritten to `#`. See `md.js > sanitizeUrl()`.
- **Never produces** `<script>`, event-handler attributes, or `style`
  attributes regardless of input.

If you swap `md.js` for a third-party library (marked, markdown-it,
etc.), enable its built-in sanitiser or pass output through DOMPurify
before injecting.

### 3. External-navigation guard

`app.js > safeExternal()` validates any URL that the site is about to
open in a new tab (`window.open`) before doing so. Same scheme
allow-list as `md.js`. This applies to `link:` fields on projects,
`cert:` fields on experience entries, and the global search "open"
action.

### 4. `noopener noreferrer` on every external link

All external `<a>` tags rendered by the site include
`target="_blank" rel="noopener noreferrer"`. This prevents
[tabnabbing](https://owasp.org/www-community/attacks/Reverse_Tabnabbing)
and stops the referer leaking to the target.

### 5. Strict referrer policy

`<meta name="referrer" content="strict-origin-when-cross-origin">` —
when you click an external link, only your origin (not the path) is
sent as `Referer`.

### 6. No `localStorage` of sensitive data

The only thing the site stores client-side is the dark-mode preference
(`theme=dark`). No tokens, no user data, no cookies.

### 7. No third-party JavaScript

Pinned, with integrity hashes, with sandboxing, etc. would all be
good — but it doesn't matter here because **there is no third-party JS
at all**. Only `app.js` and `md.js`, both served from your origin.

The only third-party network requests are CSS / fonts from Google
Fonts. If you want to remove that too, self-host the fonts and drop the
`fonts.googleapis.com` / `fonts.gstatic.com` allowances from the CSP.

## What's NOT a defence (and why it's fine)

- **No password.** It's a public website. There's nothing to log into.
- **No CAPTCHA, no rate-limiting.** No forms or endpoints to spam.
- **No CSRF protection.** No state-changing requests.

## Repo-hardening checklist

The strongest improvement you can make is keeping your **GitHub account
secure**, because that's the only path an attacker has into your
repo's content. Recommended:

- [ ] **2FA** on GitHub. Hardware key or TOTP, not SMS.
- [ ] Use a **passkey** or hardware key for sign-in.
- [ ] **Branch protection** on `main`: require pull request reviews
      if anyone else has push access. (Skip if it's just you.)
- [ ] Periodically audit **Settings → Applications** for OAuth apps and
      personal access tokens you no longer need.
- [ ] Keep the repo **public** rather than private with collaborators —
      makes account compromise more visible and easier to audit.

## Dependency surface

This site has **zero npm / package dependencies**. No `package.json`.
There's nothing to `npm audit`. Future-you will never have to fix a
transitive supply-chain vulnerability.

The only external resources are:

| Resource                        | Purpose                | Risk if compromised                          |
| ------------------------------- | ---------------------- | -------------------------------------------- |
| `fonts.googleapis.com` (CSS)    | Font declarations      | CSS injection (limited by CSP)               |
| `fonts.gstatic.com` (binaries)  | Font files             | Glyph substitution; no script execution      |

If you ever switch hosts, replace Google Fonts with self-hosted copies
(e.g. via [fontsource](https://fontsource.org)) to eliminate even this.

## Reporting

If you find a security issue with the included `md.js` or `app.js`
(e.g. a way to break out of HTML escaping, a way to inject a script tag,
a CSP bypass), please open a private issue or email me directly. Don't
file public issues — give me a chance to patch first.

## Last reviewed

This document was last reviewed at the time of the same commit that
introduced the strict CSP and URL sanitisation. Re-review whenever
adding new third-party resources or new content kinds.
