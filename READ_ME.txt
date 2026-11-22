WHITE DRAGON - STATISTICS CONSISTENCY FIX

Upload all package contents, replace previous files and refresh with Ctrl+F5.

Profile and ranking now share the verified set parser. All supported completed sets contribute to their 1v1/2v2 record. Only Clan League/BWCL sets grant points: win 2, loss 1, per participant. Clan Match contributes to winrate but not league points.

Fixes include multiline string sets, 1n1/2n2 notation, per-player race markers, right-side participation, smart apostrophes, duplicate whitespace variants and consistent handling of pending, drawn, contradictory or malformed sets. Ambiguous player aliases remain excluded to avoid invented attribution.

An authoritative empty Firestore snapshot no longer falls back to demo results or automatically seeds default matches. No migration, database writes or new rules are needed. Match edits and deletions rebuild derived values.

Tests cover shared profile/ranking totals, points, both formats, invalid data exclusions, aliases, duplicates and empty/deleted results. JavaScript syntax checked. Live Firestore was not modified and visual browser verification was unavailable.

The screenshot alone cannot establish that 20 points is incorrect: the profile winrates include friendlies, while points only include league sets. Review the player Match Records for the exact contributing sets.
