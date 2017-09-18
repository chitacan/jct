const axios = require('axios');
const {get$} = require('./conf');

const req$ = ($) =>
  $
  .zip(get$, (config, {url, auth}) => {
    return Object.assign({
      baseURL: url,
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }, config);
  })
  .switchMap((config) => axios.request(config));

module.exports = req$;
