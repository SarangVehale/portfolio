kind: post
title: youtube
date: 2026-29-05
tags: youtube, channel
summary: I created a random youtube channel

## I created a youtube channel - @smallcatz

So this was quite random and at a whim that I did, I made a youtube channel I had initially intended to post
study youtube videos - study with me, no pomodoro - type videos, which now I mostly use as a diary of life
if I find something interesting say my grandma's cat, Mr Dog, or some other random thing.

I do intend to get back to filming good videos with actual value and hopefully also get back to studying longer
hours although right now I will be focusing on job applications and my phd application. I intend to get a good
scholarship maybe in a good university in japan or the europe. Initially when the though of phd came over me
I wanted to attend UC berkley although the US market and all the scenario is kinda bad there. So we're pivoting to
japan and europe.

What I was able to narrow down for Europe was mainly ETH Zurich as they have theoretical quantum research compared to
other universities in UK, or other places where they focus on hardware side of quantum research.

That was quite a detour, getting back to the main topic, I started a youtube channel.

Soo...

I started a youtube channel

---

kind: post
title: current gear
date: 2026-19-05
tags: gear, edc
summary: current edc, gear and setup.

## current gear

### desk setup 1

- keyboard- [reddragon horus tkl](https://amzn.in/d/04kUTl8d)
- mouse- [logitech m575 s](https://amzn.in/d/0aD2tesp)
- mouse2- [logitech mx master 2s](https://amzn.in/d/0fzrYYeI)
- headphones- [moondrop chu2 dsp](https://www.headphonezone.in/products/moondrop-chu-ii?utm_medium=cpc&utm_source=google-ads&utm_campaign=product-search&utm_content=moondrop-chu-ii&gad_source=1&gad_campaignid=19855230691&gbraid=0AAAAADoxq7RONRGZ8Hjg5tdW3eGqTwusg&gclid=Cj0KCQjwlLDQBhDjARIsAPlIefGjO-TlSmKYKWCFT8N_7P41rA4mfhuveO4H5K4y79H4ZAb8x8rdelAaAkE5EALw_wcB)
- speaker/assistant- google home mini
- tablet- [ipad 9th gen](https://support.apple.com/en-in/111898)
- scratchpag- luxor converge
- mechanical pencil- [uniball kurutoga m5-450T](https://amzn.in/d/07SJ6HHc)
- fountain pen- [delike brass](https://amzn.in/d/0dbucA2g)
- desk- custom made
- light- really old lamp not sure which
- music player- ipod classic 6th gen
- adapter- [cmf 140w gan charger](https://nothing.tech/products/cmf-power-140w-gan?srsltid=AfmBOopkT4GWwLar5Oh7u3hVEshUUHf2obJ2vWPe7EHHx_KrEbD3bzps&Colour=Dark+Grey)

## computers

- laptop01- [asus rog flow x13-2023 (linux, coding computer)](https://rog.asus.com/laptops/rog-flow/rog-flow-x13-2023-series/)
- laptop02- [lenovo ideapad 3-14ITL6 (windows, experimentation)](https://store.lenovo.com/in/en/ideapad-3-14itl06-82h700kain-1149.html?orgRef=https%253A%252F%252Fwww.google.com%252F)
- laptop03 - hp elitebook 840 g1 (linux, japanese immersion pc, homeserver)

## edc

- phone- nothing phone 2a
- ereader- lg q60 modded
- wallet- custom made leather wallet
- headphones- [oneplus buds3](https://amzn.in/d/0gWHnraR)

I'm probably forgetting some stuff

I do have a bunch of like harddrives. ssd's, samsung T7 drives for storage and a raspberry pi 4b (random hosting server).

---

kind: post
title: Why I keep writing things that already exist
date: 2025-08-12
tags: essays, systems
summary: A defense of reimplementing dd, dotfiles managers, and the rest of it.

Every time I write a tool that already exists — `rdd`, `dotman`, my own dotfiles manager, my own keyboard — somebody asks why I didn't just use the existing one. The honest answer has three layers.

## Layer 1 — the existing one is bad

This is rarer than people think but it does happen. GNU `dd` is, to put it gently, a usability disaster. The interface predates most of the things that make modern CLI tools pleasant. Rebuilding it is not a vanity project; it's a maintenance burden everyone is paying for in five-character flag invocations.

## Layer 2 — you learn the shape of the problem

When I wrote `rdd` I thought I understood `dd`. After six weeks of writing `rdd` I actually understood `dd`. The act of reimplementation forces you to articulate every implicit assumption the original author baked in. You can't read your way to that understanding.

## Layer 3 — you get to be opinionated

Existing tools are a fixed point in idea-space. Once they exist, every user makes their compromises _around_ them. Writing your own moves the fixed point. It's small, but if enough people do it the local optimum of CLI design moves with them.

So: I'll keep writing things that already exist. The list is long and growing.

---

kind: post
title: Notes from training judges on cybercrime
date: 2025-03-30
tags: cybersecurity, policy, teaching
summary: What I learned running sessions for Indian judicial officers and LEA personnel at I4C.

A few weeks at I4C running training sessions for judicial officers and law-enforcement personnel taught me more about the _delivery_ of cybersecurity than five years of reading taught me about its content.

Some notes, in no particular order.

## The vocabulary problem is everything

Half of every training session is unpicking jargon. Phrases like "phishing" or "endpoint" or "indicator of compromise" are not in the working vocabulary of most of the people who need to act on them. You don't get traction on technique until you've built a shared dictionary, and that dictionary is the first deliverable, not a prerequisite.

## Judges are excellent students

Better than most engineers, in fact. They are trained to ask clarifying questions in public without ego, to pause when a definition is wobbly, and to test a claim by stating it back in their own words. Engineers should learn these habits from judges, not the other way around.

## Real cases beat hypotheticals

A made-up scenario produces nodding. A real anonymised FIR from last month produces argument. Argument is what you want.

I'll write more of these as I run the next round of sessions.

---

kind: post
title: The homelab as a learning environment
date: 2025-02-14
tags: linux, systems, homelab
summary: Why running your own infrastructure is the best CS course you'll ever take.

Coming soon. I want to write this one carefully — it's the answer I give whenever someone asks how to learn systems engineering, and I've been giving the wrong version for years.
