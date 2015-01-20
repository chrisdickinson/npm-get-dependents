var getPackages = require('./index.js');
var https = require('https');
var test = require('tape');
var url = require('url');

test('gets packages', function(assert) {
  getPackages('beefy', function(err, packages) {
    if (err) throw err;
    var waiting = packages.length;

    packages.forEach(function(pkg) {
      https.get({
        host: 'registry.npmjs.org',
        path: '/' + pkg,
        agent: false
      }, function(res) {
        assert.equal(res.statusCode, 200);
        var accum = [];
        res.on('data', function(data) {
          accum.push(data);
        });
        res.on('end', function() {
          var data = JSON.parse(accum.join(''));
          assert.ok(Object.keys(data.versions).some(function(version) {
            return Object.keys(data.versions[version].dependencies || {}).indexOf('beefy') > -1 ||
            Object.keys(data.versions[version].devDependencies || {}).indexOf('beefy') > -1 ||
            Object.keys(data.versions[version].optionalDependencies || {}).indexOf('beefy') > -1;
          }));
          if(!--waiting) assert.end();
        });
      });
    });
  });
});
