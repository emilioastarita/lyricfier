import * as assert from 'assert';
const MusicMatch = require('../render/plugins/MusicMatch').MusicMatch;



describe('MusicMatch', function() {
    const mm = new MusicMatch();
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