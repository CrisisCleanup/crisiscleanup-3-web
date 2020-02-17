FROM node:lts-alpine

# setup env
ENV CYPRESS_INSTALL_BINARY 0

# install simple http server for serving static content
RUN yarn global add http-server

# make the 'app' folder the current working directory
WORKDIR /app

# copy both 'package.json' and 'yarn.lock' (if available)
COPY package*.json ./
COPY *.lock ./

# install project dependencies leaving out dev dependencies
RUN CYPRESS_INSTALL_BINARY=0 yarn install

EXPOSE 8080
CMD [ "yarn", "run", "serve"]
