FROM node:alpine
WORKDIR /usr/src/app

COPY package*.json ./

ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN npm install --only=production

COPY . .

EXPOSE 8085