#!/bin/bash

CURRENT_NODE_ADDRESS=""
RES=""
CURRENT_NODE_IP=""

function get_ip_from_seeder() {
  echo
  echo "*** Getting IP from IP-seeder..."

  RES=$(curl -s -X GET ip-seeder:3000/ip/get)

  echo "*** IP: $RES"
}

function check_ip_with_seeder() {
  echo
  echo "*** Checking IP '$1' with the IP-seeder..."

  curl -s -X GET ip-seeder:3000/ip/check?ip="$1"
}

function publish_ip_to_seeder() {
  echo
  echo "*** Publishing current node's IP ($CURRENT_NODE_IP) to the IP-seeder..."

  curl -H "Content-Type: application/json" -X POST \
  -d '{"ip": "'"$CURRENT_NODE_IP"'"}' \
  ip-seeder:3000/ip/publish
}

function connect_to_existing_blockchain() {
  echo
  echo "*** Connecting to existing blockchain '$BLOCKCHAIN_NAME' at $PARENT_NODE_HOST:$PARENT_NODE_PORT"

  CURRENT_NODE_ADDRESS=$(multichaind esmiley@$PARENT_NODE_HOST:$PARENT_NODE_PORT | grep 'connect,send,receive' | sed -e 's/.*grant \(.*\) connect.*/\1/')
}

function create_new_blockchain() {
  echo
  echo "*** Creating a new blockchain: $BLOCKCHAIN_NAME"

  multichain-util create $BLOCKCHAIN_NAME \
  -default-network-port=$NODE_PORT \
  -default-rpc-port=$NODE_PORT_RPC \
  -anyone-can-create=true \
  -anyone-can-receive=true \
  -anyone-can-send=true \
  -anyone-can-activate=true
}

function start_blockchain_foreground() {
  echo
  echo "*** Starting blockchain node (foreground process)..."

  # do NOT use `-daemon`, because we want the process to be running on foreground, so that the Docker container also runs
  multichaind $BLOCKCHAIN_NAME -rpcallowip=0.0.0.0/0
}

function start_blockchain_background() {
  echo
  echo "*** Starting blockchain node (background process)..."

  multichaind $BLOCKCHAIN_NAME -rpcallowip=0.0.0.0/0 -daemon

  export LAUNCH_SERVICE=true
}

function stop_blockchain() {
  echo
  echo "*** Stopping blockchain node..."

  multichain-cli $BLOCKCHAIN_NAME stop

  echo "*** Node stopped."
}

function update_rpc_credentials() {
  echo
  echo "*** Updating RPC API credentials config for '$BLOCKCHAIN_NAME'"

  sed -i '2s/.*/rpcpassword='$RPC_PASSWORD'/' /root/.multichain/$BLOCKCHAIN_NAME/multichain.conf
}

function grant_permissions_to_current_node() {
  echo
  echo "*** Tell the parent node to grant permissions to the current node..."
  echo "*** CURRENT_NODE_ADDRESS: $CURRENT_NODE_ADDRESS"

  curl --user $RPC_USERNAME:$RPC_PASSWORD \
  --data-binary '{"jsonrpc":"1.0", "id":"grant", "method":"grant", "params":["'"$CURRENT_NODE_ADDRESS"'", "connect,send,receive,mine,activate,create"]}' \
  -H "Content-Type: text/plain;" \
  http://$PARENT_NODE_HOST:$NODE_PORT_RPC
}

function get_current_node_ip() {
  echo
  echo "*** Getting the current node's IP..."

  CURRENT_NODE_IP=$(multichain-cli $BLOCKCHAIN_NAME getinfo | grep nodeaddress | grep -o -P '(?<=@).*(?=:40)')
  echo "*** NODE_HOST_IP: $CURRENT_NODE_IP"

  export NODE_HOST_IP=$CURRENT_NODE_IP # export it as env variable, so the Node.js service app can pick it up
}

# --------- Execution starts here ---------

# Check if the multichain blockchain node dir exists. If yes - start up the node and publish its IP to the seeder.
# If not, then it is a fresh container with no BC node config on it.
# Then get an IP of an existing node on the network from the IP-seeder.
# > If the response is "NO-IP", it means there are no IPs in the list, which means it's the first/root node in the
# chain. Therefore:
# --> Create a new blockchain configuration
# --> Start it in the background, so we can issue a command to stop it (so we can update the RPC credentials)
# --> wait 2 seconds for it to start and then stop it
# --> Update the RPC credentials
# --> Start the node in the foreground
# --> Publish its IP to the IP-seeder
#
# > Otherwise the response should be an IP of an existing/parent node. Then:
# --> Connect to that parent node
# --> Grant permissions for the current node
# --> Then update the RPC credentials (the `multichain.conf` has been created already)
# --> Then start the node
# --> Publish its IP to the IP-seeder


BLOCKCHAIN_DIR="/root/.multichain/$BLOCKCHAIN_NAME"

if [ -d "$BLOCKCHAIN_DIR" ]; then
  echo "*** Current Blockchain node already set up."

  start_blockchain_background
  get_current_node_ip
  publish_ip_to_seeder
else
  echo "*** Current Blockchain node not set up yet."

  get_ip_from_seeder

  if [ $RES == "NO-IP" ]; then
    echo
    echo "*** No seed IPs registered yet. This is the root node of the Blockchain."

    create_new_blockchain
    start_blockchain_background
    sleep 2
    stop_blockchain
    sleep 2
    update_rpc_credentials
    start_blockchain_background
    get_current_node_ip
    publish_ip_to_seeder
  else
    echo
    echo "*** Root node IP provided: $RES"

    PARENT_NODE_HOST=$RES
    connect_to_existing_blockchain

    # If the node doesn't succeed at connecting to the parent node, we enter the while-loop
    THRESHOLD=3
    while [ -z "$CURRENT_NODE_ADDRESS" ]; do
      # If the IP list gets empty (because all IPs are of dead hosts) we don't want to handle here the scenario of
      # creating a new node because it will be root node with no data, which means a whole new Blockchain. That means
      # all has gone ape shit...

      if [[ $THRESHOLD -lt 1 ]]; then
        echo
        echo "*** Node could not connect to three different root nodes. Exiting..."

        export LAUNCH_SERVICE=false
        exit 1;
      fi

      check_ip_with_seeder $PARENT_NODE_HOST

      get_ip_from_seeder
      PARENT_NODE_HOST=$RES

      connect_to_existing_blockchain

      let THRESHOLD-=1
    done

    # The node successfully connected to a parent node, so proceed with initializing and starting up
    grant_permissions_to_current_node
    update_rpc_credentials
    start_blockchain_background
    get_current_node_ip
    publish_ip_to_seeder
  fi
fi