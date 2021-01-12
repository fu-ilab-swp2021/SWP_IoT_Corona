import os
from os import listdir
from os.path import isfile, join
from flask import Flask, jsonify, request, url_for, redirect, Response
from flask.helpers import send_from_directory
from flask_swagger import swagger
from flask_cors import CORS
from .tools.util.adparser import ADParser, aggregate
from werkzeug.utils import secure_filename
import numpy as np
import json


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

    def __init__(self, production):
        self.app = Flask("cwa-scanner-backend")
        self.app.config['UPLOAD_PATH'] = 'upload-data'
        self.initFolder()
        cors = CORS(self.app, resources={r"/api/*": {"origins": "*"}})
        self.production = production
        self.initRoutes()

    def getApp(self):
        return self.app

    def serve(self, host="localhost", port=5080, debug=True):
        self.app.run(host, port, debug)
    
    def initFolder(self):
        if not os.path.exists(self.app.config['UPLOAD_PATH']):
            os.makedirs(self.app.config['UPLOAD_PATH'])
        else:
            try:
                onlyfiles = [f for f in listdir(self.app.config['UPLOAD_PATH']) if isfile(join(self.app.config['UPLOAD_PATH'], f))]
                for filename in onlyfiles:
                    path = join(self.app.config['UPLOAD_PATH'], filename)
                    if not filename.endswith(".json") and (filename+".json") not in onlyfiles:
                        res = ADParser([path], fromfile=True)
                        ps = res.getPkts()
                        addNoiseToCoordinates(ps)
                        f = open(path+".json", "w")
                        f.write(json.dumps(ps))
                        f.close()
            except Exception as e:
                print(e)
                exit(1)

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
            file = request.files['fileKey']
            path = None
            s = file.read().decode("utf-8")
            if file.filename != '':
                path = join(self.app.config['UPLOAD_PATH'], file.filename)
                f = open(path, "w")
                f.write(s)
                f.close()
            res = ADParser(s, fromfile=False)
            ps = res.getPkts()
            addNoiseToCoordinates(ps)
            if path is not None:
                f = open(path+".json", "w")
                f.write(json.dumps(ps))
                f.close()
            return jsonify(ps), 200
        
        @self.app.route(self.ROOT_URL_PATH+'/upload-cwa-data/<filename>', methods=['POST'])
        def uploadData(filename):
            """
            Upload CWA scanner data
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
            s = request.data.decode('utf-8').replace('\r\n','\n')
            path = join(self.app.config['UPLOAD_PATH'], filename)
            f = open(path, "w")
            f.write(s)
            f.close()
            res = ADParser(s, fromfile=False)
            ps = res.getPkts()
            addNoiseToCoordinates(ps)
            f = open(path+".json", "w")
            f.write(json.dumps(ps))
            f.close()
            return jsonify(ps), 200
        
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
                path = join(self.app.config['UPLOAD_PATH'], filename+".json")
            else:
                path = join(self.app.config['UPLOAD_PATH'], filename)
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
                path = join(self.app.config['UPLOAD_PATH'], filename)
                if os.path.exists(path) and os.path.exists(path+".json"):
                    os.remove(path)
                    os.remove(path+".json")
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
                onlyfiles = [f for f in listdir(self.app.config['UPLOAD_PATH']) if isfile(join(self.app.config['UPLOAD_PATH'], f))]
                for filename in onlyfiles:
                    path = join(self.app.config['UPLOAD_PATH'], filename)
                    if request.headers["Accept"] == "application/json" and filename.endswith(".json"):
                        f = open(path, "r")
                        s = f.read()
                        f.close()
                        data.append({"name": filename.removesuffix(".json"), "data": json.loads(s)})
                    elif request.headers["Accept"] != "application/json" and not filename.endswith(".json"):
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
                    description: The requested filenames
                404:
                    description: The data was not found
                500:
                    description: The data could not be sent
            """
            try:
                onlyfiles = [f for f in listdir(self.app.config['UPLOAD_PATH']) if isfile(join(self.app.config['UPLOAD_PATH'], f)) and not f.endswith(".json")]
            except Exception as e:
                print(e)
                return jsonify({"error": "Data not found"}),404
            return jsonify(onlyfiles), 200
        
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
            data = aggregate(aggregation_type, self.app.config["UPLOAD_PATH"], dataFiles, options)
            return jsonify(data), 200
            
