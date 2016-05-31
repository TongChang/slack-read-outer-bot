'use strict';

var readouter = require('./lib/slack-read-outer.js');

const main = () => {
  readouter.start();


  process.on('SIGINT', () => {
    readouter.finalize();
  });

  process.on('SIGTERN', () => {
    readouter.finalize();
  });

  process.on('SIGHUP', () => {
    readouter.finalize();
  });

  process.on('uncaughtException', (err) => {
    console.log(err);
    readouter.finalize();
  });
};

main();

