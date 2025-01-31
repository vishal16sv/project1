FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Default port if not set by environment
ENV PORT=3000

# Expose the port that will be used
EXPOSE ${PORT}

CMD ["node", "start.js"]
