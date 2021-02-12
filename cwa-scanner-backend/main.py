from waitress import serve
from src.server import Server
import os
import sys

production = os.environ.get(
    "PRODUCTION") != None and os.environ.get("PRODUCTION") == "true"

server = Server(production, preprocess=(len(sys.argv) > 1 and sys.argv[1] == '--preprocess'))

if(production):
    serve(server.getApp(), host='0.0.0.0', port=80)
else:
    server.serve(host='0.0.0.0', port=5080, debug=True)
