kind: project
title: neiro
date: 2026-05-30
tags: music, software, open-source
summary: NEIRO (音色) is a free, public music archive, a zero-infrastructure static site over a GitHub repository. No backend, no database, no tracking.
link: https://github.com/SarangVehale/hibiki

Most personal music archives depend on a server, a database, or a third-party host, any of which can go away.

NEIRO is a static site built directly over a GitHub repository: no backend, no database, no tracking. The archive lives entirely in version control, so it can be forked or mirrored, and hosting it costs nothing.

---

kind: project
title: CERTIFY-ED
date: 2026-03-15
tags: quantum, research, python, validation
summary: A formal verification and benchmarking framework for exact diagonalization of quantum many-body systems. On arXiv; being submitted to SciPost.

Quantum simulations are only as trustworthy as the implementations that produce them. When two libraries disagree by a part in a million, which one is right?

CERTIFY-ED is a multi-oracle validation framework that cross-checks quantum many-body simulations across **SageMath**, **NumPy** and **Lanczos methods**: symbolic Hermiticity certification of the Hamiltonian, deterministic eigenvalue resolution across three independent solvers, and reproducibility guarantees across environments.

Achieved relative error below 10⁻¹¹ and 12-digit agreement with analytical solutions across the benchmark systems tested, and is used as the validation backbone for the wider Noisy Low-Scale Quantum Systems (NLSQ) work at CDAC Pune. The preprint is on arXiv; the manuscript is being submitted to SciPost.

---

kind: project
title: symveig
date: 2026-06-16
tags: quantum, research, python, validation
summary: Verified eigenvalue enclosures for symmetry-decomposed Hermitian matrices. Extends CERTIFY-ED. Open source, with a Zenodo-archived test suite.

An eigenvalue solver returns a number, not a guarantee. Without a verified enclosure, a result can only look plausible, not be provably within a known distance of the true eigenvalue.

symveig extends CERTIFY-ED with verified eigenvalue enclosures, using symmetry-sector decomposition to keep certification tractable as system size grows: each Hermitian matrix is decomposed by symmetry sector before the enclosure is computed, so verification cost scales with the sector, not the full matrix.

Released open source, with a Zenodo-archived test suite. The preprint is on arXiv (see [publications](publications.md)) and has been submitted to Computer Physics Communications.

---

kind: project
title: OSINT Platform for I4C (Indian Ministry of Home Affairs)
date: 2025-03-01
tags: osint, cybersecurity, llm, python
summary: An intelligence platform built during an internship at India's Ministry of Home Affairs (I4C). Details are under NDA.

Built during an internship at India's Ministry of Home Affairs (I4C). An intelligence platform covering data collection, cleansing and entity correlation, delivered with documentation and training for non-technical users.

Details of the platform's internal workings, data and findings are covered by an NDA, and the code is not public.

---

kind: project
title: dotman
date: 2025-06-20
tags: rust, tui, dotfiles, tooling
summary: A modular, TUI-based, Git-powered dotfiles manager. Built because every existing one annoyed me.
link: https://github.com/SarangVehale/dotman

A modular dotfiles manager with a terminal UI, written in **Bash and Python**, with Git as the storage backend. It supports profiles, machine-specific overlays, and a `dotman doctor` command that diagnoses broken symlinks across a fleet of machines.

The motivating annoyance: every existing dotfiles tool is either an opinionated framework or a glorified `cp` script. dotman sits between them — small, scriptable, with a UI good enough that I open it daily.

---

kind: project
title: rdd
date: 2025-04-10
tags: rust, systems, cryptography
summary: A memory-safe reimplementation of GNU dd in Rust, with built-in BLAKE3 / SHA-256 verification.
link: https://github.com/SarangVehale/rdd

A drop-in replacement for `dd(1)` written in **Rust**. Three reasons:

1. The original is a footgun and an interface museum piece.
2. Memory-safe systems code has no downside and a few real upsides.
3. Integrated cryptographic verification (BLAKE3 + SHA-256) so you can pipe `rdd` and trust the output hash without a second pass.

Extensible I/O architecture — backend modules implement a small trait, so adding a new source/sink (network, S3, archive format) is one file. Contributed back upstream to the GNU mailing list as part of a coreutils discussion.

---

kind: project
title: Custom mechanical keyboard
date: 2024-12-05
tags: hardware, kicad, firmware
summary: Designed a split keyboard from scratch — schematic, PCB, firmware. ATmega32U4. Ergogen → KiCad → JLCPCB.
link: https://github.com/SarangVehale

Designed a custom mechanical keyboard end-to-end. Schematic capture in **Ergogen** (parametric layout), routing in **KiCad**, fabrication via JLCPCB. The brain is an **ATmega32U4**; firmware is a fork of QMK with a custom layer for the home-row mods I actually use.

Three things I learned the hard way:

- PCB design with traces under switches is harder than the tutorials suggest.
- Solder paste stencils are worth the money.
- The first prototype is supposed to be wrong.

---

kind: project
title: Integer factorization with lattices and QAOA
date: 2024-07-15
tags: quantum, cryptography, research
summary: Hybrid quantum–classical algorithms combining Babai's and Schnorr's algorithms with QAOA. Published in Springer SN Computer Science.

CDAC summer internship work. The question: can you make Schnorr's lattice-based factorization approach computationally viable with a quantum accelerator?

We combined **Babai's nearest-plane algorithm** with **Schnorr's reduction** and used the **Quantum Approximate Optimization Algorithm (QAOA)** as the closest-vector solver. The hybrid approach is interesting less for the absolute numbers (small N, small qubit counts) and more for what it suggests about the boundary between lattice-based post-quantum security claims and accelerated classical attacks.

Published as _Survey of Integer Factorization using Lattice-Based Algorithms_ in **Springer Nature, SN Computer Science**.

---

kind: project
title: reconGram
date: 2024-02-20
tags: osint, python, security
summary: An Instagram OSINT tool — public-profile reconnaissance for investigators.
link: https://github.com/SarangVehale/reconGram

A small Python tool that gathers public reconnaissance data from Instagram profiles for investigative use: connected accounts, post metadata, geolocation tags where present, mutual follows, and cross-platform handle correlation.

Built for the I4C engagement; later open-sourced with the sensitive bits removed.

---

kind: project
title: map-this
date: 2024-01-10
tags: osint, python, data
summary: A dynamic, interactive, localised crime map built from cybercrime.gov.in data.
link: https://github.com/SarangVehale/map-this

Scraping and visualisation pipeline that turns public cybercrime reports into a localised, interactive map. Built as a teaching aid for LEA training sessions — looking at where complaints cluster geographically tells you more about cybercrime in 30 seconds than a quarterly report does in 30 pages.
