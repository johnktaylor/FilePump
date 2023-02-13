FROM node:18
COPY ./ /home/node/
RUN mkdir /inputfiles
WORKDIR /home/node/
RUN npm install
ENTRYPOINT node index.js