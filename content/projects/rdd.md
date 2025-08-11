---
title: "Rdd"
# date:
draft: false
tags: ["Rust", "GNU/dd", "Linux", "Open-Source"]
link: "https://github.com/sarang-kernel/rdd"
---

# `rdd` - A Modern, Safe, and Fast Replacement for GNU `dd`

[![Build Status](https://github.com/sarang-kernel/rdd/actions/workflows/rust.yml/badge.svg)](https://github.com/sarang-kernel/rdd/actions)
[![Crates.io](https://img.shields.io/crates/v/rdd.svg)](https://crates.io/crates/rdd)
[![License](https://img.shields.io/crates/l/rdd.svg)](https://github.com/sarang-kernel/rdd/blob/main/LICENSE)

## About The Project

`rdd` is a complete rewrite of the venerable GNU `dd` utility in Rust, designed with three core principles in mind: **Safety, Performance, and User Experience**.

While `dd` is powerful, its cryptic syntax (`if`, `of`, `bs`) is notoriously unforgiving, and its lack of feedback can be nerve-wracking during critical operations. `rdd` aims to solve these problems by providing a modern command-line experience without sacrificing the power that `dd` is known for.

## Key Features

- **Rich Progress Bar**: `rdd` provides a multi-bar progress display by default, showing transfer rates, total progress, and ETA. No more sending `SIGUSR1` signals in the dark!
- **Safety First**:
  - Uses clear, verbose argument names like `--input` and `--output` to prevent catastrophic typos.
  - (Planned) Will include confirmation prompts for potentially destructive operations.
- **Multithreaded Performance**: (Planned) Leverages a producer-consumer model to de-couple read and write operations, allowing `rdd` to saturate fast NVMe drives and I/O channels.
- **On-the-fly Verification**: (Planned) Calculate a cryptographic hash (BLAKE3, SHA-256) during the copy process to guarantee data integrity without needing a second pass.

## `rdd` vs. `dd`

A simple disk-to-image backup demonstrates the clarity of `rdd`.

| GNU `dd` (The Old Way)                                                 | `rdd` (The New Way)                                       |
| ---------------------------------------------------------------------- | --------------------------------------------------------- |
| `sudo dd if=/dev/sda of=~/backup.img bs=4M status=progress conv=fsync` | `sudo rdd --input /dev/sda --output ~/backup.img --bs 4M` |

With `rdd`, progress is on by default and `fsync` is guaranteed on completion. The command is clearer and less prone to error.

## Installation

### From Crates.io (Recommended)

Once published, you can install `rdd` using `cargo`:

```sh
cargo install rdd
```

### From Source

1.  Clone the repository:
    ```sh
    git clone https://github.com/sarang-kernel/rdd.git
    cd rdd
    ```
2.  Build the release binary:
    ```sh
    cargo build --release
    ```
3.  The executable will be located at `./target/release/rdd`.

## Usage Examples

#### 1. Backing up a hard drive to an image file

```sh
rdd --input /dev/sdb --output /mnt/backups/disk_image.img --bs 16M
```

#### 2. Restoring an image to a USB drive

**WARNING:** This is a destructive operation and will overwrite all data on the target device (`/dev/sdc`). Double-check your device names.

```sh
sudo rdd --input ~/Downloads/ubuntu-22.04.iso --output /dev/sdc --bs 4M
```

#### 3. Cloning a disk

**WARNING:** This is a destructive operation. All data on the output disk (`/dev/sdb`) will be replaced with data from the input disk (`/dev/sda`).

```sh
sudo rdd --input /dev/sda --output /dev/sdb --bs 64M
```

#### 4. Copying a file with hash verification (Planned Feature)

```sh
rdd --input video.mp4 --output video.backup.mp4 --verify blake3
```

## Development Status

This project is currently under active development.

- **Phase 1 (Complete):** Core `dd` functionality (`input`, `output`, `bs`, `count`, `skip`, `seek`) is implemented in a robust, single-threaded model.
- **Phase 2 (In Progress):** Enhancements like the progress bar, multithreading, and hash verification are being added.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
