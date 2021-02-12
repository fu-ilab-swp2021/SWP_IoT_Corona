FROM node:latest AS build

RUN mkdir /usr/share/builds/
WORKDIR /usr/share/builds/

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build

FROM nginx:1.17.1-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/share/builds/dist/cwa-scanner-webui /usr/share/nginx/html