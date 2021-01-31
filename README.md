# IBM FISE Lounge

> IBM FISE Lounge is an application that acts as a smart, collaborative workout coach for the elderly to use in the current pandemic, where loneliness is becoming a major issue. It provides a simple interface with a standalone dashboard for more tech-savvy relatives to set up the Lounge app and preferences on the elderly relative's behalf.

## Contributors:

- Adam Peace (UCL) 
- Emil Almazov (UCL)
- Rikaz Rameez (UCL)
- Daniel Javadinejad (UCL)
- Radu Echim (UCL)
- Adam Piwowarczyk (UCL)
- Jeremy Lo Ying Ping (UCL)
- Felipe Jin Li (UCL)
- Ak Ihoeghinlan (UCL)

This repository contains both the web app for FISE (in `/app`) as well as the dashboard and API (in `/server`)

# Server Installation

Ensure you have `yarn` installed

- `cd server`
- `yarn install`
- `cp .env.local.example .env.local` (This file should never be tracked, only the example)
- Fill in all the missing details in `server/.env.local`
- To begin development: `yarn dev`
- To build for production: `yarn build`
- To serve production build: `yarn start`

# App Installation

Ensure you have `yarn` installed

- `cd app`
- `yarn install`
- `cp .env.local.example .env.local` (This file should never be tracked, only the example)
- Fill in all the missing details in `app/.env.local`
- To begin development: `yarn dev`
- To build for production: `yarn build`
- To serve production build: `yarn start`

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
- They manage the *Consumer*'s FISE account and set it up on the *Consumer*'s device
- They can add mutiple *Consumer*s and add multiple *Contact*s per *Consumer*
- This is the only person who ever accesses the Dashboard

### Consumer

- The elderly person with difficulty contacting their relatives
- This person's data will show up on the FISE app
- Can be related to multiple *Contact*s

### Contact

- Someone the *Consumer* can call
- Will receive an email when called through the app

## Deploying the Server

Easiest way: Vercel

- Connect repo to Vercel
- Add all env variables that are in `/server/.env.local.example`
- (NB: Adding `VERCEL_URL` will autopopulate based on whether the build is production or preview)

Otherwise: Server

- Follow the above instructions for *Server Installation* and expose port 3000

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

Success: returns {message: ..., data: consumer}

## `/api/consumer/:consumer_id`

### GET

Get the corresponding consumer data

### PUT

Update the corresponding consumer's data

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
- relation

## `/api/contact/:contact_id`

### GET

Get the corresponding contact data

### PUT

Update the corresponding contact's data

Parameters:

- [name]
- [email]
- [relation]

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
