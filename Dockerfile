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

ENV TZ=Asia/Jakarta
ENV PORT=3334
ENV HOST=127.0.0.1
ENV LOG_LEVEL=info
ENV APP_KEY=y5Fs4gJ4MbkVB7p-Fcz2JD6Pm_Cofr3a
ENV NODE_ENV=production
ENV DB_HOST=103.30.195.162
ENV DB_PORT=5432
ENV DB_USER=wadmin
ENV DB_PASSWORD=8bJBMg7T2IfP
ENV DB_DATABASE=kaderisasi_development
ENV REDIRECT_URL=www.google.com
ENV SESSION_DRIVER=cookie
ENV SMTP_HOST=smtp.gmail.com
ENV SMTP_PORT=465
ENV SMTP_USERNAME=digilab@salmanitb.com
ENV SMTP_PASSWORD=uiwhzihkupqjfsqi
ENV RESET_PASSWORD_URL=kaderisasi.salmanitb.com/reset-password
ENV MAIL_FROM=digilab@salmanitb.com

# Copy files to the working directory from the build folder the user
COPY --chown=node:node --from=build /home/node/app/build .

# We run NPM CI to install the exact versions of dependencies
RUN npm ci --omit="dev"

# Expose port
EXPOSE 3334

# Run the command to start the server using "dumb-init"
CMD [ "dumb-init", "node", "./bin/server.js" ]