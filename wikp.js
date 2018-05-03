#!/usr/bin/env node

let fs = require('fs'),
path = require('path');
let dirString = path.dirname(fs.realpathSync(__filename));

let stream = fs.createWriteStream('data.txt');
let exec = require('child_process').exec;

let request = require("request");
let argument = processArg(process.argv[2])

let url = `https://en.wikipedia.org/wiki/${argument}`;

let yesno = require('yesno');

let increment = 0;
let finalSize;

// Imports the Google Cloud client library
const textToSpeech = require('@google-cloud/text-to-speech');

// Creates a client
const client = new textToSpeech.TextToSpeechClient();

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function processArg(arg) {
  return arg.split(" ").join("_");
};

function getRequest(url, callback) {
  request(url, (error, response, body) => {
    
    if (error) {
      console.error('Error:', error);
      process.exit()
    };
    // Simulate a Document Object Model.
    let { document } = (new JSDOM(body)).window;

    // Grab all the paragraphs and references.
    let paragraphs = document.querySelectorAll(".mw-parser-output > p");
    let references = document.querySelectorAll(".reference");
    
    // Remove references from the body.
    references.forEach(reference => {
      reference.remove();
    });

    // Output the paragraphs.
    paragraphs.forEach(paragraph => {
      stream.write(paragraph.textContent + "\n")
    });
  
    if (paragraphs.length === 0) {
      console.error("Error: No data on page.")
      process.exit()
    } else {
      callback(response);
    }
  })
};

function splitString (string) {
	var re = new RegExp(/(.+\n){1}/g);
	return string.match(re);
}

function playAudio () {
  exec('mpg123 output.mp3', () => {
    checkMore()
  });
}

function checkMore () {
  exec(`mpg123 ${dirString}/hear_more.mp3`, () => {
    yesno.ask('Would you like to hear more?', true, function(ok) {
      if(ok) {
          increment = increment + 1;
          if (increment < finalSize) {
            readResponse(increment);
          } else {
            exec(`mpg123 ${dirString}/finished.mp3`, () => {
              process.exit();
            });
          }
      } else {
        process.exit()
      }
    });
  });
}

function setRequest (text) {
  // Construct the request
  let request = {
    input: {text: text},
    // Select the language and SSML Voice Gender (optional)
    voice: {languageCode: 'en-US', ssmlGender: 'FEMALE'},
    // Select the type of audio encoding
    audioConfig: {audioEncoding: 'MP3'},
  };
  return request
}

function readResponse(increment) {
  fs.readFile("data.txt", "utf-8", (err, data) => {
    if (err) {
      console.error('Error:', err);
      return;
    } else {
      let text = splitString(data);
      finalSize = text.length;

      // Performs the Text-to-Speech request
      client.synthesizeSpeech(setRequest(text[increment]), (err, response) => {
        if (err) {
          console.error('ERROR:', err);
          return;
        }
        // Write the binary audio content to a local file
        fs.writeFile('output.mp3', response.audioContent, 'binary', err => {
          if (err) {
            console.error('ERROR:', err);
            return;
          }
          console.log('Audio content written to file: output.mp3');
          playAudio();
        });
      });
    }
  });
}

getRequest(url, () => {
  readResponse(increment);
});
