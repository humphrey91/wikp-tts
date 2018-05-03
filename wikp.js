#!/usr/bin/env node

/*

  This program accepts a search term as a command line argument and makes a request
  to Wikipedia attempting to match the request. From that it selects all of the paragraph
  elements on the page, and removes any citation text. Next it chuncks the text up into
  single paragraphs and sends the first one to google-cloud-text-to-speech which returns
  an audio file. It then plays the audio until finished and prompts the user to 
  continue hearing more, or stop. If the user continues it sends the next chunk of text,
  and so on, until the whole page is submited and the program finishes.

*/

// File system tool
let fs = require('fs'),
path = require('path');
// Set path to dir this file is in
const dirString = path.dirname(fs.realpathSync(__filename));
// create a file write stream to data.txt
let stream = fs.createWriteStream(`${dirString}/data.txt`);
// request is an http request tool
let request = require("request");
// Tool for querying the user in terminal
let yesno = require('yesno');
// Track where in the wiki the program is
let increment = 0;
let finalSize;
// Imports the Google Cloud client library
const textToSpeech = require('@google-cloud/text-to-speech');
// creates a virtual document object so we can manipulate the response
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
// for playing audio
let Sound = require('node-mpg123');

// processes the command line argument *the search term to wiki
processArg(process.argv[2], (result) => {
  // sets the full wiki lookup path
  const url = `https://en.wikipedia.org/wiki/${result}`;
  // Main call
  getRequest(url, () => {
    readResponse(increment);
  });
});
 
// Process the command argument to match Wiki search style *_* 
function processArg(arg, callback) {
  if (arg) {
    // first lowercases string
    arg = arg.toLowerCase()
    // splits string by space or underscore, caps first letter, and joins with underscore.
    callback(arg.split(/[\s_]+/).map(word => word.replace(word[0], word[0].toUpperCase())).join("_"));
  } else {
    playAudioFile('missing_input.mp3', () => {
      console.log("Missing search term.")
      process.exit()
    })
  }
};

// Collects the text data from wikipedia
function getRequest(url, callback) {
  request(url, (error, response, body) => {
    // catch error
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
    
    // Check to see if there was any text on the page
    if (paragraphs.length === 0) {
      console.error("Error: No data on page.")
      process.exit()
    } else {
    // callback when finished
      callback(response);
    }
  })
};

// Processes text into paragraphs
function splitString(string) {
  // Matches beginning of paragraph till end (1)
	const re = new RegExp(/(.+\n){1}/g);
	return string.match(re);
}

// Audio player
function playAudioFile(fileName, callback) {
  let audio = new Sound(dirString + '/' + fileName);
  audio.play();
  audio.on('complete', () => {
    callback();
  });
}

// Plays the current output file 
function playMainAudio() {
  playAudioFile("output.mp3", () => {
    checkMore();
  })
}

// Play audio asking if user would like to hear more, prompt terminal
function checkMore () {
  // Play hear more *REFACTOR*
  playAudioFile("hear_more.mp3", () => {
    yesno.ask('Would you like to hear more?', true, function(ok) {
      if(ok) {
          // Increments counter to grab next chunck of text
          increment = increment + 1;
          if (increment < finalSize) {
            // Check if at the end
            readResponse(increment);
          } else {
            // Lets user know the wiki is finished.
            playAudioFile("finished.mp3", () => {
              process.exit();
            });
          }
      } else {
        process.exit()
      }
    });
  });
}

// Set request for google-cloud-api
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

// Read output from data.txt and process it to send to google-api
function readResponse(increment) {
  fs.readFile(`${dirString}/data.txt`, "utf-8", (err, data) => {
    if (err) {
      console.error('Error:', err);
      return;
    } else {
      // process file
      let text = splitString(data);
      // set the length of file
      finalSize = text.length;
      // Creates a client
      let client = new textToSpeech.TextToSpeechClient();
      // Performs the Text-to-Speech request
      client.synthesizeSpeech(setRequest(text[increment]), (err, response) => {
        if (err) {
          console.error('ERROR:', err);
          return;
        }
        // Write the binary audio content to a local file
        fs.writeFile(`${dirString}/output.mp3`, response.audioContent, 'binary', err => {
          if (err) {
            console.error('ERROR:', err);
            return;
          }
          console.log('Audio content written to file: output.mp3');
          playMainAudio();
        });
      });
    }
  });
}
