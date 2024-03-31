################## First Stage - Creating base #########################

# Created a variable to hold our node base image
ARG NODE_IMAGE=node:21-alpine

# Using the variable to create our base image
FROM $NODE_IMAGE AS base

# Running a command to install dumb-init to handle processes
RUN apk --no-cache add dumb-init

# Creating folders and changing ownerships
RUN mkdir -p /home/node/app && chown node:node /home/node/app

# Setting the working directory
WORKDIR /home/node/app

# Changing the current active user to "node"
USER node

# Creating a new folder "tmp"
RUN mkdir tmp

################## Second Stage - Installing dependencies ##########

# In this stage, we will start installing dependencies
FROM base AS dependencies

# We copy all package.* files to the working directory
COPY --chown=node:node ./package*.json .

# We run NPM CI to install the exact versions of dependencies
RUN npm ci

# Lastly, we copy all the files with active user
COPY --chown=node:node . .

################## Third Stage - Building Stage #####################

# In this stage, we will start building dependencies
FROM dependencies AS build


# We run "node ace build" to build the app for production
RUN node ace build


################## Final Stage - Production #########################

# In this final stage, we will start running the application
FROM base AS production

ENV APP_KEY=key_default
ENV NODE_ENV=production
ENV DB_USER=test
ENV DB_PASSWORD=test
ENV DB_DATABASE=kaderisasi_development
ENV SMTP_USERNAME=test@salmanitb.com
ENV SMTP_PASSWORD=test
ENV DB_HOST=test

ENV TZ=Asia/Jakarta
ENV PORT=3333
ENV HOST=0.0.0.0
ENV LOG_LEVEL=info
ENV DB_PORT=5432
ENV SMTP_HOST=smtp.gmail.com
ENV SMTP_PORT=465
ENV REDIRECT_URL=www.google.com
ENV SESSION_DRIVER=cookie
ENV RESET_PASSWORD_URL=kaderisasi.salmanitb.com/reset-password
ENV MAIL_FROM=digilab@salmanitb.com

# Copy files to the working directory from the build folder the user
COPY --chown=node:node --from=build /home/node/app/build .

# We run NPM CI to install the exact versions of dependencies
RUN npm ci --omit="dev" --ignore-scripts

# Expose port
EXPOSE 3333

# Run the command to start the server using "dumb-init"
CMD [ "dumb-init", "node", "./bin/server.js" ]