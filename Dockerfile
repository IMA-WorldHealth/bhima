# define base image
FROM node:lts

# ENV NODE_ENV=production
ENV YARN_VERSION 1.22.17
RUN yarn policies set-version $YARN_VERSION

# define working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json file to the project directory
COPY package.json .
COPY yarn.lock .
COPY .env .

# install all the dependencies
RUN yarn --frozen-lockfile

# Copy all the source code from host machine to the container project directory
COPY . .

RUN yarn build

COPY .env bin/

# change directory to the bin diretory
WORKDIR /usr/src/app/bin/

# define the start up command of the container to run the server
CMD ["node", "server/app.js"]

# ensure this container runs as the user "node"
USER node
