# Nexus Mods: Enable YouTube Fullscreen

A small Tampermonkey userscript that restores the fullscreen button on YouTube videos embedded in Nexus Mods pages.

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) in your browser.
2. [Install the userscript](https://raw.githubusercontent.com/trumbledon/nexusmods-youtube-fullscreen/main/nexusmods-youtube-fullscreen.user.js) and confirm installation in Tampermonkey.
3. Refresh any open Nexus Mods page, then use the fullscreen button inside its YouTube player.

If you have an older copy of this script, replace it and disable other YouTube fullscreen scripts to avoid conflicts. The existing namespace is retained so Tampermonkey can recognize an upgrade from the earlier local version.

If the install link opens plain text, create a new script in Tampermonkey, paste the contents of `nexusmods-youtube-fullscreen.user.js`, and save it.

## What it does

- Runs only on `nexusmods.com` and `www.nexusmods.com`.
- Recognizes YouTube and YouTube privacy-enhanced embeds by their actual hostname and embed path.
- Enables fullscreen before recreating the iframe's browsing context. This avoids intermittent failures caused by changing permission attributes after a player has already loaded.
- Handles dynamically added and lazy-loaded embeds, Nexus page navigation, and back/forward restoration.
- Repairs fullscreen permissions if the page removes or restricts them.
- Preserves iframe elements, their event listeners, and unrelated permission directives.

The player reloads once when first fixed. An additional reload can occur if the page subsequently removes its fullscreen permission. Playback can restart when this happens.

The script makes no additional network requests, stores no data, and requests no special userscript privileges. YouTube embeds themselves continue making their normal requests. Updates are served from this repository.

## Files

- `nexusmods-youtube-fullscreen.user.js` — the installable script.
- `nexusmods-youtube-fullscreen.meta.js` — metadata used by Tampermonkey's update checks.

## Credits

Inspired by [Allow full screen for YouTube embedded videos](https://greasyfork.org/en/scripts/435238-allow-full-screen-for-youtube-embedded-videos) by [ablauch](https://greasyfork.org/en/users/4654). This Nexus-specific implementation was rewritten to address dynamic embeds and intermittent permission timing issues.

Developed with assistance from OpenAI Codex.

## Feedback

Report problems in [Issues](https://github.com/trumbledon/nexusmods-youtube-fullscreen/issues). Include your browser, userscript manager, a Nexus mod page URL, and whether refreshing changes the result.
