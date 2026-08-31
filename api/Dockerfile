FROM node:22-alpine

WORKDIR /app/api

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts && npm run start:prod"]
