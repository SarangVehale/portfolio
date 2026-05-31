---
title: interview challenge question
date: 2025-09-01
tags: [interview, jobs, neiro]
summary: Answer to the question what did you find challenging
---

The answer to the most infamous question in an interview "What was a challenge
that you've faced in <certain> project" or "challenges that you've faced in development".
I've found my answer during the development of Neiro | 音色. Man handling ci and storage
solutions is such a pain, especially when you don't want to have a backend (well that is on me).
Although having multiple backups of your whatever you want is quite a hastle. So what I initially
intended to do is just simply use github as my storage and run my pipelines to sync, pull, push
through github actions. All of that works until you realisticly push music (large files) and you
have to encounter lfs issues. Git lfs has strict size limits and once reached the actionable lfs
memory, you're almost done for.

Second solution was cloudflare R2, it is a really good solution tbh. Although it requires a credit/debit
card and would anonymously charge me if I go over the limits of 10GB/month, the pay plan is not too bad
although for me it was still a no go, as the costs would rack up. WE WANT FREE STUFF

Finally what I landed on is Github LFS (hot backup) + Gitlab (warm storage) + Internet Archive (cold storage).
Although now when you have a 3 point backup system, they need to have consensus and sync amongst each other
such that they are all on the same version of our data. To do that I have several workflows and also have to
ensure that if one or the other is out of sync, deny a push to remote.

That sounds simple enough? Yes? It is, kinda. We also have a contributions page to Neiro, where users
would simply pr to our base github repo and push new music or requests for music that they have. So now the
new issue is, git lfs has a short limit of 10GiB and realisticly it is quite a narrow ceiling to hit when you
have flac, m4a and mp3 files. LFS usage rack up and soon hit the limits and we are out of any further actions
for the rest of the month, which is not a feasible design structrue.

What is the solution ?
=> What I've come at is sharding the pr's in shorter segments such that we don't hit the 2.0GiB limits of
regular git objects (the standard max limit for non-lfs commits). For that we have pre-push hooks that would short
circuit on a bunch of conditions (file size, illegal operations, jeopradizing repo content etc.). Followed by that
a newer diff strategy - what counts as "new audio".

What this means for the user? nothing really, it is a standard pr experience for the user, what important fix we've
done is if IA is down we backup all the files, write a .json file to maintain a track, and print error IA is down.
Once IA is back up, we just drain the ia queue and refire our workflows. And hope everything is back to normal.
Get everything synced up, this would theoretically reduce the bandwidth consumed for lfs quota, as it is per-push
proportional, and not per-month accumulating.
