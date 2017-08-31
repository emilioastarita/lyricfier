import {TranslatersLyrics} from './TranslatersLyrics';

const API_KEY = "";
const lang = {
    1: "pt-BR",
    2: "en-US",
    3: "es-ES",
    4: "fr-FR",
    5: "de-DE",
    6: "it-ELE",
    7: "nl-NL",
    8: "ja-JA",
    9: "pt-PT",
    999999: "other"
}

export class TranslateVagalume extends TranslatersLyrics {

    public name  = 'Vagalume';

    public search(title: string, artist: string, cb: (error?: any, lyrics?) => void) {
        let url = `https://api.vagalume.com.br/search.php?art=${encodeURIComponent(artist)}&mus=${encodeURIComponent(title)}&apikey=`;

        this.doReq(url, (err, res, body) => {
            if(!err){
                let json = JSON.parse(body);

                return this.parseResult(json, cb);
            } else return cb('Vagalume fail');
        });
    }

    protected parseResult(json, cb) {
        if(json.mus && json.mus.length > 0){
            let mus = json.mus[0];

            if(mus.translate && mus.translate.length > 0){
                let translate = mus.translate;
                let translated = [];

                for(let i = 0; i < translate.length; i++){
                    translated.push({
                        lang: this.checkLang(translate[i].lang),
                        lyrics: translate[i].text
                    });
                }

                return cb(null, {
                    url: mus.url,
                    translated: translated
                });
            }
        }
        return cb('Lyrics not found');
    }

    protected checkLang(langId: number){
        if(lang[langId]) return lang[langId];

        return "other";
    }
}
