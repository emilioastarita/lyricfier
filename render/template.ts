const templates = {};
const fs = require('fs');
const path = require('path');
const tplPath = path.join(path.dirname(__filename), '/views/');

export function template(name) {
    if (templates[name]) {
        return templates[name];
    }
    templates[name] = fs.readFileSync(`${tplPath}${name}.html`).toString();
    return templates[name]
}
