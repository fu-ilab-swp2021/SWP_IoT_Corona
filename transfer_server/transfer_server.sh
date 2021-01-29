#!/bin/bash

echo "connect D8:AB:CB:77:F3:5E 2" > /sys/kernel/debug/bluetooth/6lowpan_control
python3 server.py
# nc -ul -6 12345