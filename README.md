# Softwareprojekt Corona-Warn-App #

Das Repository enthält den aktuellen Projektstand der Gruppe _Corona Warn-App Scanner_

## Hardware ##

Das Projekt nutzt zwei verschiedene Plattformen, auf denen der Scanner gebaut werden soll:

* nrf52840
  - NimBLE stack implementiert
  - ARM-Toolchain
* ESP32
  - BLE/Wifi support
  - ESP-Toolchain

Als Peripheriegeräte werden ein SD-Kartenleser und ein kleines Display an die Boards angeschlossen.

## Benutzung ##

Bis jetzt existieren noch keine ausfühbaren Dateien. Um das Projekt zu klonen sollte
`git clone --recurse-submodules REPOSITORY` genutzt werden, um den RIOT-OS Ordner
heruenterzuladen. Alternativ kann mit `git submodule init` die lokale
Konfigurationsdatei initialisiert, und mit `git submodule update` die Daten herunter
geladen werden.

## Build ##

Bis jetzt gibt es noch nicht zu bauen.

## Lizenz ##

Keine Ahnung? RIOT nutzt LGPL, glaube ich. Vielleicht können wir da einfach mal nachfragen.
