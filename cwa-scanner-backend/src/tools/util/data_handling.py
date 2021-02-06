#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
from os.path import join
from .adparser import isCWA

STANDARD_INTERVAL = 60

def onlyCWA(options):
    return options is not None and 'only_cwa' in options and options['only_cwa']

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

def rssi_stacked_per_minute(path, files, options=None):
    interval = options["interval"] if options is not None else STANDARD_INTERVAL
    data = readData(path, files)
    ppm = []
    for ps in data:
        fileData = {}
        for p in ps["data"]:
            if onlyCWA(options) and not isCWA(p):
                continue
            t = str(int(p["time"] - p["time"]%interval))
            if t not in fileData:
                fileData[t] = {}
            r = int(p["rssi"] - p["rssi"]%10)
            sr = str(r) if p["rssi"]%10 < 6 else str(r+10)
            if sr not in fileData[t]:
                fileData[t][sr] = 0
            fileData[t][sr] += 1
        ppm.append({
            "filename": ps["filename"],
            "data": fileData
        })
    return ppm

def packets_per_minute(path, files, options=None):
    interval = options["interval"] if options is not None else STANDARD_INTERVAL
    data = readData(path, files)
    ppm = []
    for ps in data:
        fileData = {}
        for p in ps["data"]:
            if onlyCWA(options) and not isCWA(p):
                continue
            t = int(p["time"] - p["time"]%interval)
            if t not in fileData:
                fileData[t] = {
                    "total": 0,
                    "cwa": 0,
                    "non_cwa": 0
                }
            fileData[t]["total"] += 1
            if isCWA(p):
                fileData[t]["cwa"] += 1
            else:
                fileData[t]["non_cwa"] += 1
        ppm.append({
            "filename": ps["filename"],
            "data": fileData
        })
    return ppm

def devices_per_minute(path, files, options=None):
    interval = options["interval"] if options is not None else STANDARD_INTERVAL
    data = readData(path, files)
    dpm = []
    for ps in data:
        dpm1 = {}
        dpm2 = {}
        for p in ps["data"]:
            if onlyCWA(options) and not isCWA(p):
                continue
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
            if onlyCWA(options) and not isCWA(p):
                continue
            t = int(p["rssi"] - p["rssi"]%10)
            st = str(t) if p["rssi"]%10 < 6 else str(t+10)
            if st not in fileData:
                fileData[st] = 0
            fileData[st] += 1
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
    elif aggregation_type == "rssi_stacked_per_minute":
        f = rssi_stacked_per_minute
    return f(path, files, options) if f is not None else []
