# ricorder - RIOT Corona-Warn-App Recorder

`ricorder` is a lightweight, standalone Bluetooth Low Energy (BLE) advertising
data scanner build for analyzing the real-world usage of the Corona-Warn-App. It
consist of a micro-controller running [RIOT](https://riot-os.org) that
permanently scans the BLE advertising channels and writes all detected packets
to a SD card.

The RAW data obtained by the scanner is then analyzed to gain insides into the
real-world deployment situation of the Corona-Warn-App.

This repository contains all information and software needed to build a
standalone Bluetooth Low Energy (BLE) scanner with inexpensive of-the-shelf
components. The repository also contains the basic tooling needed to analyze the
RAW data.


## Technical Details

Devices with an active Corona-Warn-App continuously transmit BLE advertising
packets as defined by the [Google/Apple Exposure Notification]
(https://blog.google/documents/70/Exposure_Notification_-_Bluetooth_Specification_v1.2.2.pdf)
framework. These packets can distinctly identified by their 16-bit service UUID
(0xFD6F) included in their payload.


## Log Format

The scanner will continuously write all received advertising packets to its SD
card. Before usage, the SD must be formatted with a FAT file system.

The scanner will create a new logfile every hour. The names of the logfiles are
directly deducted from the current timestamp: `filename := str(unixtime / 1000)`.
The shortening of the unixtime is hereby needed as the vfat module in RIOT seems
to have a restriction on 8 character long file names...

Each detected advertising packet is then appended to the current logfile as one
line using the following format:
```
TS_SEC.TS_MSEC;EVT_TYPE;ADDR_TYPE;ADDR;RSSI;AD
```
with:
- `TS_SEC`: unix timestamp in seconds of the time the packet was received
- `TS_MSEC`: sub-second value of the RX time
- `EVT_TYPE`: HCI event, using:
  - ADV_IND = 0
  - DIR_IND = 1
  - SCAN_IND = 2
  - NONCONN_IND = 3
  - SCAN_RSP = 4
- `ADDR_TYPE`: BLE address type, using:
  - PUBLIC = 0
  - RANDOM = 1
  - RPA_PUBLIC = 2
  - RPA_RANDOM = 3
- `ADDR`: 48-bit BLE address
- `RSSI`: received signal strength of that packet
- `AD`: the RAW received payload (advertising data), hex-encoded. All multi-byte
        data in this field is encoded little-endian. So e.g. if you want to find
        the exposure notification 16-bit UUID (0xFD6F) you have to look for
        0x6FFD.


## Hardware

The first prototype is build from the following components:
- [NRF52DK](https://www.nordicsemi.com/Software-and-Tools/Development-Kits/nRF52-DK)
- RTC module (DS3231) incl. CR1220 backup battery
- 0.96" OLED display (SSD1306, 128x64)
- SD card reader module (SPI)
- SD card
- a couple of jumper wires
- USB power bank

![Prototype](img/ricorder_setup.jpg)

**Pin Mapping:**

![ricorder Schmematics](img/ricorder_pin_schema.svg)

SD-Card Adapter:
```
module  board
VCC     VDD
GND     GND
MOSI    P0.23
MISO    P0.24
SCK     P0.25
CS      P0.22
```

RTC (DS3231):
```
module  board
VCC     VDD
GND     GND
SCL     P0.27
SDA     P0.26
```

OLED Display (SSD1306):
```
module  board
VCC     VDD
GND     GND
SCL     P0.27
SDA     P0.26
```


## Software

The firmware of the scanner is based on RIOT.

The firmware application is structured into the following modules:
- `stor`: storage -> initializing and writing to the SD card
- `ui`: user interface -> initializing and feeding the OLED display
- `wallclock`: time keeping -> initializing and querying the RTC module
- `scanner` (part of RIOT): control NimBLE to do the actual BLE scanning
- `modi`: functionality of the different modes of the application
- `services`: a GATT server that can receive GPS location data
- `main`: glue all the modules together and run a low-prio thread that triggers
          updating the UI and writing the scan buffer to the SD card

## Setting the time

You can set the time as follows:
* ```
  make all flash SETTIME=1
  ```
* ```
  ./tools/settime.sh
  ```
* Enter
  ```
  settime
  ```
* Exit the console
* Recompile with
  ```
  make all flash
  ```
