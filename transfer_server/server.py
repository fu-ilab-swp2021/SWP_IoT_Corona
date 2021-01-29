import socket
import requests

UDP_IP = "::"
UDP_PORT = 12345
sock = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM)
sock.bind((UDP_IP,UDP_PORT))

while True:
  d = ''
  send = True
  while True:
    data, addr = sock.recvfrom(8192)
    print("received: ",len(data))
    s = data.decode('utf-8')
    if s == "end":
      exit(0)
    if s.startswith("filename="):
      filename = s[9:]
      continue
    if s == "close":
      break
    if s == "fail":
      send = False
      break
    d += s
  if send:
    requests.post('http://192.168.178.32:5080/api/upload-cwa-data/'+filename, data=d)

sock.close()
