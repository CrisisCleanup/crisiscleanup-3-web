FROM node:lts-alpine

# make the 'app' folder the current working directory
WORKDIR /app

COPY package*.json ./

# install project dependencies leaving out dev dependencies
RUN npm install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

CMD [ "npm", "run", "deploy-staging"]
