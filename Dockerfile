# define base image
FROM node:lts-slim

# download all the missing dependencies for chromium, plus chromium itself
RUN apt-get update && apt-get install -y \
  ca-certificates fonts-liberation gconf-service \
  libappindicator1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2  \
  libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libgconf-2-4 \
  libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 \
  libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
  libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
  libxss1 libxtst6 lsb-release libxshmfence1 chromium -y

# ENV NODE_ENV=production
ENV YARN_VERSION 1.22.17
#ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD 1
RUN yarn policies set-version $YARN_VERSION
#ENV CHROME_BIN /usr/bin/chromium
#ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium

# define working directory inside the container
WORKDIR /usr/src/app

# Copy all the source code from host machine to the container project directory
COPY . .

# install all the dependencies
RUN yarn --frozen-lockfile && yarn build

# yarn build creates the bin/ folder
COPY .env bin/

# change directory to the bin diretory
WORKDIR /usr/src/app/bin/

# make sure the node user is the owner of all the underlying files.
RUN chown -R node:node *

# ensure this container runs as the user "node"
USER node

# define the start up command of the container to run the server
CMD ["node", "server/app.js"]
