FROM node:22-alpine AS base
WORKDIR /app

COPY package.json ./
COPY tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/package.json
RUN npm install

COPY apps/api ./apps/api
WORKDIR /app/apps/api
RUN npm run build

EXPOSE 8080
CMD ["npm", "run", "start"]
