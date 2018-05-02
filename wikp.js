#!/usr/bin/env node

// Returns the paragraphs from a Wikipedia link, stripped of reference numbers.
// Especially useful for text-to-speech (both native and foreign).

let PythonShell = require('python-shell');
// setup a default "scriptPath"

let fs = require('fs'),
path = require('path');
let dirString = path.dirname(fs.realpathSync(__filename));
PythonShell.defaultOptions = { scriptPath: dirString };

let stream = fs.createWriteStream('data.txt');
let sys = require('util')
let exec = require('child_process').exec;

let request = require("request");
let url = process.argv[2];

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function getRequest(url, callback) {
  request(url, (error, response, body) => {
    // Simulate a Document Object Model.
    let { document } = (new JSDOM(body)).window;

    // Grab all the paragraphs and references.
    let paragraphs = document.querySelectorAll("p");
    let references = document.querySelectorAll(".reference");

    // Remove references from the body.
    references.forEach(reference => {
      reference.remove();
    });

    // Output the paragraphs.
    paragraphs.forEach(paragraph => {
      stream.write(paragraph.textContent)
    });
    callback(response);
  })
};

getRequest(url, () => {
  PythonShell.run('text-to-speech.py', function (err) {
    if (err) throw err;
    console.log('finished');
    
    function puts(error, stdout, stderr) { 
      sys.puts(stdout) 
    }
    exec("mpg123 output.mp3", puts);
  });

});
