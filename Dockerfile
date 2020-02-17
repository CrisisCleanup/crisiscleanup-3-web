FROM node:lts-alpine

# setup env
ENV CYPRESS_INSTALL_BINARY 0

# make the 'app' folder the current working directory
WORKDIR /app

COPY package*.json ./

# install project dependencies leaving out dev dependencies
RUN yarn install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

CMD [ "yarn", "run", "serve"]
