---
date: "2026-03-26"
draft: false
title: "Todo list device"
tags: ["Hardware", "Todolist", "Productivity"]
description: "An idea for todolist hardware device"
---

# Todo List Device

## Features

- ☐ e ink display (around 3 inch)
- ☐ 3 buttons (up, down, enter)
- ☐ some contraption for a keyboard
- ☐ firmware should only include a todolist and maybe a calendar
  - (that syncs to google calendar -> but I want to make the device completely offline and idiotic => no distractions reason)

---

## Hardware

- ☐ e ink display

- ☐ battery? > 3.7V LiPo battery

- ☐ microprocessor

- ☑ Seeed Studio XIAO ESP32C3
  - insanely small (like a coin)
  - USB-C onboard
  - battery charging built-in (huge win)
  - low power modes
  - enough power for UI + storage
  - optional Bluetooth

- ☐ Arduino Nano USB-C (ATmega328P)
  - no native battery charging
  - worse power efficiency
  - bigger

- ☐ ESP32-C3 Super Mini USB-C Board
  - no built in battery charging

---

### Buttons

> Main issue is I don't want to add a keybaord to this. Why? it is ugly and makes the device big.
> The main purpose of this device is the visibility of todo list and a keyboard shifts the focus off of the main content.
> I already have enough distractions tbh.

---

### Possible Approaches

> Something that can be done we just have those three buttons and use software to fix this issue.

- Have a keyboard similar to feature phones where basically we just have all the alphabets in a row like so:
  **A -> B -> C -> ... -> Z**

- And now you can just do up down and enter to add your tasks

> Although the issue with this is it adds a lot more friction.

---

> Another thought is to use uploads or a web based ui thingy or some sort of sync ->
> But well that involves another devices and adds a heck load of friction.
> Like why the hell would I not just use a todo app on my phone !!

---

> Now an excellent suggestion was that we just have presets (home, school, work, homework, etc.)
> sync them once and forget it even exists.

> Well that is a task although it lacks the idea of what I need to do.

---

> so maybe we just combine the two ideas of scrollable keyboard and a bluetooth sync thingy,
> since we have bluetooth why not use it.

---

## Implementation Strategy

---

so what we have in plan is just a finite state machine with just 3 buttons.

> Everything revolves around :

    - current screen
    - input button
    - updating display
    - saving state
