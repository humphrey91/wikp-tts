# Wikipedia paragraph parser with google text to speeche api.

This is a sample NPM module inspired by [*Learn Enough JavaScript to Be Dangerous*](https://www.learnenough.com/javascript-tutorial) by Michael Hartl.

This module scrapes Wikipedia pages and converts them to speech with google text-to-speech. Then it plays the audio file generated.

The module can be used as follows:

## Installation

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
$ wikp-install
$ wikp <URL-ARGUMENT> 
```
For example:

```sh
$ wikp https://en.wikipedia.org/wiki/Naruto_Uzumaki
```

## Considerations

Curently it only sends the first 4000 characters to Google's Text-To-Speech Api. If you wish to change this you can edit *text-to-speech.py* in the project directory. It chops the wiki output into an array, and only sends the first block. 