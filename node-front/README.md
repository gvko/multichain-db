# Backend

## Getting Started

1. Make sure you have installed:
    * [Node.js & npm](https://nodesource.com/blog/installing-node-js-tutorial-using-nvm-on-mac-os-x-and-ubuntu/)
    * [Docker](https://docs.docker.com/install/)
    * [Postgres 9.6](http://lmgtfy.com/?q=install%20postgres) (don't forget to test that the `psql` command is running)

2. Create the private docker network: 
```bash
 docker network create challenges-network
```

3. Run the app:
```bash
npm start
```
