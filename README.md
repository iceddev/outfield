# outfield
Async configuration loader/validator built on top of shortstop

## Usage

```js
var joi = require('joi'); // used for validations

var config = require('outfield');

var schema = {
  DATABASE_URL: {
    description: 'The connection string for the Database',
    validate: joi.string().uri(),
    default: 'postgres://postgres@localhost:5432/testdb'
  }
};

config(schema, function(err, env){
  // err if validation or resolution fails

  env.DATABASE_URL; // 'postgres://postgres@localhost:5432/testdb'
});
```

## API

### `config(schema, [options], callback)`

The only method. Takes a schema object, optional options, and a callback.
The schema is parsed, resolved, populated and validated and the callback
is called with an error or an object containing the environment.  Everything
is resolved using the `process.env` with fallbacks to resolving the `resolve`
property using shortstop and then the `default` property.

#### `schema`

The schema object is composed of keys for your environment. Each key is
assigned a definition object comprised of 4 keywords.
Instead of a definiton object, you can nest keys; __However, if there are
any keywords, the nesting will be ignored.__

* `description` __(optional)__ - Used to describe your configuration. Not currently used internally, but allows for extra features in the future.
* `validate` __(required)__ - Used to validate and convert values to proper types. Accepts [`joi`](https://github.com/hapijs/joi) validations.
* `default` __(optional)__ - Used to provide a default to your environment if the key can't be resolved or isn't in `process.env`.
* `resolve` __(optional)__ - String that resolves to a registered [`shortstop`](https://github.com/krakenjs/shortstop) handler.  __Note: No shortstop handlers are registered by default. They must be added using the `options` object.__

#### `options`

The options object allows you to register [`shortstop`](https://github.com/krakenjs/shortstop) handlers and adjust joi configuration.

* `handlers` __(optional)__ - Object containing key/handler pairs of shortstop handlers to register in the shortstop instance.  The handler can be an array of handlers, each will be registered as the key.
* `joi` __(optional)__ - Object containing [`joi`](https://github.com/hapijs/joi) configuration overrides.  __Note: In this module, `allowUnknown` is defaulted to `true`, `abortEarly` is defaulted to `false` and `presence` is defaulted to `required` instead of the joi defaults.__

#### `callback(err, env)`

The callback function is called once all resolution and validation is done.  If resolution or
validation fails, the callback will be called with an error.  If everything succeeds, the `env`
argument will be an object containing the fully resolved environment.  Also, the property
`NODE_ENV` will be resolved to `development` if undefined in the environment and the properties
`development`, `production`, `test` and `staging` will be resolved to booleans based on `NODE_ENV`.
__Note: environment variables will not be resolved if `allowUnknown` is `false` in the joi configuration.__

## License

MIT
