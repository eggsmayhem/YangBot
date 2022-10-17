# Yangbot

Based on foundation https://github.com/fireship-io/gpt3-twitter-bot by codediodeio

Here he is in all his glory:

https://twitter.com/Yangbot4


## Setting up the bot 
Original tutorial can be found at https://www.youtube.com/watch?v=V7LEihbOv3Y, on Fireship’s official Youtube channel. I have made a few minor modifications and run through some debugging, but their tutorial is also highly recommended. 

Twitter tokens:
https://medium.com/geekculture/how-to-create-multiple-bots-with-a-single-twitter-developer-account-529eaba6a576

https://developer.twitter.com/en/docs/authentication/oauth-1-0a/obtaining-user-access-tokens

Twitter bot with firebase / OAuth 2.0 / 3-legged OAuth flow 

### Creating the Accounts You Will Need 

Make a new twitter account for the bot by signing up for a new twitter profile, assuming you do not want to send these automated tweets from your real account. Unlike some other sites, making a “sock” account on twitter is easy, as you can make an account with an E-mail address, and a phone number is not required. 

Another feature I love about twitter is that you can change your name/handle, which can come in handy when you are experimenting with what your bot’s final concept will be. 

Sign up for a free [Firebase](https://firebase.google.com/) account. We will be using a Firebase database to store the Authentication tokens that enable us to interact with Twitter and GPT-3’s APIs.  

Sign up for a [Twitter Developer Account](https://developer.twitter.com/). Unlinke with regular accounts, Twitter’s policy is that each individual should have only one account, and the creation of a Developer Account is tied to a phone number. For this reason, I will show you how to use your Developer Account credentials with multiple user accounts.

Setting up your firebase/npm/Google environment 
On your local machine, create a new directory (say, TwitterBot) and open the terminal from that location. *Important note* 
Unfortunately, some of the functions for firebase have bugs in Git Bash, so you will need to see a different terminal (such as Windows terminal) for this project.

In the terminal, run 
```
firebase login
```

run
```
firebase init functions
```

Select y to proceed. Select “Create a new project”

Give the project a project ID (you can pick anything) and name. The terminal will then create a Google Cloud platform project and add firebase to your project.

Select your language (JS or Typescript), decide if you want to use a linter (it doesn’t matter). Select yes to instal npm dependencies. You may get some non-critical errors here, but they are unlikely to be a problem. 


This will create a functions directory and  install the sdks that will enable us to interact with both twitter and openai  with the following commands
```
cd functions/
npm i twitter-api-v2 openai
```
Feel free to check out the full source code here (link), keeping in mind that we are really only changing the index.js code, as I take you through the steps in the code to get you set up. 

(next step would be 3:46 at https://www.youtube.com/watch?v=V7LEihbOv3Y, which is using firebase serve to get the callback URL to provide to the twitter admin portal). (For now I’m skipping to 3-legged 0Auth, there isn’t too much more between them anyway). 


### Getting Your Twitter Credentials Ready / 3-legged OAuth flow 
Order wise: you create project, enable both OAuths, then generate callback url in firebase, THEN you regenerate and copy your keys 
In you Twitter Developer Accountl, create a new project, then create a new app. (If you want to create multiple apps, you might need to apply for Elevated Status. This is potentially free pending a 48 hour review by Twitter of a brief application describing your use-case). 

You will see a screen that says Here are your keys & tokens with three secrets. Copy these and paste them somewhere for now. The top two (the “API Key” and the “API Key Secret” are what is known as your “Consumer Keys”. 

Navigate to your “User Authentication Settings” and toggle on OAuth2.0 and OAuth1.0. Select the type of app (likely “automatic app or bot”). Set the App permissions to Read and Write. 

## Running the Bot
```
cd into functions
run firebase serve
open the "tweet" URL in the browser where you authenticated the bot 
```