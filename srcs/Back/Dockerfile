# Alex 
# Utilisez une image de base Node.js 14
FROM node:lts-alpine

# FROM debian:latest

# RUN apt-get update && apt-get install -y apt-utils
# RUN apt-get remove --purge -y nodejs
# RUN apt-get update && apt-get install -y nodejs npm

# Define the working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app/api

# Install NestJS CLI globally
# RUN npm install -g @nestjs/cli

# Copiez les fichiers package.json et package-lock.json
# COPY ./project/api/package.json ./

# COPY ./project/api/yarn.lock ./

# RUN test -f package.json && yarn install

# RUN npm install --legacy-peer-deps && npm install -g prisma
# RUN yarn install && yarn global add prisma && yarn add class-validator argon2 @nestjs/passport passport passport-local


#I use prisma, so npm install prisma and npx prisma migrate dev and I did the npx prisma init to have my schema.prisma and .env 

# Copiez tous les autres fichiers
COPY ./project/api ./

RUN npm install

# Exposez le port 3000
EXPOSE 4000

# Démarrez l'application
CMD ["npm", "run", "start:dev" ]

#ALEx

# # Utilisez une image de base Node.js 14
# FROM node:lts-alpine

# # FROM debian:latest

# # RUN apt-get update && apt-get install -y apt-utils
# # RUN apt-get remove --purge -y nodejs
# # RUN apt-get update && apt-get install -y nodejs npm

# # Define the working directory
# RUN mkdir -p /usr/src/app
# WORKDIR /usr/src/app/api

# # Install NestJS CLI globally
# RUN npm install -g @nestjs/cli

# # Copiez les fichiers package.json et package-lock.json
# COPY ./project/api/package.json ./

# COPY ./project/api/yarn.lock ./

# # RUN test -f package.json && yarn install

# RUN npm install --legacy-peer-deps && npm install -g prisma
# # RUN yarn install && yarn global add prisma && yarn add class-validator argon2 @nestjs/passport passport passport-local


# #I use prisma, so npm install prisma and npx prisma migrate dev and I did the npx prisma init to have my schema.prisma and .env 

# # Copiez tous les autres fichiers
# COPY ./project ./

# # Exposez le port 3000
# EXPOSE 4000

# # Démarrez l'application
# # CMD [ "npm", "run", "start:dev" ]




