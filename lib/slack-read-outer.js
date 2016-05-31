'use strict';

const OpenJTalk = require('openjtalk');
const Sound = require('node-aplay');
const RtmClient = require('slack-client').RtmClient;
const RTM_EVENTS = require('slack-client').RTM_EVENTS;
const RTM_CLIENT_EVENTS = require('slack-client').CLIENT_EVENTS.RTM;

const util = require('util');
const fs = require('fs');

const CONFIG_PATH = '../conf/setting.json';
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

const SLACK_API_TOKEN = config.botToken;
const BOT_USER_ID = config.botUserId;

const MEI_VOICE_PATH = '/usr/share/hts-voice/mei/mei_happy.htsvoice';
const NOTIFICATION_SOUND_PATH = '../sound/se_soc08.wav';
const notification = new Sound(NOTIFICATION_SOUND_PATH);

const SLACK_CHANNEL_ID = config.channelId;
const START_MESSAGE = 'botを起動しました。';
const END_MESSAGE = 'botを終了しました。';

const mei = new OpenJTalk({
  htsvoice: MEI_VOICE_PATH,
  pitch: 300
});

const rtm = new RtmClient(SLACK_API_TOKEN);

const readout = (text) => {

  if (!text) return;

  console.log('read out :' + text);

  const playNotificationSound = () => {
    return new Promise((resolve, reject) => {
      console.log('before playNotificationSound');
      notification.play();
      notification.on('complete', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  const talk = (text) => {
    return new Promise((resolve, reject) => {
      console.log('before talk');
      mei.talk(text, (err) => {
        if (err) {
          console.log('error talk');
          reject(err);
        } else {
          console.log('after talk');
          resolve();
        }
      });
    });
  };

  playNotificationSound()
    .then(talk(text))
    .catch((err) => {
      console.error(err);
    });
};

const finalize = () => {
  rtm.sendMessage(END_MESSAGE, SLACK_CHANNEL_ID);
  console.log('exit program.');
  process.exit();
};

const start = () => {
  readout('開始しました。');
  rtm.start();

  rtm.on(RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED, () => {
    console.log('before send message');
    rtm.sendMessage(START_MESSAGE, SLACK_CHANNEL_ID, (err) => {
      if (err) console.error(err);
    });
    console.log('after send message');
  });

  rtm.on(RTM_EVENTS.MESSAGE, (message) => {
    if (!message) return;

    console.log('received message')
    console.log(util.inspect(message, false, null));

    if (message.user && message.user !== BOT_USER_ID || message.username) {
      const text = message.text || message.attachments[0].text
      rtm.sendMessage('メッセージ受信:' + text, SLACK_CHANNEL_ID, (err) => {
        if (err) console.error(err);
      });
      readout(text);
    }
  });
};

module.exports.start = start;
module.exports.finalize = finalize;

