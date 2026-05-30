# content/faq.md
#
# Each `---` block is one Q&A. The `title:` line is the question, the
# body is the answer. Use `order: N` to control the order on the page
# (lower numbers first). Without `order:`, entries fall to the bottom.
#
# To add a question:
#   1. Scroll to the bottom of this file.
#   2. Type --- on its own line.
#   3. Write `title: <the question>` and a blank line.
#   4. Write the answer in Markdown.
#   5. Save. Refresh. Done.

---

kind: faq
parent: about
order: 1
title: What do you actually do?

I'm a researcher and engineer working at the intersection of
**cybersecurity** and **quantum computing**. Day-to-day that means:

- Writing benchmarking and verification tools for quantum systems
  (most recently *CERTIFY-ED*, now on arXiv).
- Building OSINT and threat-intelligence systems for Indian law
  enforcement (through I4C / MHA).
- Researching post-quantum cryptography and the lattice-based
  side of integer factorization.

When I'm not doing that I write systems software in Rust, maintain
a Proxmox homelab, and occasionally design my own keyboards.

---

kind: faq
parent: about
order: 2
title: Are you available for work?

Yes, selectively. I'm interested in:

- Research collaborations on quantum benchmarking, post-quantum
  cryptography, or hybrid classical–quantum algorithms.
- Short consulting engagements on OSINT tooling, threat intel
  pipelines, or LEA-facing systems.
- Speaking / teaching opportunities (especially anything that
  needs translation between cybersecurity practitioners and
  judicial / policy audiences).

Email is the fastest way to start a conversation:
[sarangvehale2@gmail.com](mailto:sarangvehale2@gmail.com).

---

kind: faq
parent: about
order: 3
title: What's your tech stack?

- **Daily driver** — Arch Linux on a ThinkPad. Tmux + Neovim.
- **Programming** — Python and Rust most days. C for systems work,
  R for statistics, Bash for everything in between.
- **Quantum** — Qiskit, PennyLane, SageMath, NumPy.
- **Infrastructure** — Proxmox, Docker, pfSense, Snort. Self-hosted
  most of what I use.
- **Writing this site** — three files: `index.html`, `app.js`,
  `md.js`. Zero dependencies. Markdown for everything else.

---

kind: faq
parent: about
order: 4
title: Can I see the source code for this site?

Yes — it's on [GitHub](https://github.com/SarangVehale/portfolio).
The whole thing is one HTML file, two small JS files, and a folder
of Markdown. No build step. Feel free to fork it.

---

kind: faq
parent: about
order: 5
title: How can I keep up with what you publish?

The [notes](#/notes) and [blog](#/writing) pages are the canonical
sources. There's no newsletter or RSS feed yet — if either would be
useful to you, let me know and I'll add it.

For papers: my Google Scholar profile is the most up-to-date list.
For code: GitHub.

---

kind: faq
parent: about
order: 6
title: Why this minimal style? No images, no animations?

I'm tired of websites that take five seconds to load a paragraph of
text. This site loads in under 100ms, works without JavaScript for the
core content (sort of — it's a small SPA, but everything is plain
HTML+CSS once it boots), and reads well on any screen.

A boring website that respects your time is, I think, an act of
hospitality.
