---
title: "devmanager"
date:
draft: false
tags: ["Shell", "Linux/Mac", "DevEnv", "Open-Source"]
link: "https://github.com/sarangvehale/dev-manager"
---

An interactive terminal-based tool for bootstrapping and managing full-stack development environments with ease. Built for developers tired of Googling install commands, juggling SDK versions, or manually configuring their setup.

<!-- ``` -->
<!-- [------------- Screenshot Placeholder -------------] -->
<!-- |                                                | -->
<!-- |  Dev Environment Manager                       | -->
<!-- |  --------------------------------------------  | -->
<!-- |  1) Install pyenv                              | -->
<!-- |  2) Install Python 3.11.9                      | -->
<!-- |  3) Setup Qiskit Environment                   | -->
<!-- |  4) Install Rust, Node.js, Go, Docker, etc.    | -->
<!-- |  20) Exit                                      | -->
<!-- |                                                | -->
<!-- [--------------------------------------------------] -->
<!-- ``` -->
<!---->

## About The Project

`dev-manager` provides a unified, menu-driven terminal interface to install and configure popular development tools and languages — from Python and Qiskit to Docker, Node.js, Rust, Java, and cloud SDKs — across Linux and macOS.

It simplifies environment setup for polyglot developers and teams working across stacks and platforms.

### Core Features

- **Interactive TUI Menu:** Pick and install tools via a clean terminal UI (powered by `dialog`).
- **Cross-platform Support:** Works on Arch, Ubuntu, Fedora, and macOS.
- **Python + Qiskit Setup:** Automates creation of quantum-ready virtual environments.
- **Multi-language Installer:** Rust, Go, Node.js, Java, .NET, Flutter, and more.
- **DevOps Tools:** Install Docker, kubectl, helm, terraform, ansible, and more.
- **Smart Dependency Checks:** Detects missing packages and provides install prompts.
- **Shell Integration:** Automatically updates shell configuration files as needed.

### Tech Stack

- **Shell Script:** Bash-based implementation with `dialog` for UI
- **OS Detection & Package Managers:** Supports `apt`, `dnf`, `pacman`, and `brew`
- **Tooling:** Integrates with pyenv, nvm, rustup, conda, Docker, etc.

## Getting Started

```bash
git clone https://github.com/SarangVehale/dev-manager.git
cd dev-manager
chmod +x dev_env_manager.sh
./dev_env_manager.sh
```

Follow the interactive prompts to set up your tools.

## Roadmap

- Add support for Windows (via WSL or PowerShell)
- Customizable tool profiles and presets
- Parallel install mode
- Plugin system for community scripts

---

MIT License © 2025

> _“Let your tools work for you — not the other way around.”_

---
