FROM node:18-alpine

WORKDIR /app

COPY . .

ENV PORT=8080
ENV HOST=0.0.0.0

RUN npm ci
RUN npm run build

CMD ["npm", "start"] 