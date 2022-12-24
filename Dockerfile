FROM node:16-alpine

WORKDIR /app
COPY package.json ./
COPY .npmrc ./

RUN npm install --omit=dev
RUN npm install pm2 --location=global

COPY . .
ENV REDIS_URL=redis://:14607589d7cac28b00d3f9b2e408173de32de727@jaga-redis:6379
ENV APP_ENV=production
ENV MONGO_URL=mongodb://jagaapp:086a54047267e2fbda59790815a66bab9b462019@jaga-mongo:27017/
ENV PORT=8080

EXPOSE 8080

CMD ["pm2-runtime", "index.js"]