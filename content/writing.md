kind:    post
title:   Why I keep writing things that already exist
date:    2025-08-12
tags:    essays, systems
summary: A defense of reimplementing dd, dotfiles managers, and the rest of it.

Every time I write a tool that already exists — `rdd`, `dotman`, my own dotfiles manager, my own keyboard — somebody asks why I didn't just use the existing one. The honest answer has three layers.

## Layer 1 — the existing one is bad

This is rarer than people think but it does happen. GNU `dd` is, to put it gently, a usability disaster. The interface predates most of the things that make modern CLI tools pleasant. Rebuilding it is not a vanity project; it's a maintenance burden everyone is paying for in five-character flag invocations.

## Layer 2 — you learn the shape of the problem

When I wrote `rdd` I thought I understood `dd`. After six weeks of writing `rdd` I actually understood `dd`. The act of reimplementation forces you to articulate every implicit assumption the original author baked in. You can't read your way to that understanding.

## Layer 3 — you get to be opinionated

Existing tools are a fixed point in idea-space. Once they exist, every user makes their compromises *around* them. Writing your own moves the fixed point. It's small, but if enough people do it the local optimum of CLI design moves with them.

So: I'll keep writing things that already exist. The list is long and growing.

---

kind:    post
title:   Notes from training judges on cybercrime
date:    2025-03-30
tags:    cybersecurity, policy, teaching
summary: What I learned running sessions for Indian judicial officers and LEA personnel at I4C.

A few weeks at I4C running training sessions for judicial officers and law-enforcement personnel taught me more about the *delivery* of cybersecurity than five years of reading taught me about its content.

Some notes, in no particular order.

## The vocabulary problem is everything

Half of every training session is unpicking jargon. Phrases like "phishing" or "endpoint" or "indicator of compromise" are not in the working vocabulary of most of the people who need to act on them. You don't get traction on technique until you've built a shared dictionary, and that dictionary is the first deliverable, not a prerequisite.

## Judges are excellent students

Better than most engineers, in fact. They are trained to ask clarifying questions in public without ego, to pause when a definition is wobbly, and to test a claim by stating it back in their own words. Engineers should learn these habits from judges, not the other way around.

## Real cases beat hypotheticals

A made-up scenario produces nodding. A real anonymised FIR from last month produces argument. Argument is what you want.

I'll write more of these as I run the next round of sessions.

---

kind:    post
title:   The homelab as a learning environment
date:    2025-02-14
tags:    linux, systems, homelab
summary: Why running your own infrastructure is the best CS course you'll ever take.

Coming soon. I want to write this one carefully — it's the answer I give whenever someone asks how to learn systems engineering, and I've been giving the wrong version for years.
