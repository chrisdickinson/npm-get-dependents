# npm-get-dependents

Get a list of a packages' npm dependents, optionally as a stream.

```javascript
var getDependents = require('npm-get-dependents');

getDependents('beefy', function(err, packages) {
  packages.forEach(console.log); // each package is a string.
});

getDependents.createReadStream()
 .on('data', console.log);       // log each package as it comes through
```

## API

### `getDependents(package:String, ready:Function<Error, String>) → undefined`

Get all dependents in one fell swoop. Calls `ready` with any error encountered as
the first argument and any array of strings representing packages as the second argument.

### `getDependents.createReadStream(package:String, perPage:Number=100) → Readable<String>`

Create an objectMode readable stream of package dependents. Each package is represented as a single
data event.

## License

MIT 
