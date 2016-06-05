'use strict';

const Sound = require('node-aplay');
const RtmClient = require('slack-client').RtmClient;
const RTM_EVENTS = require('slack-client').RTM_EVENTS;
const RTM_CLIENT_EVENTS = require('slack-client').CLIENT_EVENTS.RTM;

const util = require('util');
const fs = require('fs');

const CONFIG_PATH = './conf/setting.json';
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

const SLACK_API_TOKEN = config.botToken;
const BOT_USER_ID = config.botUserId;

const MEI_VOICE_PATH = '/usr/share/hts-voice/mei/mei_happy.htsvoice';
const NOTIFICATION_SOUND_PATH = '../sound/se_soc08.wav';
const notification = new Sound(NOTIFICATION_SOUND_PATH);

const SLACK_CHANNEL_ID = config.channelId;
const START_MESSAGE = 'botを起動しました。';
const END_MESSAGE = 'botを終了しました。';

const Speaker = require('speaker');
const OpenJTalk = require('node-openjtalk').OpenJTalk;

const open_jtalk = new OpenJTalk({
  voice: OpenJTalk.voices.mei_normal
});

const rtm = new RtmClient(SLACK_API_TOKEN);

const readout = (text) => {

  const synthesize = () => {
    console.log('before sythesize');
    open_jtalk.synthesize(text, (err, buffer) => {
      if (err) return;
      var file = fs.openSync(path.join(WAV_TEMP_DIR, Date.noew() + '.wav'), 'w');
      fs.writeSync(file, buffer, 0, buffer.length, null, (error, written, buffer) => {
        if (err) return;
        fs.closeSync(file);
        return synthesizedPath;
      });
    });
  };

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

  const talk = (synthesizePath) => {
    return new Promise((resolve, reject) => {
      console.log('before talk');

      const voice = new Sound(synthesizePath);
      voice.play();
      voice.on('complete', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  if (!text) return;

  console.log('read out :' + text);

  const synthesizePath = synthesize(text);
  if (!synthesizePath) {
    console.error('can\'t synthesize');
    finalize();
  }

  playNotificationSound()
    .then(talk(synthesizePath))
    .catch((err) => {
      console.error(err);
      finalize();
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

