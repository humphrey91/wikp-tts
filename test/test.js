const assert = require('assert');
const WikpTts = require("../wikp.js");
const sinon = require('sinon');
let fs = require('fs'),
  path = require('path');
let yesno = require('yesno');

describe('WikpTts', () => {

  describe('#processArg', () => {

    it('should return string with first letter of words capitalized', function(done) {
      let wikp = new WikpTts();
      wikp.processArg("test_argument", (result) => {
        assert.strictEqual(result, "Test_Argument");
        done()
      });
    });

    it('should return string connected with underscores', function(done) {
      let wikp = new WikpTts();
      wikp.processArg("test_argument", (result) => {
        assert.strictEqual(result, "Test_Argument");
        done()
      });
    });

    it('should respond with "exit" if no argument passed', function(done) {
      let wikp = new WikpTts();
      let stub = sinon.stub(wikp, 'playAudioFile').callsFake( function(file, callback){callback('exit')});
      let logStub = sinon.stub(console, 'log');
      wikp.processArg("", (result) => {
        assert.strictEqual(result, "exit");
        stub.restore();
        assert(logStub.calledOnce);
        assert(logStub.calledWith('Missing search term.'));
        logStub.restore();
        done();
      });
    });

  });

  describe('#getRequest', () => {

    it('should write all paragraphs @ given url to text file', function(done) {
      let wikp = new WikpTts();
      wikp.getRequest('https://en.wikipedia.org/wiki/test', () => {
        let text = fs.readFileSync('data.txt', "utf-8");
        assert.strictEqual(text, 'Test(s) or TEST may refer to:\n');
        done();
      });
    });

    it('should respond with "exit" if no data on page', function(done) {
      let wikp = new WikpTts();
      let stub = sinon.stub(console, 'error');
      wikp.getRequest('https://en.wikipedia.org/wiki/test_hello', (response) => {
        assert.strictEqual(response, 'exit');
        assert(stub.calledOnce);
        assert(stub.calledWith('Error: No data on page.'));
        stub.restore();
        done();
      });
    });

  });

  describe('#splitString', () => {

    it('splits string into paragraphs', () => {
      let wikp = new WikpTts();
      let string = wikp.splitString('test\nstring\n');
      assert.strictEqual(string[0], 'test\n');
      assert.strictEqual(string[1], 'string\n');
    });

  });

  describe('#playAudioFile', () => {

    it('plays an audio file and returns filename', function(done) {
      let wikp = new WikpTts();
      wikp.playAudioFile('./test/test.mp3', (response) => {
        assert.strictEqual(response, './test/test.mp3');
        done();
      });
    });

  });

  describe('#playMainAudio', () => {

    it('plays the main audio file then calls checkMore', () => {
      let wikp = new WikpTts();
      let checkStub = sinon.stub(wikp, 'checkMore').callsFake(function() {});
      let stub = sinon.stub(wikp, 'playMainAudio').callsFake(function() {this.checkMore()});
      wikp.playMainAudio();
      assert(checkStub.calledOnce);
      checkStub.restore();
      stub.restore();
    });

  });

  describe('#checkMore', () => {

    it('plays audio file hear_more', () => {
      let wikp = new WikpTts();
      let stub = sinon.stub(wikp, 'playAudioFile').callsFake( function(file, callback){callback('test')});
      let yesStub = sinon.stub(yesno, 'ask');
      wikp.checkMore();
      assert(stub.calledOnce);
      assert(stub.calledWith('hear_more.mp3'));
      stub.restore();
      yesStub.restore();
    });

    it('asks to play more in terminal', () => {
      let wikp = new WikpTts();
      let stub = sinon.stub(wikp, 'playAudioFile').callsFake( function(file, callback){callback('test')});
      let yesStub = sinon.stub(yesno, 'ask')
      wikp.checkMore();
      assert(yesStub.calledOnce);
      assert(yesStub.calledWith('Would you like to hear more?', true));
      stub.restore();
      yesStub.restore();
    });
    
  });

  describe('#setRequest', () => {

    it('returns a request object with the text passed', () => {
      let wikp = new WikpTts();
      let response = wikp.setRequest("test request");
      assert.strictEqual(response.input.text, "test request")
    })
    
  });

});