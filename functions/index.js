require('dotenv').config()
const dotenv = require('dotenv')


const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();

const dbRef = admin.firestore().doc('tokens/demo');

const TwitterApi = require('twitter-api-v2').default;
const twitterClient = new TwitterApi({

    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
});

const callbackURL = 'http://127.0.0.1:5000/yangbot2/us-central1/callback'

//OpenAI API init
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
  apiKey: process.env.OPEN_API_KEY,
});
const openai = new OpenAIApi(configuration);

exports.auth = functions.https.onRequest(async (request, response) => {
    const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
      callbackURL,
      { scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'] }
    );
  
    // store verifier
    await dbRef.set({ codeVerifier, state });
  
    response.redirect(url);
  });
  
  exports.callback = functions.https.onRequest(async (request, response) => {
    const { state, code } = request.query;
  
    const dbSnapshot = await dbRef.get();
    const { codeVerifier, state: storedState } = dbSnapshot.data();
  
    if (state !== storedState) {
      return response.status(400).send('Stored tokens do not match!');
    }
  
    const {
      client: loggedClient,
      accessToken,
      refreshToken,
    } = await twitterClient.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: callbackURL,
    });
  
    await dbRef.set({ accessToken, refreshToken });
  
    response.sendStatus(200);
  });

  exports.tweet = functions.https.onRequest(async (request, response) => {
    const { refreshToken } = (await dbRef.get()).data();
  
    const {
      client: refreshedClient,
      accessToken,
      refreshToken: newRefreshToken,
    } = await twitterClient.refreshOAuth2Token(refreshToken);
  
    await dbRef.set({ accessToken, refreshToken: newRefreshToken });
  
    const nextTweet = await openai.createCompletion({
      model: "text-davinci-001",
      prompt: 'tweet something that contains the words "the two-party system"',
      max_tokens: 64,
  });
  
    const { data } = await refreshedClient.v2.tweet(
      nextTweet.data.choices[0].text
    );


    response.send(data);
    //test without tweeting
    // console.log(nextTweet.data.choices[0].text);
  });

