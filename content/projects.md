kind:    project
title:   CERTIFY-ED
date:    2026-03-15
tags:    quantum, research, python, validation
summary: A formal verification and benchmarking framework for exact diagonalization of quantum many-body systems. On arXiv; being submitted to SciPost.

**The problem.** Quantum simulations are only as trustworthy as the implementations that produce them. When two libraries disagree by a part in a million, which one is right? CERTIFY-ED is an attempt to answer that question with a verifiable consensus across multiple independent oracles.

## How it works

CERTIFY-ED is a multi-oracle validation framework that integrates **SageMath**, **NumPy**, and **Lanczos methods** for cross-verification of quantum simulations of many-body systems. It performs:

- Symbolic **Hermiticity certification** of the Hamiltonian before any numerical work begins.
- Deterministic eigenvalue resolution across three independent solvers, with consensus-based reporting.
- Reproducibility guarantees across heterogeneous environments — the same input produces the same eigenstructure on a laptop, an HPC node, or a CI runner.

## Results

Achieved relative error below 10⁻¹¹ and **12-digit agreement** with analytical solutions across the benchmark systems we tested. Used as the validation backbone for our wider work on Noisy Low-Scale Quantum Systems (NLSQ).

> The goal isn't faster simulation. It's *trustworthy* simulation — knowing the number you're reading is the number physics produced.

## Status

The preprint is live on **arXiv**; the manuscript is being submitted to **SciPost** (originally targeted for MDPI Axioms; switched venue after revisions). Built at CDAC Pune as part of the NLSQ benchmarking initiative.

---

kind:    project
title:   OSINT Platform for I4C (Indian Ministry of Home Affairs)
date:    2025-03-01
tags:    osint, cybersecurity, llm, python
summary: A flagship open-source-intelligence platform integrated into the Swayam platform for Indian law-enforcement agencies.

A six-month engagement with the **National Cyber-Crime Research & Innovation Centre** (NCR&IC) at I4C, under the Ministry of Home Affairs.

## What I built

- An **OSINT platform** integrated into the Swayam platform for use by Indian Law Enforcement Agencies. The platform combines social-media reconnaissance, public records, and threat-intel feeds behind a single investigative interface.
- A set of **LLM workflows** fine-tuned for LEA-specific NLP — entity extraction from FIRs, multi-lingual triage of cybercrime reports, and summarisation of long forensic transcripts.

## What I also did

- Conducted specialised training sessions for **judicial officers and LEAs** on cybersecurity best practices and investigation techniques.
- Coordinated the **Cyber Commandos Program** — designing the response playbooks and the threat-response workflow.

Cannot share code or screenshots. Happy to talk about the architecture in person.

---

kind:    project
title:   dotman
date:    2025-06-20
tags:    rust, tui, dotfiles, tooling
summary: A modular, TUI-based, Git-powered dotfiles manager. Built because every existing one annoyed me.
link:    https://github.com/SarangVehale/dotman

A modular dotfiles manager with a terminal UI, written in **Bash and Python**, with Git as the storage backend. It supports profiles, machine-specific overlays, and a `dotman doctor` command that diagnoses broken symlinks across a fleet of machines.

The motivating annoyance: every existing dotfiles tool is either an opinionated framework or a glorified `cp` script. dotman sits between them — small, scriptable, with a UI good enough that I open it daily.

---

kind:    project
title:   rdd
date:    2025-04-10
tags:    rust, systems, cryptography
summary: A memory-safe reimplementation of GNU dd in Rust, with built-in BLAKE3 / SHA-256 verification.
link:    https://github.com/SarangVehale/rdd

A drop-in replacement for `dd(1)` written in **Rust**. Three reasons:

1. The original is a footgun and an interface museum piece.
2. Memory-safe systems code has no downside and a few real upsides.
3. Integrated cryptographic verification (BLAKE3 + SHA-256) so you can pipe `rdd` and trust the output hash without a second pass.

Extensible I/O architecture — backend modules implement a small trait, so adding a new source/sink (network, S3, archive format) is one file. Contributed back upstream to the GNU mailing list as part of a coreutils discussion.

---

kind:    project
title:   Custom mechanical keyboard
date:    2024-12-05
tags:    hardware, kicad, firmware
summary: Designed a split keyboard from scratch — schematic, PCB, firmware. ATmega32U4. Ergogen → KiCad → JLCPCB.
link:    https://github.com/SarangVehale

Designed a custom mechanical keyboard end-to-end. Schematic capture in **Ergogen** (parametric layout), routing in **KiCad**, fabrication via JLCPCB. The brain is an **ATmega32U4**; firmware is a fork of QMK with a custom layer for the home-row mods I actually use.

Three things I learned the hard way:

- PCB design with traces under switches is harder than the tutorials suggest.
- Solder paste stencils are worth the money.
- The first prototype is supposed to be wrong.

---

kind:    project
title:   Integer factorization with lattices and QAOA
date:    2024-07-15
tags:    quantum, cryptography, research
summary: Hybrid quantum–classical algorithms combining Babai's and Schnorr's algorithms with QAOA. Published in Springer SN Computer Science.

CDAC summer internship work. The question: can you make Schnorr's lattice-based factorization approach computationally viable with a quantum accelerator?

We combined **Babai's nearest-plane algorithm** with **Schnorr's reduction** and used the **Quantum Approximate Optimization Algorithm (QAOA)** as the closest-vector solver. The hybrid approach is interesting less for the absolute numbers (small N, small qubit counts) and more for what it suggests about the boundary between lattice-based post-quantum security claims and accelerated classical attacks.

Published as *Survey of Integer Factorization using Lattice-Based Algorithms* in **Springer Nature, SN Computer Science**.

---

kind:    project
title:   reconGram
date:    2024-02-20
tags:    osint, python, security
summary: An Instagram OSINT tool — public-profile reconnaissance for investigators.
link:    https://github.com/SarangVehale/reconGram

A small Python tool that gathers public reconnaissance data from Instagram profiles for investigative use: connected accounts, post metadata, geolocation tags where present, mutual follows, and cross-platform handle correlation.

Built for the I4C engagement; later open-sourced with the sensitive bits removed.

---

kind:    project
title:   map-this
date:    2024-01-10
tags:    osint, python, data
summary: A dynamic, interactive, localised crime map built from cybercrime.gov.in data.
link:    https://github.com/SarangVehale/map-this

Scraping and visualisation pipeline that turns public cybercrime reports into a localised, interactive map. Built as a teaching aid for LEA training sessions — looking at where complaints cluster geographically tells you more about cybercrime in 30 seconds than a quarterly report does in 30 pages.
