#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# Copyright (C) 2020 Freie Universität Berlin
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
# This library is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public
# License along with this library; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA
# 02110-1301 USA
#
# author: Hauke Petersen <hauke.petersen@fu-berlin.de>


import os
from os import listdir, lstat
from os.path import isfile, join
import re
import sys
import argparse
from enum import Enum
import json

CWA_SVC_STR =  "03036FFD"

class AddrType(Enum):
    PUBLIC = 0
    RANDOM = 1
    RPA_PUBLIC = 2
    RPA_RANDOM = 3


class EventType(Enum):
    ADV_IND = 0
    DIR_IND = 1
    SCAN_IND = 2
    NONCONN_IND = 3
    SCAN_RSP = 4


class Addr():
    def __init__(self, addr_type, addr):
        self.addr = addr
        self.type = AddrType(int(addr_type))

    def __eq__(self, other):
        return self.type == other.type and self.addr == other.addr

    def __lt__(self, other):
        return str(self) < str(other)

    def __str__(self):
        return "{}-{}".format(self.addr, self.type.name)

    def __hash__(self):
        return hash(str(self))


class Pkt():
    def __init__(self, time, type, addr, rssi, payload, raw, lat=None, lon=None):
        self.time = time
        self.type = type
        self.addr = addr
        self.rssi = rssi
        self.payload = payload
        self.raw = raw
        # self.location = {
        #     'lat': lat,
        #     'lng': lon,
        # }

    def __str__(self):
        return "TIME:{} SRC:{} RSSI:{}dbm".format(self.time, self.addr, self.rssi)
    
    def toJson(self):
        return {
            'time': self.time,
            'type': self.type.value,
            'addr': str(self.addr),
            'rssi': self.rssi,
            'payload': self.payload,
            'raw': self.raw,
            # 'location': self.location,
        }

    def static(self):
        return "{};{}".format(self.addr, self.payload)


class ADParser():
    def __init__(self, logs, fromfile=True):
        self.pkts = []

        self.nodes = {}

        if fromfile:
            for logfile in logs:
                self.parseFromFile(logfile)
        else:
            self.parse(logs.splitlines())

    def parseFromFile(self, logfile):
        lines = []
        with open(logfile, "r", encoding="utf-8") as f:
            for line in f:
                lines.append(line)
        self.parse(lines)

    def parse(self, lines):
        cnt = 0
        for line in lines:
            cnt += 1
            m = re.match(r'(?P<time>\d+\.\d+);'
                            r'(?P<event_type>\d);'
                            r'(?P<addr_type>\d);(?P<addr>[:a-fA-F0-9]+);'
                            r'(?P<rssi>-?\d+);'
                            r'(?P<payload>[a-zA-Z0-9]+)',
                            # r'(?P<lat>\d{1,3}\.\d+);'
                            # r'(?P<lon>\d{1,3}\.\d+)',
                            line)
            if m:
                print(cnt)
                pkt = Pkt(float(m.group("time")),
                            EventType(int(m.group("event_type"))),
                            Addr(m.group("addr_type"), m.group("addr")),
                            int(m.group("rssi")),
                            m.group("payload"),
                            # float(m.group("lat")),
                            # float(m.group("lon")),
                            line)
                self.pkts.append(pkt)

    def join(self):
        for pkt in self.pkts:
            print(pkt.raw, end="")
    
    def getPkts(self):
        return [p.toJson() for p in self.pkts]

    def filter_cwa(self):
        for pkt in self.pkts:
            if CWA_SVC_STR in pkt.payload:
                print(pkt.raw, end="")


    def filter_noncwa(self):
        for pkt in self.pkts:
            if CWA_SVC_STR not in pkt.payload:
                print(pkt.raw, end="")


    def compress(self):
        seen = {}

        for pkt in self.pkts:
            static = pkt.static()
            if static not in seen:
                seen[static] = 1
                print(pkt.raw, end="")
            else:
                seen [static] += 1


    def nodeinfo(self):
        for pkt in self.pkts:
            if pkt.addr not in self.nodes:
                self.nodes[pkt.addr] = {
                    "rssi": [],
                    "time": [],
                }
            self.nodes[pkt.addr]["rssi"].append(pkt.rssi)
            self.nodes[pkt.addr]["time"].append(pkt.time)

        for node in sorted(self.nodes):
            n = self.nodes[node]

            # try to calculate advertising interval
            itvl = []
            cur = n["time"][0]
            for t in n["time"][1:]:
                itvl.append(t - cur)
                cur = t

            print("{}:".format(node))
            print("  rssi: {}dbm / {}dbm / {:.2f}dbm (min/max/avg)".format(
                        min(n["rssi"]),
                        max(n["rssi"]),
                        (sum(n["rssi"]) / len(n["rssi"]))))
            if len(itvl) > 0:
                print("  itvl: {:.2f}s / {:.2f}s / {:.2f}s".format(
                        min(itvl), max(itvl), (sum(itvl) / len(itvl))))

def readData(path, files):
    data = []
    try:
        for filename in files:
            p = join(path, filename+".json")
            f = open(p, "r")
            s = f.read()
            f.close()
            data.append({
                "filename": filename,
                "data": json.loads(s)
            })
        return data
    except Exception as e:
        print(e)
        return []

def packets_per_minute(path, files, options=None):
    interval = options["interval"] if options is not None else 60
    data = readData(path, files)
    ppm = []
    for ps in data:
        fileData = {}
        for p in ps["data"]:
            t = int(p["time"] - p["time"]%interval)
            if t not in fileData:
                fileData[t] = {
                    "total": 0,
                    "cwa": 0,
                    "non_cwa": 0
                }
            fileData[t]["total"] += 1
            if CWA_SVC_STR in p["payload"]:
                fileData[t]["cwa"] += 1
            else:
                fileData[t]["non_cwa"] += 1
        ppm.append({
            "filename": ps["filename"],
            "data": fileData
        })
    return ppm

def devices_per_minute(path, files, options=None):
    interval = options["interval"] if options is not None else 60
    data = readData(path, files)
    dpm = []
    for ps in data:
        dpm1 = {}
        dpm2 = {}
        for p in ps["data"]:
            t = int(p["time"] - p["time"]%interval)
            if t not in dpm1:
                dpm1[t] = 1
                dpm2[t] = [p["addr"]]
            if p["addr"] not in dpm2[t]:
                dpm2[t].append(p["addr"])
                dpm1[t] += 1
        dpm.append({
            "filename": ps["filename"],
            "data": dpm1
        })
    return dpm

def rssi_distribution(path, files, options=None):
    data = readData(path, files)
    rssi_dist = []
    for ps in data:
        fileData = {}
        for p in ps["data"]:
            t = int(p["rssi"] - p["rssi"]%10)
            if str(t) not in fileData:
                fileData[str(t)] = 0
            fileData[str(t)] += 1
        rssi_dist.append({
            "filename": ps["filename"],
            "data": fileData
        })
    return rssi_dist

def aggregate(aggregation_type, path, files, options=None):
    f = None
    if aggregation_type == "packets_per_minute":
        f = packets_per_minute
    elif aggregation_type == "rssi_distribution":
        f = rssi_distribution
    elif aggregation_type == "devices_per_minute":
        f = devices_per_minute
    return f(path, files, options) if f is not None else []