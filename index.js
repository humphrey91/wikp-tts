
const WikpTts = require("./wikp.js");

let wikp = new WikpTts();

// processes the command line argument *the search term to wiki
wikp.processArg(process.argv[2], (result) => {
  // sets the full wiki lookup path
  const url = `https://en.wikipedia.org/wiki/${result}`;
  // Main call
  wikp.getRequest(url, () => {
    wikp.readResponse();
  });
});
