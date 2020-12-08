import os
from flask import Flask, jsonify, request, url_for, redirect
from flask.helpers import send_from_directory
from flask_swagger import swagger
from flask_cors import CORS
from .tools.util.adparser import ADParser
from werkzeug.utils import secure_filename

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
            s = file.read().decode("utf-8")
            res = ADParser(s, fromfile=False)
            p = res.getPkt()
            return jsonify(p), 200
