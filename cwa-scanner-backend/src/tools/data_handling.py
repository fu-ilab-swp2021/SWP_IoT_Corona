#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
from os.path import join
from .adparser import isCWA
import os

OPTION_VALUES = {
    "interval": list(range(5, 125, 5)),
    "only_cwa": [True, False]
}

STANDARD_INTERVAL = 60

def all_option_combinations(i, o, options):
    l = []
    if i == len(OPTION_VALUES):
        return [o]
    k = list(OPTION_VALUES.keys())[i]
    if k not in options:
        return all_option_combinations(i+1, o, options)
    for v in OPTION_VALUES[k]:
        o2 = o.copy()
        o2[k] = v
        l += all_option_combinations(i+1, o2, options)
    return l

def preprocess_aggregation(path, filename, ps):
    for agg in aggregation_option_mapping:
        for options in all_option_combinations(0, {}, aggregation_option_mapping[agg]):
            optionsname = 'opt'
            for k in options:
                optionsname += '.' + k + '_' + str(options[k])
            aggPath = join(path, filename, agg, optionsname+'.json')
            aggregationFunction = getAggregationFunction(agg)
            fileData = aggregationFunction(ps, options)
            if not os.path.exists(join(path, filename, agg)):
                os.makedirs(join(path, filename, agg))
            f = open(aggPath, "w")
            f.write(json.dumps(fileData))
            f.close()

def onlyCWA(options):
    return options is not None and 'only_cwa' in options and options['only_cwa']

def getAggregationFunction(aggregation_type):
    return aggregation_function_mapping[aggregation_type] if aggregation_type in aggregation_function_mapping else None

def readData(path, files=[], filename=None):
    try:
        if filename:
            p = join(path, filename+".json")
            f = open(p, "r")
            s = f.read()
            f.close()
            return json.loads(s)
        else:
            data = []
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
        return None if filename else []

def rssi_stacked_per_minute(ps, options=None):
    interval = options["interval"] if options is not None else STANDARD_INTERVAL
    fileData = {}
    for p in ps:
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
    return fileData

def avg_rssi_per_minute(ps, options=None):
    interval = options["interval"] if options is not None else STANDARD_INTERVAL
    fileData = {}
    for p in ps:
        if onlyCWA(options) and not isCWA(p):
            continue
        t = str(int(p["time"] - p["time"]%interval))
        if t not in fileData:
            fileData[t] = {
                "sum": 0,
                "count": 0,
                "avg": 0
            }
        fileData[t]["sum"] += p["rssi"]
        fileData[t]["count"] += 1
    for t in fileData:
        fileData[t]["avg"] = fileData[t]["sum"] / fileData[t]["count"]
    return fileData

def packets_per_minute(ps, options=None):
    interval = options["interval"] if options is not None else STANDARD_INTERVAL
    fileData = {}
    for p in ps:
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
    return fileData

def devices_per_minute(ps, options=None):
    interval = options["interval"] if options is not None else STANDARD_INTERVAL
    dpm1 = {}
    dpm2 = {}
    for p in ps:
        if onlyCWA(options) and not isCWA(p):
            continue
        t = int(p["time"] - p["time"]%interval)
        if t not in dpm1:
            dpm1[t] = 1
            dpm2[t] = [p["addr"]]
        if p["addr"] not in dpm2[t]:
            dpm2[t].append(p["addr"])
            dpm1[t] += 1
    return dpm1

def rssi_distribution(ps, options=None):
    fileData = {}
    for p in ps:
        if onlyCWA(options) and not isCWA(p):
            continue
        t = int(p["rssi"] - p["rssi"]%10)
        st = str(t) if p["rssi"]%10 < 6 else str(t+10)
        if st not in fileData:
            fileData[st] = 0
        fileData[st] += 1
    return fileData


def combineAggregationFiles(data_path, agg_path, files, aggregation_type, aggregationFunction, options=None):
    result = []
    for filename in files:
        optionsname = 'opt'
        if options is not None:
            for k in options:
                optionsname += '.' + k + '_' + str(options[k])
        aggPath = join(agg_path, filename, aggregation_type, optionsname+'.json')
        if os.path.exists(aggPath):
            f = open(aggPath, "r")
            fileData = json.loads(f.read())
            f.close()
        else:
            ps = readData(data_path, filename=filename)
            fileData = aggregationFunction(ps, options)
            if not os.path.exists(join(agg_path, filename, aggregation_type)):
                os.makedirs(join(agg_path,filename, aggregation_type))
            f = open(aggPath, "w")
            f.write(json.dumps(fileData))
            f.close()
        result.append({
            "filename": filename,
            "data": fileData
        })
    return result

def aggregate(aggregation_type, data_path, agg_path, files, options=None):
    f = getAggregationFunction(aggregation_type)
    return combineAggregationFiles(data_path, agg_path, files, aggregation_type, f, options) if f is not None else []

aggregation_function_mapping = {
    "packets_per_minute": packets_per_minute,
    "rssi_distribution": rssi_distribution,
    "devices_per_minute": devices_per_minute,
    "rssi_stacked_per_minute": rssi_stacked_per_minute,
    "avg_rssi_per_minute": avg_rssi_per_minute,
}

aggregation_option_mapping = {
    "packets_per_minute": ['only_cwa', 'interval'],
    "rssi_distribution": ['only_cwa'],
    "devices_per_minute": ['only_cwa', 'interval'],
    "rssi_stacked_per_minute": ['only_cwa', 'interval'],
    "avg_rssi_per_minute": ['only_cwa', 'interval'],
}
