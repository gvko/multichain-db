#!/bin/bash

# the ENV environmental variable must be configured in docker-compose.yml on the local machine
if [ "$ENV" == "dev_local" ]; then
  source ./multichain-startup.sh && npm run start-nodemon
else
  source ./multichain-startup.sh && node ./index.js
fi
