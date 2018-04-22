FROM multichain-and-nodejs:latest

# Add the front-service app source files
WORKDIR /app

ADD ./front-service/app /app

ADD startup.sh /app

ENTRYPOINT ["./startup.sh"]
#CMD ["sh", "-c", "pwd ; ls -a"]

