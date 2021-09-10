# syntax=docker/dockerfile:1.3
FROM node:14-alpine3.13 as dependencies

# CI
ARG CI
ENV CI=${CI:-1}

RUN apk update && apk add --no-cache git openjdk8

# make the 'app' folder the current working directory
WORKDIR /app

COPY package.json yarn.lock /app/

ENV JAVA_HOME=/usr/lib/jvm/java-1.8-openjdk
ENV PATH="$JAVA_HOME/bin:${PATH}"

# install project and build
RUN CYPRESS_INSTALL_BINARY=0 yarn install && yarn cache clean


# build stage
FROM node:14-alpine3.13 as build

WORKDIR /app

# CI/General
ARG CI
ENV CI=${CI:-1}
ENV CYPRESS_INSTALL_BINARY 0
# Stage Specific Args
ARG VUE_APP_API_BASE_URL
ARG VUE_APP_BASE_URL
ARG VUE_APP_WS_URL
ARG VUE_APP_STAGE
ARG VUE_APP_AWS_CCP_URL
ARG VUE_APP_CCP_INSTANCE
ARG VUE_APP_PORTAL_KEY
ARG NODE_ENV
# Stage Env
ENV VUE_APP_API_BASE_URL=${VUE_APP_API_BASE_URL}
ENV VUE_APP_BASE_URL=${VUE_APP_BASE_URL}
ENV VUE_APP_WS_URL=${VUE_APP_WS_URL}
ENV VUE_APP_STAGE=${VUE_APP_STAGE}
ENV VUE_APP_AWS_CCP_URL=${VUE_APP_AWS_CCP_URL}
ENV VUE_APP_CCP_INSTANCE=${VUE_APP_CCP_INSTANCE}
ENV VUE_APP_PORTAL_KEY=${VUE_APP_PORTAL_KEY:-crisiscleanup_us}
ENV NODE_ENV=${NODE_ENV:-production}
# Secrets Args
ARG VUE_APP_WHAT_3_WORDS_API_KEY
ARG VUE_APP_GOOGLE_MAPS_API_KEY
ARG VUE_APP_PITNEYBOWES_API_KEY
ARG VUE_APP_PITNEYBOWES_BASIC_AUTH_TOKEN
ARG SENTRY_DSN
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_PROPERTIES
# Secrets env
ENV VUE_APP_WHAT_3_WORDS_API_KEY=${VUE_APP_WHAT_3_WORDS_API_KEY}
ENV VUE_APP_GOOGLE_MAPS_API_KEY=${VUE_APP_GOOGLE_MAPS_API_KEY}
ENV VUE_APP_PITNEYBOWES_API_KEY=${VUE_APP_PITNEYBOWES_API_KEY}
ENV VUE_APP_PITNEYBOWES_BASIC_AUTH_TOKEN=${VUE_APP_PITNEYBOWES_BASIC_AUTH_TOKEN}
ENV SENTRY_DSN=${SENTRY_DSN}
ENV SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}
ENV SENTRY_PROPERTIES=${SENTRY_PROPERTIES:-"sentry.properties"}

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN yarn build --mode=${VUE_APP_STAGE}


# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
