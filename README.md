# Tic Tac Toe — Neumorph

Kleines Tic-Tac-Toe Spiel für zwei Leute an einem Computer mit einem neumodernen Layout.

Benutzung
- Öffne `index.html` im Browser oder starte einen lokalen Server:

```bash
python3 -m http.server 8000
# dann im Browser: http://localhost:8000/
```

Einstellungen
- Öffne die **Einstellungen**, um Hintergrund- und Textfarben zu ändern.
- Ändere die **Layout-Skala** von 0% bis 500% (UI wird skaliert).
- Einstellungen werden in `localStorage` gespeichert.

Dateien
- index.html — App (Tabs: Tic Tac Toe + Vier Gewinnt)
- styles.css — Styling (neumorph + C4 board)
- app.js — Spiel-Logik & Einstellungen (TicTacToe + Connect Four)

Vier Gewinnt
- Das Spiel ist im zweiten Tab "Vier Gewinnt" verfügbar.
- Klick auf eine Spalte, um einen Stein fallen zu lassen. Steine fallen animiert in die Ziel-Zelle.
- Zwei Spieler an einem Computer: Spieler Rot und Spieler Gelb.
