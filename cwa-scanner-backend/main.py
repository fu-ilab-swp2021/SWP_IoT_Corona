from waitress import serve
from src.server import Server
import os

production = os.environ.get(
    "PRODUCTION") != None and os.environ.get("PRODUCTION") == "true"

server = Server(production)

if(production):
    serve(server.getApp(), host='0.0.0.0', port=80)
else:
    server.serve(host='localhost', port=5080, debug=True)
