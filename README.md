## slack-read-outer-bot

数あるslack botのうちの1つ。

これは、slackに投稿したメッセージを読み上げる  
(スピーカーから出力する)  
というbotです。

## dependency

以下ライブラリを利用しています。

* [hecomi/node-openjtalk: Node.js TTS module using OpenJTalk](https://github.com/hecomi/node-openjtalk)
* [shime/play-sound: Play sounds by shelling out to one of the available audio players.](https://github.com/shime/play-sound)
* [slackhq/node-slack-client: Slack client library for node.js](https://github.com/slackhq/node-slack-client)

## how to use

* clone it
* install open jtalk
* create config file
* execute

もしうまく音が出ない場合で、オーディオ端子を使っている場合は、  
以下コマンドを実行してください。

```
amixer cset numid=3 1
```

## test

```
npm test
```

