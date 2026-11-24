WHITE DRAGON - ALL DIVISION CLAN LOGOS

Upload all files/folders together, including clan-icons and clan-logos.js, replace previous files and refresh with Ctrl+F5.

Last Match Result now displays both White Dragon and opponent logos. Next Match and BWCL standings use the same registry.

Source: https://bwcl.anicolasmoreno.chatgpt.site/
23 registered teams, divisions A-D. 20 opponent logos downloaded and optimised locally. WD uses the existing Christmas logo. Shadow and Shadow-2 have no logo at the source; no badge is invented.

Storage:
- clan-icons/*.png: locally served clan images, max 160 pixels on the longest edge.
- clan-logos.js: runtime lookup by team ID, full name and clan tag.
- clan-icons/manifest.json: readable division/name/tag/file/source inventory.

Name matching ignores case, punctuation and accents. Division suffixes remain significant (e.g. Cwt), Cwt)-2 and Cwt)-3 have separate entries). Unknown clan names do not receive an unrelated logo. New unknown clans require their logo and alias to be added to the registry. No Firestore storage or migration is involved.

Verified all image files, aliases, JavaScript syntax and a simulated last-result renderer producing both logo images. All prior fixes retained. Visual browser verification unavailable.
