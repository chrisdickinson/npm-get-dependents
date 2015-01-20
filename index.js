var Readable = require('stream').Readable;
var JSONStream = require('JSONStream');
var emit = require('emit-function');
var https = require('https');
var once = require('once');
var url = require('url');

module.exports = getAll;
module.exports.createReadStream = createReadStream;

function getAll(forPackage, ready) {
  var all = [];
  ready = once(ready);
  createReadStream(forPackage, 1000)
    .on('data', all.push.bind(all))
    .on('error', ready)
    .on('end', onend);

  function onend() {
    ready(null, all);
  }
}

function createReadStream(forPackage, pageSize) {
  pageSize = pageSize || 100;
  var readable = new Readable({objectMode: true, highWaterMark: pageSize});
  var page = 0;
  readable._read = onread;

  return readable;

  function getURLForPage(page) {
    return url.format({
      protocol: 'https',
      host: 'skimdb.npmjs.com',
      pathname: '/registry/_design/app/_view/dependedUpon',
      query: {
        group_level: 2,
        startkey: JSON.stringify([forPackage]),
        endkey: JSON.stringify([forPackage, {}]),
        limit: 100,
        skip: page*100,
        state: 'update_after'
      }
    });
  }

  function onread(n) {
    var seen = 0;
    var req = https.request(getURLForPage(page++), function(res) {
      res.on('error', emit(readable, 'error'));
      res.pipe(JSONStream.parse('rows.*.key.1'))
        .on('data', function(item) {
          ++seen;
          if (item) readable.push(item);
        })
        .on('end', function() {
          if (!seen) readable.push(null);
        });
    });
    req.on('error', emit(readable, 'error'));
    req.end();
  }
}
