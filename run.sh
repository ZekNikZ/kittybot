#!/bin/sh

# Ensure we are up-to-date
git pull

# Install yarn
corepack enable

# Run program
yarn start