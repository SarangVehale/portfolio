---
title: How to actually disable OneDrive on Windows
date: 2025-11-22
tags: [windows, how-to, privacy]
---

A running record of every step you need to take. Microsoft keeps moving
the targets, so I keep updating this. Last verified on Windows 11 23H2.

## TL;DR

1. **Pause syncing**, then sign out of the OneDrive app.
2. **Uninstall OneDrive**: Settings → Apps → OneDrive → Uninstall.
3. **Stop it from being reinstalled** by edits in Group Policy (Pro) or the
   registry (Home).
4. **Move your files out of the OneDrive folder back to local profile
   paths** before any of the above, or you will lose access to them
   temporarily.

## 1. Sign out and pause

Right-click the OneDrive cloud icon in the taskbar → **Settings** →
Account → **Unlink this PC**. This stops the cloud sync without deleting
local files.

If the icon isn't there: Start → search for *OneDrive* → open → Help &
Settings → Settings → Account → Unlink.

## 2. Move your files

Before uninstalling, **move anything important** out of
`%USERPROFILE%\OneDrive\` and back to `Documents`, `Pictures`, etc. on
your local profile. Windows will let you do this with normal cut/paste.

> Skipping this step is the most common way people lose access to files
> when uninstalling OneDrive. They aren't deleted — they're just still in
> the OneDrive folder which becomes unmapped.

## 3. Uninstall

- **Settings** → **Apps** → **Installed apps** → search *OneDrive* →
  **⋯** → **Uninstall**.
- Reboot.

## 4. Prevent reinstall

OneDrive will sometimes reinstall itself with Windows updates. To stop
that:

### Windows Pro / Enterprise (Group Policy)

```
gpedit.msc
→ Computer Configuration
→ Administrative Templates
→ Windows Components
→ OneDrive
→ "Prevent the usage of OneDrive for file storage" → Enabled
```

### Windows Home (Registry)

Save as `disable-onedrive.reg` and double-click:

```
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows\OneDrive]
"DisableFileSyncNGSC"=dword:00000001
```

Reboot.

## 5. Verify

After reboot:

- `%USERPROFILE%\OneDrive\` should not exist.
- `Get-Process OneDrive` in PowerShell should return nothing.
- File Explorer's left sidebar should not show OneDrive.

## Caveats

- **Office 365 sign-in** still works. OneDrive uninstall doesn't affect
  Word/Excel/Outlook.
- **Personal Vault** files are wrapped in their own encryption — sign in
  and decrypt them on the web first if you haven't migrated them out.
- **Mobile OneDrive app** is independent. Disable or uninstall it
  separately if you don't want it.

## Why I wrote this

Because every time I set up a new Windows install for a friend or family
member, I end up re-deriving these steps from half-stale forum threads.
Future-me can now just open this page.
