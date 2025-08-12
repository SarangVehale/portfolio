# My Portfolio

`https://sarangvehale.github.io/portfolio/`

A minimal, terminal-insprired personal site built with Hugo. Because GUIs are bloat and most of the web is a fleeting nightmare of JavaScript frameworks and I absolutely despise it.

This is just static HTML generated from Markdown. It's ridiculously fast, secure, and version-controlled with Git. The way things should be.

---

### Stack

- **OS:** Arch Linux, btw.
- **Generator:** [Hugo](https://gohugo.io/) (the fast one).
- **Theme:** [Rissotto](https://github.com/joeroe/risotto) (becauase it looks like a well-riced terminal)
- **Content:** Plain ol' Markdown files.
- **Deployment:** Git-based CI/CD via Github Actions.

---

### Running Locally (Why do you want my portfolio (stare....))

Prerequisites: You need `git` and `hugo`. If you don't have them, you know what to do.

```bash
# Clone the repo (if you haven't already)
git clone https://github.com/SarangVehale/portfolio.git
cd portfolio

# Fire up the local server
# The -D flag builds drafts. You probably wnat that
hugo server -D
```

Therserver watches for changes. You save a file, the browser reloads. Simple

---

### Workflow

Everything is content. Adding new stuff is done via the command line.

**New Project:**

```bash
hugo new project/my-cool-new-thing.md
```

**New Blog Post/Article:**

```bash
hugo new posts/some-esoteric-ramble.md
```

This uses the templates in the archetypes/ directory. Don't repeat yourself.

---

### Ricing the Site

Customization is the whole point.

- `hugo.toml`: The main config. Colors, sidebar text, menus, social links. It's all in there. Tinker away.
- `assets/css/custom.css`: For any CSS tweaks that `hugo.toml` can't handle. It's empty by default. Add what yoo need.
- `layout/partials/footer.html`: Had to override the theme's default footer to kill some annoying hardcoded text. This is the Hugo wayy. If something in the theme bothers you, override it.

---

### Deployment

The deployment pipeline is automated. No messing with FTP clients or web panels.

```bash
#1. Make your changes.
#2. Commit them.

git add .
git commit -m "feat: add new project and fix a typo"

#3. Push to main.
git push origin main
```

That's it. Github Actions sees the push, runs the workflow defined in `.github/workflows/deploy.yml`, builds the site, and deploys it to Github Pages. Set and forget.

Check the `Actions` tab in you Github repo to see the magic happen.

---

### Contributing

It's a personal portfolio. Fork it if you want, but... why?

If you find a typo, I might accept a PR. No promise.

---

Go sleep, Go sleep. Or the penguin will haunt you !!
