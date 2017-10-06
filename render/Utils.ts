
export const encodeData = x => Object.keys(x).map( k => [k, x[k]].map(encodeURIComponent).join("=")).join("&");
