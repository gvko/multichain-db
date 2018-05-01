#!/bin/bash

RES=$(curl -s -X GET ip-seeder:3000/get-node-ip)
if [ $RES == "NO-IP" ]; then
  echo "*** No IPs registered yet. Publish one..."

  curl -H "Content-Type: application/json" -X POST \
  -d '{"ip": "172.20.0.2"}' \
  ip-seeder:3000/publish-ip
else
  echo "*** Root node IP provided: $RES"
fi

