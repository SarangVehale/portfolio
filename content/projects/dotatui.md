---
title: "dotatui"
date:
draft: false
tags: ["Rust", "ArchLinux", "Dotfiles", "Open-Source"]
link: "https://github.com/sarang-kernel/dotatui"
---

![alt text](https://img.shields.io/badge/License-MIT-blue.svg)
![alt text](https://img.shields.io/badge/rust-1.75%2B-orange.svg)
![alt text](https://img.shields.io/badge/build-passing-brightgreen)
A terminal-based Git interface written in Rust, designed for streamlined dotfile management. Inspired by the speed and keyboard-centric nature of tools like `lazygit` and `lazyvim`.

<!-- Future : Adding a GIF of the application here.-->

## About The Project

`dotatui` was built to solve a common problem: managing version-controled configuration files (dotfiles) across multiple systems without leaving the terminal. The goal was to create a fast, and intuitive TUI application that provides the most common Git operations at your fingertips.

### Core features

- **Dual-Panel Layout:** View staged/unstaged files and the diff for the selected file simultaneously.
- **Full Staging Control:** Stage and unstage entire files, including additions, modifications, and deletions.
- **Git Workflow:** Browse the commit log to see a history of changes.
- **Intuitive Navigation:**
  - **Vim Keybindings:** Navigate lists (`j`/`k`) and switch between panels (`h`/`k`)
  - **Mouse Support:** Click to select files/panels and scroll lists with the mouse wheel.
- **Responsive, Asynchronous UI:** Built on async event loop to handle slow network operations (like `git push`) without freezing the interface.

### Tech Stack

This project is entirely built using Rust:

- **Core Language:** [**Rust**](https://www.rust-lang.org/)
- **TUI Framework:** [**Ratatui**](https://ratatui.rs/) for robust widget-based terminal rendering.
- **Terminal Backend:** [**Crossterm**](https://github.com/crossterm-rs/crossterm) for cross-platform terminal manipulation.
- **Git Backend:** [**git2-rs**](https://github.com/rust-lang/git2-rs), the official Rust bindings for `libgit2`, providing a safe and fast alternative to shelling out to the `git` command.
- **Asynchronous Runtime:** [**Tokio**](https://tokio.rs/) for handling slow network operations (like `git push`) without freezing the UI.
- **Error Handling:** [**thiserror**](https://github.com/dtolnay/thiserror) for idiomatic, boilerplate-free error types.
- **Logging:** [**simplelog**](https://github.com/drakulix/simplelog.rs) for file-based debugging that doesn't corrupt the TUI.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Rust toolchain (via `rustup`)
- `libgit2` and its dependencies (often handled automatically by the `git2-rs` build script)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/sarang-kernel/dotatui.git
   ```
2. Navigate into the project directory:
   ```sh
   cd dotatui
   ```
3. Build and run the application:
   ```sh
   cargo run
   ```
   The application must be run from withing a Git repository

## Keybindings

| Key         | Action                                   |
| :---------- | :--------------------------------------- |
| `q`         | Quit Application / Exit Hunk Mode        |
| `s` / `l`   | Switch to Status / Log View              |
| `j` / `k`   | Navigate Up / Down in lists              |
| `h` / `l`   | Switch focus between Left / Right panels |
| `space`     | Stage selected file                      |
| `u`         | Unstage selected file                    |
| `c`         | Open Commit message editor               |
| `Shift`+`P` | Push to remote (`origin`)                |
| `enter`     | Enter Hunk Selection Mode                |
| `?`         | Show Help Popup                          |
| `esc`       | Close Popup                              |

## Project Roadmap

`dotatui` is under active development. Future enhancements include:

- **Interactive Hunk Staging:** Stage/unstage individual lines or blocks of code.
- **Branch Management:** A UI for viewing, creating, and switching branches.
- **Interactive Log:** View commit diffs and checkout commits directly from the log.
