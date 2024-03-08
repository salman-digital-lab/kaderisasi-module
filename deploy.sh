#!/bin/sh
npm run build

cd build 
npm ci --omit="dev"

cp ../.env ./.env

pm2 restart kaderisasi-module