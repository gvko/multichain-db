FROM multichain:latest

WORKDIR /multichain

ADD startup.sh .

#RUN ["sh", "-c", "multichaind esmiley@172.20.0.2:4000 -rpcallowip=0.0.0.0/0"]
ENTRYPOINT ["./startup.sh"]

