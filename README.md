# Software project Corona-Warn-App #

## Setup ##

When cloning the repository, you should use
`git clone --recurse-submodules <REPOSITORY URL>`, so that the RIOT submodule is cloned as well. Alternatively, you can use `git submodule init` and `git submodule update`.

## Build ##

### Scanner ###
Prerequisite: [Vagrant](https://www.vagrantup.com/downloads) is installed.
* ```
  vagrant up
  ```
* ```
  vagrant ssh
  ```
* First time:
  - Download [JLink](https://www.segger.com/downloads/jlink/#J-LinkSoftwareAndDocumentationPack) for Linux, DEB installer, Version >=6.80 at `J-Link Software and Documentation Pack`. Install using
    ```
    sudo dpkg -i /path/to/jlink_xxx.deb
    ```
  - ```
    pip3 install pyserial
    ```
* ```
  cd SWP_IoT_Corona/ricorder
  ```
* Connect Nordic-Board via USB and turn it on.
* ```
  make all
  ```
* ```
  make flash BOARD=nrf52dk
  ```

### Web-UI

#### With Docker

* `docker-compose up`
* Visit [http://localhost:80](http://localhost:80) in your browser.

#### Without Docker

Prerequisite: [Python](https://www.python.org/downloads/release/python-391/) and [NPM/NodeJS](https://nodejs.org/en/download/) are installed.
* First time:
  - Install Angular CLI.
    ```
    npm install -g @angular/cli
    npm install
    ```
  - Install Python dependencies
    ```
    pip3 install -r cwa-scanner-backend/dependencies 
    ```
* ```
  cd cwa-scanner-backend
  ```
* ```
  python3 main.py
  ```
* Open second terminal
* ```
  cd cwa-scanner-webui
  ```
* ```
  ng serve
  ```
* Visit [http://localhost:4200](http://localhost:4200) in your browser.
