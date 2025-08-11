---
title: "websiteDownloader"
date:
draft: false
tags: ["Python", "Downloader", "WebScraping", "Open-Source"]
link: "https://github.com/SarangVehale/website-downloader.git"
---

A Python-based command-line tool for downloading complete websites — HTML, CSS, JS, and images — and packaging them into neatly organized ZIP files. Built for developers who need offline copies of sites or want to inspect structure and assets.

<!-- **(Recommended: Add a GIF or screenshot of the CLI in action here!)** -->
<!---->
<!-- ``` -->
<!-- [---------- Screenshot Placeholder ----------] -->
<!-- |                                            | -->
<!-- |  === Website Downloader ===                | -->
<!-- |  Level 2 | Score: 40                       | -->
<!-- |  1. Download Website                      | -->
<!-- |  2. List Downloaded Websites              | -->
<!-- |  3. Help                                  | -->
<!-- |  4. Exit                                  | -->
<!-- |                                            | -->
<!-- [--------------------------------------------] -->
<!-- ``` -->
<!---->

## About The Project

`website-downloader` fetches and organizes all core assets from a website URL — HTML, CSS, JS, and images — into a structured folder and ZIP archive. It includes a gamified interface and a CLI menu system, making it both practical and fun to use.

### Core Features

- **Full Site Downloader:** Fetches web pages and their static assets.
- **Organized Output:** Resources saved in structured folders (`html/`, `css/`, `js/`, `images/`) and compressed as `website_1.zip`, `website_2.zip`, etc.
- **Gamified Experience:** Tracks progress with levels and scores.
- **Progress Feedback:** Uses a terminal progress bar for download status.
- **CLI Menu Interface:** Options to download, list saved sites, view help, or exit.
- **Resilient:** Includes retry logic with exponential backoff on failed downloads.

### Tech Stack

- **Language:** Python 3.x
- **Libraries:**
  - `requests` – HTTP requests
  - `beautifulsoup4` – HTML parsing
  - `tqdm` – Progress bars
  - `pyfiglet` – ASCII art headers
  - `colorama` – Colorful terminal output

## Getting Started

```bash
git clone https://github.com/SarangVehale/website-downloader.git
cd website-downloader/main6
pip install -r requirements.txt
python main6.py
```

## Example File Structure

```
website_1.zip
├── html/
│   └── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
└── images/
    └── logo.png
```

## Roadmap

- Add multi-threaded downloads
- Support login-protected sites
- Optional image compression
- Interactive ZIP browser

---

MIT License © 2025

> _“Take the web offline — one ZIP at a time.”_

---
