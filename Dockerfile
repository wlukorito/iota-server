FROM node:alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn install
COPY . .

EXPOSE 5001
CMD [ "yarn", "start" ]