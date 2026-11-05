# Security notes

This is a static personal page with **no executable JavaScript at
all** — not a build artefact, an actual absence. `index.html` has
exactly one `<script>` tag, and it's `type="application/ld+json"`: a
data block for search engines, never parsed as a script by a browser.
No fetch calls, no API calls, no third-party scripts, no analytics, no
forms, no user input.

## Threat model

The only realistic attack surface is **the repository itself**: if a
GitHub account with write access were compromised, an attacker could
edit `index.html` directly. There is no content pipeline, no markdown
renderer, and no runtime fetch to poison instead — editing the page
*is* editing the site.

## Content-Security-Policy

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src https://fonts.gstatic.com data:;
img-src 'self' data:;
connect-src 'self';
base-uri 'self';
form-action 'self';
```

- `script-src 'self'` with no `'unsafe-inline'`: even if an attacker
  injected an inline `<script>` tag into the HTML, the browser would
  refuse to run it. Since the page has no legitimate inline scripts
  either, this costs nothing.
- `img-src 'self' data:`: images load only from this origin, no
  remote image hotlinking. The two mythology images are vendored into
  `images/` precisely so this can stay tight.
- `style-src` allows Google Fonts' stylesheet origin only, needed for
  Fraunces / Inter / JetBrains Mono / Noto Sans JP / Noto Serif
  Devanagari.
- `connect-src 'self'`: nothing on the page makes a network request at
  all, but this is a defence-in-depth backstop regardless.

## Reporting an issue

If you find a real vulnerability (not a style nitpick), please file a
public issue on the repo — there's no sensitive data here to protect,
so there's no need for a private disclosure channel.
