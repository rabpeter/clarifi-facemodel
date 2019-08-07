# Clarifai Face DEMO App

## This project finds faces in an image and overlays an emoji (or text) of your choice.

## Get the project set up

1. Go to the Clarifai website, sign up for an account and create a new application.
2. Copy your Client ID and copy it into the cId variable in secret.js
3. Copy your Client Secret and copy it into the cSec variable in secret.js
4. Run ```npm install```
5. For development run ```npm start```
6. Add ```secret.js``` to root folder and place ```export const API_KEY = 'your api key here'```
7. To create production build run ```npm build``` and got for ```dist``` folder. Open ```index.html``` in your favourite browser


*Note: Do not share your Client ID or Secret. The file secret.js is already included in the .gitignore file, meaning it will not be committed to your git repo.*
