# Security notes

This is a static personal page. It runs one self-hosted script,
`assets/site.js`, which draws SVG and handles the gallery, dialogs and
navigation. There are no fetch calls, API calls, third-party scripts, analytics,
external fonts or forms. The only user input is the project search box, which
filters cards already on the page and is never written back into the DOM.

All content is in the raw HTML, so the page reads without JavaScript.

## Threat model

The only realistic attack surface is the repository itself: if a GitHub account
with write access were compromised, an attacker could edit the site directly.
There is no content pipeline, renderer or runtime fetch to poison instead.

## Content-Security-Policy

```
default-src 'none';
script-src 'self';
style-src 'self';
font-src 'self';
img-src 'self' data:;
connect-src 'self';
base-uri 'none';
form-action 'none';
```

- `script-src 'self'` and `style-src 'self'`, with no `'unsafe-inline'`: injected
  inline scripts, styles or style attributes will not apply. Script sets styles
  through the CSSOM and the Web Animations API, which this policy allows.
- `font-src 'self'`: fonts are vendored in `assets/fonts/`, so no request goes to
  a font CDN.
- `img-src 'self' data:`: images and CSS masks load from this origin only.

The policy is delivered by `<meta>`, because GitHub Pages cannot set headers.
That means `frame-ancestors` is not available.

## Published documents

Certificates are served as images. Only pages meant for publication are included.
Page 2 of the I4C PDF (internship terms) is deliberately left out.

## Reporting an issue

If you find a real vulnerability, please file a public issue on the repo. There is
no sensitive data here, so no private disclosure channel is needed.
