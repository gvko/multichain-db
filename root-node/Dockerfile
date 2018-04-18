FROM multichain:latest

WORKDIR /multichain

ADD startup.sh .

#CMD ["sh", "-c", "multichain-util create esmiley -default-network-port=4000 -default-rpc-port=4001 -anyone-can-create=true -anyone-can-receive=true -anyone-can-send=true -anyone-can-activate=true ; multichaind esmiley -rpcallowip=0.0.0.0/0 -rpcpassword=asdf1234"]
ENTRYPOINT ["./startup.sh"]

