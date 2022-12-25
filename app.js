require("dotenv").config();
const { RTMClient } = require("@slack/rtm-api");
const { WebClient } = require("@slack/web-api");
const express = require('express');

const app = express()


const rtm = new RTMClient(process.env.RTM_CLIENT);
const web = new WebClient(process.env.WEB_CLIENT);
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.API,
});
const openai = new OpenAIApi(configuration);

const generateText = async (slackText) => {
  try {
    
    if (slackText?.startsWith("#cmd")) {
      const newPrompt = slackText.replace("#cmd", "").trim();
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `write a command to ${newPrompt}`,
        temperature: 0,

        max_tokens: 200,
      });

      return response.data.choices[0].text;
    }
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: slackText,
      temperature: 0,
      max_tokens: 1000,
    });

    return response.data.choices[0].text;
  } catch (error) {
    console.log(error);
  }
};

rtm.start().catch(console.error);



rtm.on("ready", async () => {
  console.log("bot started");
});

rtm.on("slack_event", async (eventType, event) => {

  if (event?.username !== "Open AI" && event?.type !== "pong") {
    if (event.type !== "user_typing") {
      

      if (event?.text) {
        rtm.sendTyping(event.channel)
        const response = await generateText(event?.text);


        if (response) sendMsg(event.channel, response);
      }
    }
  }
});

const sendMsg = async (slackChannel, msg) => {
  await web.chat.postMessage({
    channel: slackChannel,
    username: "Open AI",
    text: msg,
  });
  // await web.chat.meMessage({

  //   text:msg
  // })
};



app.listen(5000,()=>{
  console.log(`Server running on port ${5000}`)
})