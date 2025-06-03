###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:lts-alpine As development

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

COPY --chown=node:node .env* ./

RUN npm i

COPY --chown=node:node . .

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:lts-alpine As build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

COPY --chown=node:node .env.production .env

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN npx prisma generate

ENV NODE_ENV=production

RUN npm run build

RUN npm i --only=production && npm cache clean --force

USER node

###################
# PRODUCTION
###################

FROM node:lts-alpine As production

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

COPY --chown=node:node --from=build /usr/src/app/.env.production .env

EXPOSE 3000

CMD [ "node", "dist/src/main.js" ]