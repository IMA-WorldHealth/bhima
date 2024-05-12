FROM node:lts

# Install missing dependencies for chromium
# These are all needed to make sure the browser can properly render all
# the requiredd page
RUN apt-get update && apt-get install -y \
  ca-certificates fonts-liberation gconf-service \
  libappindicator1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2  \
  libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libgconf-2-4 \
  libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 \
  libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
  libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
  libxss1 libxtst6 lsb-release libxshmfence1 chromium -y \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy source code
COPY . .

# Install dependencies
RUN npm install && \
   NODE_ENV=production npm run build && \
   npm install --omit=dev

# Copy environment file to bin folder
COPY .env bin/

# Change directory to bin
WORKDIR /usr/src/app/bin/

# Set ownership
RUN chown -R node:node *

# Switch to non-root user
USER node

ENV NODE_ENV production

# Define startup command
CMD ["node", "server/app.js"]

