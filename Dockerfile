FROM node:21.1.0-slim

WORKDIR /microservice_user

ENV NODE_ENV=development
ENV PORT=8080
ENV DB_PORT=3306
ENV DB_NAME=micro_user
ENV DB_USER=admin

COPY package.json ./
COPY package-lock.json ./ 

RUN npm install

COPY . .

RUN npm run tsc

# Elimina las dependencias de desarrollo para producción
#RUN npm prune --production

ENV NODE_ENV=production

RUN npm install -g pm2

EXPOSE $PORT

CMD ["npm", "run", "start"]

