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
