# Wikipedia paragraph parser with google text to speech api.

This is a sample NPM module inspired by [*Learn Enough JavaScript to Be Dangerous*](https://www.learnenough.com/javascript-tutorial) by Michael Hartl.

This module scrapes Wikipedia pages and converts them to speech with google text-to-speech. Then it plays the audio file generated.

The module can be used as follows:

## Installation

First:
```sh
$ npm install --global wikp-tts
```

To run the client library, you must first set up authentication by creating a service account and setting an environment variable.
https://cloud.google.com/text-to-speech/docs/reference/libraries
Follow directions under *Setting up authentication*.

Replace [PATH] with the file path of the JSON file that contains your service account key.

export GOOGLE_APPLICATION_CREDENTIALS="[PATH]"

For example:

```sh
$ export GOOGLE_APPLICATION_CREDENTIALS="/home/user/Downloads/service-account-file.json"
```

## Usage

```sh
$ wikp <URL-ARGUMENT> 
```
For example:

```sh
$ wikp Naruto_Uzumaki
$ wikp "Naruto Uzumaki"
```

For use in project:

First:
```sh
$ npm install wikp-tts --save
```

```javascript
const WikpTts = require("wikp-tts");
let wikp = new WikpTts();

// processes the command line argument *the search term to wiki
wikp.perform();
```

```sh
$ node index.js donald_trump
```

You can also pass a search term directly:

```javascript
wikp.perform("donald_trump");
```
```sh
$ node index.js
```

