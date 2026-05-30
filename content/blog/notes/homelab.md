---
title: Homelab
date: 2025-09-01
tags: [linux, infrastructure, self-hosting]
summary: A remote dev setup which doubles up as an everything server
---

The homelab is more of a remote server where I can dump my random projects and also work as a homeserver which doubles as a NAS. For the setup this is my architechture

```
iPad (Termius) ├── SSH → tmux → nvim + yazi └── SFTP → file transfer Other Laptop └── Git pull/push Server (Arch Linux) ├── SSH server ├── Tailscale node ├── Git remote (bare repos) └── Development environment
```

all of this mostly relies on openssh, tailscale, termius(ipad), and git for version control.
To access my files and for any changes SFTP takes the load, and honestly that is good enough for me.

This server mainly hosts all of my music, and a few project files (secondary backup).
I also have a obsidian-git workflow set whichi allows me to have all of my notes sync over to the
homeserver and have a congruent setup across all of my devices. All the other devices use obsidian-git
plugin to pull and push updates to the server.

I also run pi-hole for dns, although that is mostly active on situation basis (I have to run networking
from my room back to the router- queued project since forever). I personally am not a fan of nextcloud,
plex, or similar services as in the past they have failed more times than i've used them. All of my music
syncs over git over to my music platform [Neiro | 音色](sarangvehale.github.io/hibiki).

There are a few docker containers running some things, but that is mostly trivial. The future plan that
I've lined up is running local llms on the server, and having some obsidian workflows for my daily routines.

I'll probably write a detailed guide of my setup and a walk through for it.
