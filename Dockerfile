FROM node:21.1.0-slim

WORKDIR /api

# Variables de entorno por defecto (pueden ser sobrescritas)
ENV NODE_ENV=production
ENV PORT=8080
ENV DB_PORT=3306
ENV DB_NAME=micro_user
ENV DB_USER=admin

# Copia los archivos de dependencias
COPY package.json ./


RUN pwd

# Instala TODAS las dependencias (incluye devDependencies para TypeScript)
RUN npm install

# Compila el proyecto TypeScript
RUN npx tsc

# Elimina las dependencias de desarrollo para producción
RUN npm prune --production

# Instala pm2 globalmente
RUN npm install -g pm2

# Copia el resto del código fuente (después de la compilación)
COPY . .

# Expone el puerto
EXPOSE $PORT

# Comando para iniciar la app con pm2
CMD ["npm", "start"]