#!/bin/bash

CURRENT_NODE_ADDRESS=""

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
  -default-rpc-port=$NODE_RPC_PORT \
  -anyone-can-create=true \
  -anyone-can-receive=true \
  -anyone-can-send=true \
  -anyone-can-activate=true
}

function start_blockchain_foreground(){
  echo
  echo "*** Starting blockchain node (FOREground process)..."

  # do NOT use `-daemon`, because we want the process to be running on foreground, so that the Docker container also runs
  multichaind $BLOCKCHAIN_NAME -rpcallowip=0.0.0.0/0

  #TODO: filter out the IP from the response of this command and assign it to an env var, so the Node.js app can connect to it
}

function start_blockchain_background(){
  echo
  echo "*** Starting blockchain node (BACKground process)..."

  multichaind $BLOCKCHAIN_NAME -rpcallowip=0.0.0.0/0 -daemon

  #TODO: filter out the IP from the response of this command and assign it to an env var, so the Node.js app can connect to it
}

function stop_blockchain(){
  echo
  echo "*** Stopping blockchain node..."

  multichain-cli $BLOCKCHAIN_NAME stop

  echo "*** Node stopped."
}

function update_rpc_credentials(){
  echo
  echo "*** Updating RPC API credentials config for '$BLOCKCHAIN_NAME'"

  sed -i '2s/.*/rpcpassword='$RPC_PASSWORD'/' /root/.multichain/$BLOCKCHAIN_NAME/multichain.conf
}

function grant_permissions_to_current_node(){
  echo
  echo "*** Tell the parent node to grant permissions to the current node: $CURRENT_NODE_ADDRESS"

  curl --user $RPC_USERNAME:$RPC_PASSWORD \
  --data-binary '{"jsonrpc":"1.0", "id":"grant", "method":"grant", "params":["'"$CURRENT_NODE_ADDRESS"'", "connect,send,receive,mine,activate,create"]}' \
  -H "Content-Type: text/plain;" \
  http://$PARENT_NODE_HOST:$NODE_RPC_PORT
}


# --------- Execution starts here ---------

# Try to start the BC node. If error, then it is a fresh container with no BC node config on it.
# Then try to connect to an existing node on the network.
# -> If the response contains the string "connect,send,receive" it means the parent node exists and we need to grant
# perms to the current node
# --> Grant permissions
# --> Then update the RPC credentials (the `multichain.conf` has been created already)
# --> Then start the node
# -> If not, then it's an error, which means it is the root (first ever) node of the BC.
# --> Then create the blockchain
# --> Start it in the background, so we can issue a command to stop it (so we can update the RPC credentials)
# --> wait 2 seconds for it to start and then stop it
# --> Update the RPC credentials
# --> Start the node in the foreground
start_blockchain_foreground || {

  connect_to_existing_blockchain

  if [ -z $CURRENT_NODE_ADDRESS ]; then
    create_new_blockchain
    start_blockchain_background
    sleep 2
    stop_blockchain
    sleep 2
    update_rpc_credentials
    start_blockchain_foreground
  else
    grant_permissions_to_current_node
    update_rpc_credentials
    start_blockchain_foreground
  fi
}
