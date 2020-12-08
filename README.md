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

Um das Projekt zu klonen sollte
`git clone --recurse-submodules REPOSITORY` genutzt werden, um den RIOT-OS Ordner
heruenterzuladen. Alternativ kann mit `git submodule init` die lokale
Konfigurationsdatei initialisiert, und mit `git submodule update` die Daten herunter
geladen werden.

## Build ##

### Scanner ###
Voraussetzung: [Vagrant](https://www.vagrantup.com/downloads) installiert.
* ```
  vagrant up
  ```
* ```
  vagrant ssh
  ```
* Beim ersten mal:
  - [JLink](https://www.segger.com/downloads/jlink/#J-LinkSoftwareAndDocumentationPack) für Linux, DEB installer, Version >=6.80 unter `J-Link Software and Documentation Pack` herunterladen. Installieren mit
    ```
    sudo dpkg -i /path/to/jlink_xxx.deb
    ```
  - ```
    pip3 install pyserial
    ```
* ```
  cd SWP_IoT_Corona/ricorder
  ```
* Nordic-Board per USB anschließen und anschalten
* ```
  make all
  ```
* ```
  make flash BOARD=nrf52dk
  ```

### Web-UI

Voraussetzung: [Python](https://www.python.org/downloads/release/python-391/) und [NPM/NodeJS](https://nodejs.org/en/download/) installiert.
* Beim ersten mal:
  - Angular CLI installieren.
    ```
    npm install -g @angular/cli
    ```
  - Python dependencies installieren
    ```
    pip3 install -r cwa-scanner-backend/dependencies 
    ```
* ```
  cd cwa-scanner-backend
  ```
* ```
  python3 main.py
  ```
* Zweites Terminal öffnen
* ```
  cd cwa-scanner-webui
  ```
* ```
  ng serve
  ```
* Im Browser [http://localhost:4200](http://localhost:4200) öffnen
* Log-Datei von der SD-Karte hochladen und mit `Upload` bestätigen.
* Es sollte sich eine Grafik öffnen
## Lizenz ##

Keine Ahnung? RIOT nutzt LGPL, glaube ich. Vielleicht können wir da einfach mal nachfragen.
