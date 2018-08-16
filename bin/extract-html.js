#!/usr/bin/env node

var string = "";

process.stdin.resume();

process.stdin.on('data', function(buf) {
  string += buf;
});

process.stdin.on('end', () => {
  console.log(JSON.parse(string).html);
});

