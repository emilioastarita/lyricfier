const templates = {};
const fs = require('fs');
const tplPath = './render/views/';

export function template(name) {
    if (templates[name]) {
        return templates[name];
    }
    templates[name] = fs.readFileSync(`${tplPath}${name}.html`).toString();
    return templates[name]
}
