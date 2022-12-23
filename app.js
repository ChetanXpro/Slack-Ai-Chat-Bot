require("dotenv").config();
const { RTMClient } = require("@slack/rtm-api");
const { WebClient } = require("@slack/web-api");

const rtm = new RTMClient(
  process.env.RTM_CLIENT
);
const web = new WebClient(
  process.env.WEB_CLIENT
);
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.API,
});
const openai = new OpenAIApi(configuration);

const generateText = async (slackText) => {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: slackText,
      temperature: 0,
      max_tokens: 1000,
    });
    console.log(response.data.choices[0].text);
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
 
  if (event?.username !== "Techno bott" && event?.type !== "pong") {
    if (event.type !== "user_typing") {
      if (event?.text) console.log(event?.text);

      if (event?.text) {
        const response = await generateText(event?.text);
        if(response && !response.startsWith('#'))  sendMsg("#botspam", response);
       
      }
    }
  }
});

const sendMsg = async (slackChannel, msg) => {
  await web.chat.postMessage({
    channel: slackChannel,
    text: msg,
  });
};


