---
title: "osintreporter"
date:
draft: false
tags: ["Python", "AI", "OSINTReport", "Open-Source"]
link: "https://github.com/SarangVehale/pdf-reporter.git"
---

A terminal-based utility written in Python that helps intelligence teams generate formal **Request Letters** and **OSINT Reports** in PDF format from structured or unstructures input data. It combines local databased storage, PDF rendering via ReportLab, and AI-assisted content generation using Ollama.

## About The Project

`osint-pdf-generator` is a utility tool designed to stremline the creation of professionally formatted documents required for open-source intelligence workfolows. It supports generating :

- **Request Letters** to external organizations or officials
- **OSINT Reports** summarizing intelligence findings from CSV, JSON, or TXT data.

### Core Features

- **PDF Generation:** Automatically formats and outputs clean, professional PDFs
- **AI Integration:** Uses [Ollama](https://ollama.com/) to summarize and transform raw OSINT data into readable content.
- **File Format Support:** Ingests `.csv`, `.json`, or `.txt` files for OSINT report generation.
- **Local Databased(SQlite):** Save and retrieve organization names and request templates
- **Default Template Support:** Automatically generates a default letterhead if none is provided
- **CLI Integration:** Simple terminal UI for selecting operations and paths.

### Tech Stack

- **PDF Generation** - [reportlab](https://docs.reportlab.com/)
- **Lightweight DB** - [sqlite3](https://sqlite.org/index.html)
- **AI Summarization** - [ollama](https://ollama.com/) API
- **File I/O and parsing** - `csv`, `json`, `os`

## Getting Started

## Prerequisites

- Python 3.8+
- Install dependencies
  ```bash
  pip install reportlab ollama
  ```
- Install and configure `Ollama` for local LLM access

### Usage

```bash
git clone https://github.com/SarangVehale/pdf-reporter.git
python main1.py
```

---

MIT License © 2025

---
