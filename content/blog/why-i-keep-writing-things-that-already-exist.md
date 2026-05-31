---
title: Why I keep writing things that already exist
date: 2025-08-12
tags: [essays, systems]
summary: A defense of reimplementing dd, dotfiles managers, and the rest of it.
---

Every time I write a tool that already exists — `rdd`, `dotman`, my own dotfiles manager, my own keyboard — somebody asks why I didn't just use the existing one. The honest answer has three layers.

## Layer 1 — the existing one is bad

This is rarer than people think but it does happen. GNU `dd` is, to put it gently, a usability disaster. The interface predates most of the things that make modern CLI tools pleasant. Rebuilding it is not a vanity project; it's a maintenance burden everyone is paying for in five-character flag invocations.

## Layer 2 — you learn the shape of the problem

When I wrote `rdd` I thought I understood `dd`. After six weeks of writing `rdd` I actually understood `dd`. The act of reimplementation forces you to articulate every implicit assumption the original author baked in. You can't read your way to that understanding.

## Layer 3 — you get to be opinionated

Existing tools are a fixed point in idea-space. Once they exist, every user makes their compromises *around* them. Writing your own moves the fixed point. It's small, but if enough people do it the local optimum of CLI design moves with them.

So: I'll keep writing things that already exist. The list is long and growing.
