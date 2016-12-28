import * as assert from 'assert';
const NormalizeTitles = require('../render/NormalizeTitles').NormalizeTitles;
const mm = new NormalizeTitles();


describe('NormalizeTitlesTest', function() {
    describe('#normalize()', function() {

        it('should eliminate - Remastered', function() {
            let testString = `Revolution - Remastered`;
            let normalized = mm.normalize(testString);
            assert.equal('Revolution', normalized);
        });

        it('should eliminate - Remastered - YEAR', function() {
            let testString = `Revolution - Remastered 2015`;
            let normalized = mm.normalize(testString);
            assert.equal('Revolution', normalized);
        });

        it('should eliminate - Remastered - YEAR', function() {
            let testString = `Revolution - Remastered 2015`;
            let normalized = mm.normalize(testString);
            assert.equal('Revolution', normalized);
        });

        it('should eliminate - Remastered - Live / Remastered', function() {
            let testString = `Revolution - Live / Remastered`;
            let normalized = mm.normalize(testString);
            assert.equal('Revolution', normalized);
        });

        it('should eliminate - Remastered - Live / Bonus Track', function() {
            let testString = `Revolution - Live / Bonus Track`;
            let normalized = mm.normalize(testString);
            assert.equal('Revolution', normalized);
        });

        it('should eliminate - Mono / Remastered', function() {
            let testString = `Revolution - Mono / Remastered`;
            let normalized = mm.normalize(testString);
            assert.equal('Revolution', normalized);
        });


    });
});