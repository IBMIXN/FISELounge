# IBM FISE Lounge - an interactive and privacy safe video-calling platform for those in social isolation

> IBM FISE Lounge is an application that acts as a smart and interactive video-calling platform for the elderly and others to use in the current pandemic, and other situations where social isolation is a major issue. It provides a simple interface with a standalone dashboard for more tech-savvy relatives to set up the Lounge app and preferences on the elderly relative's behalf.
>
> The application is a part of the integrated [FISE Ecosystem](link) that includes [FISE AskBob](https://github.com/UCL-COMP0016-2020-Team-39/AskBob) and [FISE Concierge](link).

![alt text](docs/img/Multidevice.png)

## Key Features:
1. Privacy. IBM Watson or FISE AskBob
2. Emergency messages via sms
3. Extendable through plugins
4. Interactive through 360 VR backgrounds

## Contributors:

This project has been developed by a group of students at University College London, supervised by Dr Dean Mohamedally (UCL) and John McNamara (IBM)

- Daniel Javadinejad (UCL)
- Radu Echim (UCL)
- Adam Piwowarczyk (UCL)
- Jeremy Lo Ying Ping (UCL)
- Jiaruo Gao (UCL)
- Ak Ihoeghinlan (UCL)
- Calin Hadarean (UCL)
- Adam Peace (UCL)
- Emil Almazov (UCL)
- Rikaz Rameez (UCL)
- Mohammad Syed (UCL)
- Ernest Nkansah-Badu (UCL)

## Project Structure

This repository contains both the web app for FISE (in [`/app`](app)) as well as the dashboard and API (in [`/server`](server)).
# Installation

## Docker Installation
We recommend that you to use docker for any local deployment and usage (reformulate). [explain why here... other FISE, mongodb etc.]. If you're on a Windows device we have provided a batch file that will get everything (both app and server) up and running with one-click. You can find our guide on how to install and deploy docker [here](LINK_TO_DOCKER_README)


##  Server Installation
Note: Our documentation uses yarn commands, but npm will also work. You can compare yarn and npm commands in the yarn docs, [here](https://classic.yarnpkg.com/en/docs/migrating-from-npm#toc-cli-commands-comparison).

Ensure you have `yarn` installed (or npm)

- `cd server`
- `yarn install`
- `cp .env.local.example .env.local` (This file should never be tracked, only the example)
- Fill in all the missing details in `server/.env.local`
- To begin development: `yarn dev`
- To build for production: `yarn build`
- To serve production build: `yarn start`

##  App Installation

Ensure you have `yarn` installed (or npm)

- `cd app`
- `yarn install`
- `cp .env.local.example .env.local` (This file should never be tracked, only the example)
- Fill in all the missing details in `app/.env.local`
- To begin development: `yarn dev`
- To build for production: `yarn build`
- To serve production build: `yarn start`

# Deployment
Note: There are many ways to deploy both the app and server, you are not restricted to using the services we mention. 
## Deploying the Server


Easiest way (local): Docker


Easiest way (cloud): Vercel

- Sign up / in to your Vercel account
- Create a new project
- Select "Import Git Repository" and import your copy of this repository.
- Select the server folder (you should see a Next JS logo by the folder)
- Add all env variables that are in `/server/.env.local.example`
- (NB: Adding `VERCEL_URL` will autopopulate based on whether the build is production or preview)

Otherwise (cloud): Azure, DigitalOcean, AWS, IBM Cloud etc.
## Deploying the App

Easiest way (local): Docker

Easiest way (cloud): Vercel

- Connect repo to Vercel
- Add all env variables that are in `/app/.env.local.example`

Otherwise (local):

- Follow the above instructions for _App Installation_ and expose port of choice

Otherwise (cloud): Azure and similiar

- Follow the above instructions for _App Installation_ and expose port of choice

# Server Documentation

## Overview

- Running on NextJS 9 (different to Express, look it up and be familiar with ES5/ES6 syntax)
- Auth handled by Passport
- Storage in MongoDB (Can easily set up using Atlas)
- All API routes at `localhost:3000/api/*`
- All dashboard pages at `localhost:3000/*`
- All API routes are "pages" in NextJS 9
- All pages are in `/server/pages`, with API routes in `/server/pages/api` and the file path from pages corresponding to the actual path

## Data Types

### User

- The actual account administrator
- They manage the _Consumer_'s FISE account and set it up on the _Consumer_'s device
- They can add mutiple *Consumer*s and add multiple *Contact*s per _Consumer_
- This is the only person who ever accesses the Dashboard

### Consumer

- The elderly person with difficulty contacting their relatives (example)
- This person's data will show up on the FISE app
- Can be related to multiple *Contact*s

### Contact

- Someone the _Consumer_ can call
- Will receive an email when called through the app
- Will receive an email containing emergency voice-clip when sent through the app

If phone number provided:

- Will receive an sms when called through the app
- Will receive an sms containing emergency voice-clip when sent through the app

# App Documentation


# Server API Routes

## `/api/login`

### POST

Parameters:

- email
- password

## `/api/logout`

### POST

Parameters: None

## `/api/signup`

### POST

Parameters:

- email
- password
- name

## `/api/user`

### GET

Gets the current (based on session) user's data

## `/api/user/delete`

### DELETE

Revokes the current user's session

## `/api/consumer`

### POST

Create a new consumer

Paramaters:

- name
- isCloudEnabled
- isSnowEnabled
- isWatsonTtsEnabled

Success: returns {message: ..., data: consumer}

## `/api/consumer/:consumer_id`

### GET

Get the corresponding consumer data

Success: returns {message: ..., data: consumer}

### PUT

Update the corresponding consumer's data

Parameters:

- name
- isCloudEnabled
- isSnowEnabled
- isWatsonTtsEnabled

Success: returns {message: ..., data: consumer, consumer_id}

### DELETE

Delete the corresponding consumer

### POST

Refreshes one-time-code of the corresponding consumer

## `/api/contact`

### POST

Create a new contact

Parameters:

- consumer_id
- name
- email
- profileImage (should be `Base64` encoded)
- relation
- phone

Success: returns {message: ..., data: newContact}

## `/api/contact/:contact_id`

### GET

Get the corresponding contact data

Success: returns {
message: ...,
data:
contact,
consumer_id,
consumer_name,
}

### PUT

Update the corresponding contact's data

Parameters:

- [name]
- [email]
- profileImage (should be `Base64` encoded)
- [relation]
- phone

Success returns...

### DELETE

Delete the corresponding contact

## `/api/otc/:otc`

### GET

Get the corresponding consumer's data

### POST

Sends a call notification email to the desired contact

Parameters:

- contact_id

## `/api/otc/watson/:otc`

### POST

Parse audio through IBM Watson API

Parameters:

- `req.body` should be `Base64` encoded `audio/mp3`

## `/api/backgrounds/`

### POST

Adds corresponding background to consumer's backgrounds

Parameters:

- imageFile (should be `Base64` encoded or `URL` string)
- imageName
- isVR
- consumer_id

### DELETE

Deletes the corresponding background

Parameters:

- image_id
- consumer_id

# IBM Watson voice commands

## Setup

- Register an IBM Cloud account
- Create _Watson Assistant_, _Speech-To-Text_ and _Text-To-Speech_ resources
- Add service credentials for respective resource in server `.env.local`.
- For `WATSON_ASSISTANT_ID` only add key following ServiceId-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
- Launch Watson Assistant inside IBM Cloud
- Create _dialog skill_ by uploading `watson_skill.json` that you find in the  `/server` folder

## Valid commands
- Change background
- Call [contact]

If you want any other _custom_ commands, you can create them with Watson's dialogue......

# AskBob voice commands

## Setup

- Follow AskBob's installation guide [here](https://github.com/UCL-COMP0016-2020-Team-39/AskBob) or use above mentioned docker instalaltion
- Ensure that the required deepspeech models are downloaded
- Add the AskBob instance URL in `app/.env.local`
- AskBob supports a rich set of plugins for custom commands,

## Valid commands (update phrasing)

### Default

- Change background
- Call [contact]

### FISE Concierge Utilities

- What's the weather at different locations
- What's the air quality at different locations
- What's the defintion of words
- What's the synonym of words

### FISE Concierge Food
- Tell me a recipe for certain food
- Tell me a recipe by ingredient
- Tell me random recipe

### FISE Concierge Food
- Value of a stock
- Charities in a location

### FISE Concierge Food
- Value of a stock
- Charities in a location

# Plugins

(IMAGE)

FISE Lounge has support for custom plugins and apps that can be loaded through an iframe. This includes most web-apps, videos, HTML5 apps. `app/public/plugins.html` `app/components/pluginComponent`.

As a template the `plugins.html` renders a white page with a list of free games, coronavirus advice, and a live BBC news feed.
