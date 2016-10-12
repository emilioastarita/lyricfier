const assert = require('assert');
const MusicMatch = require('../render/plugins/MusicMatch').MusicMatch;
const mm = new MusicMatch();


describe('MusicMatch', function() {
    describe('#double-quote-escape()', function() {
        it('should return the body content with double quotes.', function() {
            let testString = `"body":"My test \\"string\\"",`;
            let parsedString = mm.parseContent(testString);
            assert.equal('My test "string"', parsedString);
        });
        it('should return the body content with single quotes.', function() {
            let testString = `"body":"My test 'string\\"",`;
            let parsedString = mm.parseContent(testString);
            assert.equal(`My test 'string"`, parsedString);
        });
    });
});