import os
from flask import Flask, jsonify, request, url_for, redirect
from flask.helpers import send_from_directory
from flask_swagger import swagger
from flask_cors import CORS
from .tools.util.adparser import ADParser
from werkzeug.utils import secure_filename
import numpy as np
import json

class Server():

    ROOT_URL_PATH = "/api"

    production = False

    def __init__(self, production):
        self.app = Flask("cwa-scanner-backend")
        self.app.config['UPLOAD_PATH'] = 'upload-data'
        cors = CORS(self.app, resources={r"/api/*": {"origins": "*"}})
        self.production = production
        self.initRoutes()

    def getApp(self):
        return self.app

    def serve(self, host="localhost", port=5080, debug=True):
        self.app.run(host, port, debug)

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
        
        @self.app.route(self.ROOT_URL_PATH+'/upload-cwa-data', methods=['POST'])
        def uploadData():
            """
            Upload CWA scanner data from the SD card
            ---
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
                path = os.path.join(self.app.config['UPLOAD_PATH'], file.filename)
                f = open(path, "w")
                f.write(s)
                f.close()
            res = ADParser(s, fromfile=False)
            ps = res.getPkts()
            for p in ps:
                p['location'] = {
                    "lat": 52.4403357+(np.random.rand()-0.5)/10,
                    "lng": 13.2416195+(np.random.rand()-0.5)/10
                }
            if path is not None:
                f = open(path+".json", "w")
                f.write(json.dumps(ps))
                f.close()
            return jsonify(ps), 200
        
        @self.app.route(self.ROOT_URL_PATH+'/cwa-data/<filename>', methods=['GET'])
        def getData(filename):
            """
            Get uploaded CWA data
            ---
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
                path = os.path.join(self.app.config['UPLOAD_PATH'], filename+".json")
            else:
                path = os.path.join(self.app.config['UPLOAD_PATH'], filename)
            try:
                f = open(path, "r")
                s = f.read()
                f.close()
            except FileNotFoundError:
                return jsonify({"error": "Data not found"}),404
            if request.headers["Accept"] == "application/json":
                return jsonify(json.loads(s)), 200
            else:
                return s, 200
        
        @self.app.route(self.ROOT_URL_PATH+'/aggregate-data', methods=['POST'])
        def aggregateData():
            """
            Aggregate uploaded CWA data
            ---
            parameters:
                - name: aggregationType
                  in: body
                  description: The type of the aggregation
                  required: true
                  type: string
                - name: dataFiles
                  in: body
                  description: The data files to be aggregated
                  required: true
                  type: array
                  items:
                    type: string
            produces:
                - application/json
            responses:
                200:
                    description: The requested data
                404:
                    description: The data was not be found
                500:
                    description: The data could not be sent
            """
            body = json.loads(request.data)
            dataFiles = body["dataFiles"]
            type = body["type"]
            data = []
            for filename in dataFiles:
                path = os.path.join(self.app.config['UPLOAD_PATH'], filename+".json")
                try:
                    f = open(path, "r")
                    s = json.loads(f.read())
                    f.close()
                    data += s
                except Exception:
                    return jsonify({"error": "Data not found"}),404
            return jsonify(data), 200
            
