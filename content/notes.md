# content/notes.md
#
# Anything you want to remember, share, or come back to. Quick thoughts,
# how-tos, idea dumps, running logs — all of them go here.
#
# To add a new note:
#   1. Scroll to the bottom of this file.
#   2. Type --- on its own line.
#   3. (Optional) add `title:`, `date:`, `tags:`. All of them default
#      sensibly if you omit them. `kind: note` is implied by the filename.
#   4. Write whatever you want in Markdown.
#   5. Save. Refresh. Done.
#
# If a note is long enough that you'd rather keep it in its own file,
# create content/notes/<slug>.md instead and add a `file:` line in
# ../content.md.  See content/notes/disable-onedrive-windows.md for an
# example of the per-file pattern.

---

title:   Publications
date:    2026-01-01
tags:    research, papers
summary: A running list of what I've published or have under review.

- **CERTIFY-ED: Formal Validation and Benchmarking Framework for Exact Diagonalization of Quantum Many-Body Systems** — on arXiv; submission in progress to *SciPost*.
- **Hierarchical Quantum-Accelerated Federated Learning for Scalable, Auditable, Cross-Enterprise AI Governance** — *IJSET*.
- **Some Results on Cumulative Residual Inaccuracy Measure of k-Record Values** — *MDPI Entropy*.
- **Survey of Integer Factorization Using Lattice-Based Algorithms** — *Springer Nature, SN Computer Science*.
- **From Qubits to Quantum Radar: A Comprehensive Exploration of Quantum Machine Learning** — book chapter, *CRC Press*.

---

title:   Homelab
date:    2025-09-01
tags:    linux, infrastructure, self-hosting
summary: A Proxmox-based homelab running Plex, Nextcloud, Pi-hole, and an evolving set of security tools.

I run a **Proxmox** cluster at home with the usual self-hosted suspects (Plex, Nextcloud, Pi-hole) plus an ongoing experiment with **Snort** as an IDS and **pfSense** for firewalling. Most services are containerised. Arch Linux user of 3+ years for the daily driver.

The homelab is the most reliable teacher I've ever had — every outage, misconfiguration, and weird routing issue is a small graduate course in systems.

---

title:   Open-source contributions
date:    2025-05-01
tags:    open-source
summary: Upstream contributions, however small.

- **GNU coreutils** (`dd`) — via the GNU mailing list workflow
- **Linux Kernel** — documentation contributions via upstream process
- **SageMath** — small contributions to symbolic computation tooling
- Long-running participant in **Hacktoberfest**, **GSSoC**, and **Linux Foundation** mentorship programs

---

# An idea-dump note with no title and no date. Both auto-fill.
# (You don't even need to leave a blank line before the body when there's
# no frontmatter — but it's nicer to read.)

Was thinking about how every problem in cybersecurity eventually reduces to
a problem in someone's mental model — the gap between what they think the
system does and what it actually does.

The corollary: most security training is mental-model repair, not
information transfer.

---

date: 2026-05-12
tags: systems, evening-thought

# A longer thought, with a title written as an H1.

I want to revisit this: every tool I love eventually becomes load-bearing
in a way I didn't plan for. **dotman** started as a weekend project and
now I would genuinely be slower at my job without it. *rdd* the same —
built it to learn Rust, now half my homelab transfers run through it.

The pattern: I write a tool to **understand** something, and the act of
writing it makes me unable to stop using it.

> If you want to know whether something is worth building, ask yourself
> whether you'd keep using it after you understood the thing it taught
> you. The answer is yes more often than you'd think.

---

date: yesterday
tags: homelab, snort

## On Snort rules

Spent the evening tuning Snort rules. Realised the rules I keep are the
ones whose authors I can name — there's a parallel to dotfiles. The
configuration you trust is the configuration whose author you trust, and
that's almost always *yourself, last month, with notes*.

Note to self: write a post about this.
