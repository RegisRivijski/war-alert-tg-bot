FROM node:16-alpine
MAINTAINER "Artur Petrov petrov0397@gmail.com"

RUN apk --no-cache upgrade && \
    apk --no-cache add tzdata && \
    cp /usr/share/zoneinfo/Europe/Kiev /etc/localtime && \
    echo "Europe/Kiev" >  /etc/timezone

WORKDIR /app
COPY . .

RUN npm i -g modclean && \
    npm i && \
    modclean -r && \
    npm uninstall modclean

ENTRYPOINT ["npm", "run", "start"]
