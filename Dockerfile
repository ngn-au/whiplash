# FROM node:16-alpine as build
# WORKDIR /app
# COPY package*.json /app/
# RUN npm install -g ionic
# RUN npm install
# RUN npm run-script build
FROM nginx:mainline-alpine
# COPY ./www /app/
RUN rm -rf /usr/share/nginx/html/*
COPY  /www /usr/share/nginx/html/
COPY default.conf /etc/nginx/conf.d
EXPOSE 80
# CMD [ "ls" ]