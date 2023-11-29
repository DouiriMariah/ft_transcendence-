# Utilisez une image de base Node.js 14
FROM node:lts-alpine

# Définissez le répertoire de travail

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

# Installation de NestJS CLI globalement
COPY ./site/my-app/package.json ./

COPY ./site/my-app/yarn.lock ./

# Copiez les fichiers package.json et package-lock.json
RUN yarn install && yarn add create-react-app styled-components@latest react-router-dom package react-native react-transition-group react-scripts js-cookie react-verification-input
#I use prisma, so npm add prisma and npx prisma migrate dev and I did the npx prisma init to have my schema.prisma and .env 



# Copiez tous les autres fichiers
COPY ./site .

# Exposez le port 3000
EXPOSE 8000

# Démarrez l'application
CMD [ "yarn", "start" ]

# # Utilisez une image de base Node.js 14
# FROM node:lts-alpine

# # Définissez le répertoire de travail

# RUN mkdir -p /usr/src/app

# WORKDIR /usr/src/app

# # Installation de NestJS CLI globalement
# COPY ./site/my-app/package.json ./

# COPY ./site/my-app/yarn.lock ./

# # Copiez les fichiers package.json et package-lock.json
# RUN yarn install && yarn add create-react-app styled-components@latest react-router-dom package react-native react-transition-group react-scripts js-cookie react-verification-input
# #I use prisma, so npm add prisma and npx prisma migrate dev and I did the npx prisma init to have my schema.prisma and .env 



# # Copiez tous les autres fichiers
# COPY ./site .

# # Exposez le port 3000
# EXPOSE 8000

# # Démarrez l'application
# # CMD [ "npm", "start" ]
