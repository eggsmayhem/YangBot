require('dotenv').config()
const dotenv = require('dotenv')
const axios = require('axios');


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

  //newsAPI key variable 
  const newskey = process.env.NEWS_API_KEY

  exports.tweet = functions.https.onRequest(async (request, response) => {
    const { refreshToken } = (await dbRef.get()).data();
  
    const {
      client: refreshedClient,
      accessToken,
      refreshToken: newRefreshToken,
    } = await twitterClient.refreshOAuth2Token(refreshToken);
  
    await dbRef.set({ accessToken, refreshToken: newRefreshToken });

    //extract top headline from newsAPI 
    const theNews = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${newskey}`)
    console.log(theNews.data.articles.length)
    // const rand = 
    // console.log(rand)
    //newsAPIs 'totalResults' amount does not seem to always be accurate. Sometimes there are fewer results the claimed. 
    const resultsAmount = Math.floor(Math.random() * theNews.data.articles.length)
    // const resultsAmount = await theNews.data.length
    
    const articleNum = Math.floor(Math.random() * resultsAmount)
    console.log(resultsAmount)
    console.log(articleNum)
    const newsArray = [theNews.data.articles[0].title, theNews.data.articles[0].description]
    //put news variable into openAPI
    console.log(newsArray)
    //origina prompt was 'tweet about (prompt) in the voice of politician Andrew Yang, and tbh the results were a bit better
    const nextTweet = await openai.createCompletion({
      model: "text-davinci-001",
      prompt: `Write a tweet from an AI disguised a politician. The AI is pretending to be human, and doing a bad job at that in a way that is unsettling and funny. The topic of the tweet is the following news story.
      
      prompt: ${newsArray[0]}, ${newsArray[1]}`,
      max_tokens: 64,
  });
    console.log(nextTweet)
    const { data } = await refreshedClient.v2.tweet(
      nextTweet.data.choices[0].text.replaceAll('"',"")
      // nextTweet.data.choices[0].text.toString().replaceAll('"', "")
    );

    console.log(typeof data)
    response.send(data);
    //test without tweeting
    // console.log(nextTweet.data.choices[0].text);
  });

