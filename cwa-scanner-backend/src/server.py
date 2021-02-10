import os
from os import listdir
from os.path import isfile, join
from flask import Flask, jsonify, request, Response
from flask_swagger import swagger
from flask_cors import CORS
from .tools.adparser import ADParser
from .tools.data_handling import aggregate, all_option_combinations, preprocess_aggregation, parse_gps_file
import numpy as np
import json
import shutil

data_files = []

def fileExists(filename):
    for f in data_files:
        if f["filename"] == filename:
            return f
    return None

def addNoiseToCoordinates(packets):
    lat = 52.4403357+(np.random.rand()-0.5)/100,
    lng = 13.2416195+(np.random.rand()-0.5)/100
    for p in packets:
        p['location'] = {
            # "lat": 52.4403357+(np.random.rand()-0.5)/1000,
            # "lng": 13.2416195+(np.random.rand()-0.5)/1000
            "lat": lat,
            "lng": lng
        }

class Server():

    ROOT_URL_PATH = "/api"

    production = False
    preprocess = False

    def __init__(self, production, preprocess):
        self.app = Flask("cwa-scanner-backend")
        self.app.config['UPLOAD_PATH'] = 'upload-data'
        self.app.config['RAW_PATH'] = join(self.app.config['UPLOAD_PATH'], 'raw')
        self.app.config['JSON_PATH'] = join(self.app.config['UPLOAD_PATH'], 'json')
        self.app.config['AGG_PATH'] = join(self.app.config['UPLOAD_PATH'], 'aggregations')
        self.app.config['GPS_PATH'] = join(self.app.config['UPLOAD_PATH'], 'gps.json')
        CORS(self.app, resources={r"/api/*": {"origins": "*"}})
        self.production = production
        self.preprocess = preprocess
        self.initFolder()
        self.initRoutes()

    def getApp(self):
        return self.app

    def serve(self, host="localhost", port=5080, debug=True):
        self.app.run(host, port, debug)
    
    def preprocessFile(self, filename, content, calculateAggregations=False, overwriteJson=True):
        print('PREPROCCESING '+filename)
        path = join(self.app.config['JSON_PATH'], filename+'.json')
        ps = []
        if overwriteJson or not os.path.exists(path):
            res = ADParser(content, fromfile=False)
            ps = res.getPkts()
            # addNoiseToCoordinates(ps)
            f = open(path, "w")
            f.write(json.dumps(ps))
            f.close()
        else:
            f = open(path, "r")
            s = f.read()
            f.close()
            ps = json.loads(s)
        pExists = fileExists(filename)
        if pExists:
            data_files.remove(pExists)
        print('PARSING DONE')
        if calculateAggregations and (not self.getAggregationCalculated(filename) or overwriteJson):
            print('AGGREGATIONS BEGIN')
            preprocess_aggregation(self.app.config['AGG_PATH'], filename, ps)
            self.setAggregationCalculated(filename)
            print('AGGREGATIONS DONE')
        else:
            print('AGGREGATIONS SKIPPED')
        data_files.append({
            "filename": filename,
            "first": ps[0]["time"] * 1000,
            "last": ps[-1]["time"] * 1000
        })
        print('-----------------')
        return ps
    
    def initFolder(self):
        if not os.path.exists(self.app.config['RAW_PATH']):
            os.makedirs(self.app.config['RAW_PATH'])
        if not os.path.exists(self.app.config['JSON_PATH']):
            os.makedirs(self.app.config['JSON_PATH'])
        if not os.path.exists(self.app.config['AGG_PATH']):
            os.makedirs(self.app.config['AGG_PATH'])
        if not os.path.exists(join(self.app.config['AGG_PATH'], 'aggregations.json')):
            f = open(join(self.app.config['AGG_PATH'], 'aggregations.json'), 'w')
            f.write(json.dumps([]))
            f.close()
        if not os.path.exists(self.app.config['GPS_PATH']):
            f = open(self.app.config['GPS_PATH'], 'w')
            f.write(json.dumps([]))
            f.close()
        else:
            try:
                onlyfiles = [f for f in listdir(self.app.config['RAW_PATH']) if isfile(join(self.app.config['RAW_PATH'], f))]
                for filename in onlyfiles:
                    path = join(self.app.config['RAW_PATH'], filename)
                    f = open(path, "r")
                    content = f.read()
                    self.preprocessFile(filename, content, calculateAggregations=self.preprocess, overwriteJson=False)
            except Exception as e:
                print(e)
                exit(1)

    def getAggregationCalculated(self, filename):
        f = open(join(self.app.config['AGG_PATH'], 'aggregations.json'), 'r')
        s = json.loads(f.read())
        f.close()
        return filename in s
    
    def setAggregationCalculated(self, filename):
        f = open(join(self.app.config['AGG_PATH'], 'aggregations.json'), 'r')
        s = json.loads(f.read())
        f.close()
        f = open(join(self.app.config['AGG_PATH'], 'aggregations.json'), 'w')
        s.append(filename)
        f.write(json.dumps(s))
        f.close()
    
    def deleteAggregationCalculated(self, filename):
        f = open(join(self.app.config['AGG_PATH'], 'aggregations.json'), 'r')
        s = json.loads(f.read())
        f.close()
        f = open(join(self.app.config['AGG_PATH'], 'aggregations.json'), 'w')
        s.remove(filename)
        f.write(json.dumps(s))
        f.close()

    def initRoutes(self):

        @self.app.route(self.ROOT_URL_PATH+'/spec', methods=['GET'])
        def spec():
            swag = swagger(self.app)
            swag['info']['version'] = "1.0"
            swag['info']['title'] = "CWA Scanner Backend API"
            if self.production:
                swag['host'] = request.host
            else:
                swag['host'] = 'localhost:5080'
            swag['schemes'] = ['http']
            return jsonify(swag), 200

        @ self.app.route(self.ROOT_URL_PATH+'/status', methods=['GET'])
        def status():
            return jsonify("Status OK - Production mode: " + str(self.production)), 200
        
        @self.app.route(self.ROOT_URL_PATH+'/upload-gps-data-from-file', methods=['POST'])
        def uploadGpsDataFromFile():
            """
            Upload GPS scanner data from a file from the SD card
            ---
            tags:
                - CWA scanner data
            produces:
                - application/json
            responses:
                201:
                    description: The data was uploaded
                400:
                    description: The data could not be uploaded
                500:
                    description: The data could not be uploaded
            """
            file = request.files['fileKey']
            s = file.read().decode("utf-8")
            new = parse_gps_file(s)
            f = open(self.app.config['GPS_PATH'], "r")
            old = json.loads(f.read())
            f.close()
            result = []
            for oldG in old:
                add = True
                for newG in new:
                    if oldG['filename'] == newG['filename']:
                        add = False
                if add:
                    result.append(oldG)
            for newG in new:
                result.append(newG)
            f = open(self.app.config['GPS_PATH'], "w")
            f.write(json.dumps(result))
            f.close()
            return jsonify('uploaded'), 200
        
        @self.app.route(self.ROOT_URL_PATH+'/gps-data', methods=['DELETE'])
        def deleteGpsData():
            """
            Delete GPS scanner data
            ---
            tags:
                - CWA scanner data
            produces:
                - application/json
            responses:
                200:
                    description: The data was deleted
                400:
                    description: The data could not be deleted
                500:
                    description: The data could not be deleted
            """
            f = open(self.app.config['GPS_PATH'], "w")
            f.write(json.dumps([]))
            f.close()
            return jsonify('deleted'), 200

        @self.app.route(self.ROOT_URL_PATH+'/upload-cwa-data-from-file', methods=['POST'])
        def uploadDataFromFile():
            """
            Upload CWA scanner data from a file from the SD card
            ---
            tags:
                - CWA scanner data
            produces:
                - application/json
            responses:
                201:
                    description: The data was uploaded
                400:
                    description: The data could not be uploaded
                500:
                    description: The data could not be uploaded
            """
            for f in request.files:
                file = request.files[f]
                s = file.read().decode("utf-8")
                if file.filename != '':
                    path = join(self.app.config['RAW_PATH'], file.filename)
                    f = open(path, "w")
                    f.write(s)
                    f.close()
                    self.preprocessFile(file.filename, s, calculateAggregations=(request.args.get('aggregate')=='true'), overwriteJson=True)
            return jsonify('uploaded'), 200
        
        @self.app.route(self.ROOT_URL_PATH+'/upload-cwa-data/<filename>', methods=['POST'])
        def uploadData(filename):
            """
            Upload CWA scanner data
            ---
            tags:
                - CWA scanner data
            parameters:
                - name: aggregate
                  in: query
                  description: Whether to preprocess all aggregations
                  required: false
                  type: boolean
            produces:
                - application/json
            responses:
                201:
                    description: The data was uploaded
                400:
                    description: The data could not be uploaded
                500:
                    description: The data could not be uploaded
            """
            s = request.data.decode('utf-8').replace('\r\n','\n')
            path = join(self.app.config['RAW_PATH'], filename)
            f = open(path, "w")
            f.write(s)
            f.close()
            self.preprocessFile(filename, s, calculateAggregations=(request.args.get('aggregate')=='true'), overwriteJson=True)
            return jsonify('uploaded'), 200
        
        @self.app.route(self.ROOT_URL_PATH+'/cwa-data/<filename>', methods=['GET'])
        def getData(filename):
            """
            Get uploaded CWA data
            ---
            tags:
                - CWA scanner data
            parameters:
                - name: filename
                  in: path
                  description: The name of the data
                  required: true
                  type: string
            produces:
                - application/json
                - text/plain
            responses:
                200:
                    description: The requested data
                404:
                    description: The data was not found
                500:
                    description: The data could not be sent
            """
            if request.headers["Accept"] == "application/json":
                path = join(self.app.config['JSON_PATH'], filename+".json")
            else:
                path = join(self.app.config['RAW_PATH'], filename)
            try:
                f = open(path, "r")
                s = f.read()
                f.close()
            except FileNotFoundError:
                return jsonify({"error": "Data not found"}),404
            if request.headers["Accept"] == "application/json":
                return jsonify(json.loads(s)), 200
            else:
                return Response(s, mimetype="text/plain")
        
        @self.app.route(self.ROOT_URL_PATH+'/cwa-data/<filename>', methods=['DELETE'])
        def deleteData(filename):
            """
            Delete uploaded CWA data
            ---
            tags:
                - CWA scanner data
            parameters:
                - name: filename
                  in: path
                  description: The name of the data
                  required: true
                  type: string
            responses:
                200:
                    description: The requested data
                400:
                    description: The data could not be deleted
                404:
                    description: The data was not found
                500:
                    description: The data could not be sent
            """
            try:
                pExists = fileExists(filename)
                if pExists:
                    data_files.remove(pExists)
                    path = join(self.app.config['RAW_PATH'], filename)
                    if os.path.exists(path):
                        os.remove(path)
                    path = join(self.app.config['JSON_PATH'], filename+'.json')
                    if os.path.exists(path):
                        os.remove(path)
                    path = join(self.app.config['AGG_PATH'], filename)
                    if os.path.exists(path):
                        shutil.rmtree(path)
                    self.deleteAggregationCalculated(filename)
                else:
                    return jsonify({"error": "Data not found"}),404
            except Exception as e:
                print(e)
                return jsonify({"error": "Data could not be deleted"}),400
            return jsonify("deleted"), 200
        
        @self.app.route(self.ROOT_URL_PATH+'/cwa-data', methods=['GET'])
        def getAllData():
            """
            Get uploaded CWA data
            ---
            tags:
                - CWA scanner data
            produces:
                - application/json
                - text/plain
            responses:
                200:
                    description: The requested data
                404:
                    description: The data was not found
                500:
                    description: The data could not be sent
            """
            data = []
            try:
                if request.headers["Accept"] == "application/json":
                    onlyfiles = [f for f in listdir(self.app.config['JSON_PATH']) if isfile(join(self.app.config['JSON_PATH'], f))]
                    for filename in onlyfiles:
                        path = join(self.app.config['UPLOAD_PATH'], filename)
                        f = open(path, "r")
                        s = f.read()
                        f.close()
                        data.append({"name": filename.removesuffix(".json"), "data": json.loads(s)})
                elif request.headers["Accept"] != "application/json":
                    onlyfiles = [f for f in listdir(self.app.config['RAW_PATH']) if isfile(join(self.app.config['RAW_PATH'], f))]
                    for filename in onlyfiles:
                        path = join(self.app.config['UPLOAD_PATH'], filename)
                        f = open(path, "r")
                        s = f.read()
                        f.close()
                        data.append(s)
            except Exception as e:
                print(e)
                return jsonify({"error": "Data not found"}),404
            if request.headers["Accept"] == "application/json":
                return jsonify(data), 200
            else:
                return Response(json.dumps(data), mimetype="text/plain")

        @self.app.route(self.ROOT_URL_PATH+'/cwa-filenames', methods=['GET'])
        def getAllFilenames():
            """
            Get uploaded CWA data filenames
            ---
            tags:
                - CWA scanner data
            produces:
                - application/json
            responses:
                200:
                    description: The requested filenames and first and last timestamp of each file
                404:
                    description: The data was not found
                500:
                    description: The data could not be sent
            """
            return jsonify(data_files), 200
        
        @self.app.route(self.ROOT_URL_PATH+'/aggregate-data', methods=['POST'])
        def aggregateData():
            """
            Aggregate uploaded CWA data
            ---
            tags:
                - CWA scanner data
            definitions:
            - schema:
                id: AggregationRequest
                type: object
                required:
                    - dataFiles
                    - type
                properties:
                    dataFiles:
                        type: array
                        items:
                          type: string
                    type:
                        type: string
                    options:
                        type: object
            parameters:
                - name: Aggregation Request
                  in: body
                  description: The aggregation request
                  required: true
                  schema:
                    $ref: '#/definitions/AggregationRequest'
            produces:
                - application/json
            responses:
                200:
                    description: The requested data
                404:
                    description: The data was not found
                500:
                    description: The data could not be sent
            """
            body = json.loads(request.data)
            dataFiles = body["dataFiles"]
            aggregation_type = body["type"]
            options = None
            if "options" in body:
                options = body["options"]
            data = aggregate(aggregation_type, self.app.config, dataFiles, options)
            return jsonify(data), 200
            
