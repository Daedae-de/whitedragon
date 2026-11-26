WHITE DRAGON - MITGLIEDERBEWERBUNGEN

1. WEBSITE HOCHLADEN
Alle Dateien und Ordner aus diesem Paket in den bisherigen Website-Ordner hochladen und ersetzen. Anschliessend Strg+F5 druecken.

2. FIRESTORE FREISCHALTEN
Die Anleitung in FIRESTORE_SETUP.txt befolgen und den neuen Regelblock veroeffentlichen. Ohne diesen Schritt lehnt Firestore das Einreichen und Laden der Bewerbungen ab.

3. BEWERBUNGSLINK
Nach dem Hochladen:
https://whitedragonclan.com/#apply

Der bestehende APPLY NOW Button oeffnet jetzt das Bewerbungsformular. Die bisherigen Discord-/Channel-Kontakte bleiben ueber View clan contacts erreichbar.

4. BEWERBUNGEN PRUEFEN
Als verifizierter Admin oder Webmaster anmelden. Konsole oeffnen, Applications auswaehlen. Dort stehen Race, Discord, Battle.net, ShieldBattery und Kommentar. Moegliche Status: New, Reviewing, Accepted, Declined. Interne Notizen sind nur fuer Admins/Webmaster sichtbar. Save review speichert den Status. Delete entfernt eine Bewerbung nach Bestaetigung. Copy application link kopiert den oeffentlichen Link.

Accepted legt KEIN Mitglied oder Website-Konto automatisch an und versendet keine Nachrichten. Der Kontakt erfolgt durch euch ueber die angegebenen Gaming-IDs.

5. DATENSCHUTZ UND SPEICHERUNG
Neue Sammlung: clan_applications. Bewerbungen werden ausschliesslich in Firestore gespeichert, nicht in einem oeffentlichen HTML-Archiv. Gaeste koennen mit dem beigefuegten Regelblock nur eine neue Bewerbung einreichen, keine Bewerbungen lesen oder bearbeiten. Admin-/Webmaster-Zugriff nutzt euren bestehenden isAdmin()-Regelhelfer. Es werden keine privaten Bewerbungsdaten im Browser-Cache abgelegt.

Discord und Spielername sind Pflichtfelder; Battle.net, ShieldBattery und Kommentar sind optional. Das Formular fragt nicht nach echtem Namen, Adresse oder Passwort. Zustimmung zur Verarbeitung fuer die Clan-Bewerbung ist erforderlich.

6. PRUEFUNGEN
JavaScript-Syntax, Dateiverweise, Formularvalidierung, Zustimmungsfeld, Doppelklick-/Wiederholungsschutz, Gast-/Admin-Zugriff im Client, interne Pruefung, sichere Textdarstellung und Entfernen privater Daten nach Abmeldung wurden mit simulierten Daten getestet. Keine Testbewerbung wurde an eure Live-Datenbank geschickt. Firestore-Regeln wurden manuell geprueft, hier jedoch nicht in einem Firebase-Emulator oder live getestet. Visuelle Browserpruefung war nicht verfuegbar.

Alle bisherigen Kalender-, Statistik-, Clanlogo-, Match- und Firebase-Funktionen bleiben enthalten.

MMR UPDATE: Current MMR ist jetzt ein Pflichtfeld (ganze Zahl 0 bis 10000) und in Applications sichtbar. Bereits vorhandene Bewerbungen ohne MMR zeigen Not provided. Den aktualisierten clan_applications-Regelblock aus applications.rules.fragment erneut veroeffentlichen, damit das neue Feld gespeichert werden darf.

COUNTRY UPDATE: Country of residence ist ein Pflichtfeld (max. 80 Zeichen). Es wird nur das Land abgefragt und in der Admin-Uebersicht angezeigt. Bestehende Bewerbungen ohne Land bleiben lesbar und zeigen Not provided. MMR bleibt Pflichtfeld. Der Bewerbungslink bleibt https://whitedragonclan.com/#apply .

BWCL BANNER UPDATE: Sagi.gg wurde aus der Partnerleiste entfernt. An dieser Stelle steht der BWCL-Banner mit lokalem Original-Logo und Link zu https://bwcl.anicolasmoreno.chatgpt.site/ . Bewerbungen inklusive MMR und Country sowie bisherige Funktionen bleiben erhalten. Fuer diese Banner-Aenderung sind keine neuen Firestore-Regeln erforderlich.
