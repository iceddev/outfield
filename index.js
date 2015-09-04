'use strict';

var _ = require('lodash');
var joi = require('joi');
var shortstop = require('shortstop');

var defaultJoiOptions = {
  abortEarly: false,
  allowUnknown: true,
  presence: 'required'
};

var reservedProps = [
  'description',
  'validate',
  'default',
  'resolve'
];

/* RegExps from https://github.com/krakenjs/confit/blob/2.x/lib/common.js#L22 */
var nodeEnvRegExps = {
  test: /^test/i,
  staging: /^stag/i,
  production: /^prod/i,
  development: /^dev/i
};

function isNested(obj){
  if(_.isPlainObject(obj)){
    return _.isEqual(_.omit(obj, reservedProps), obj);
  } else {
    return false;
  }
}

function traverse(prop){

  function walk(obj){
    if(isNested(obj)){
      return _.mapValues(obj, walk);
    } else {
      return obj[prop];
    }
  }

  return walk;
}

function fromEnv(obj, key){
  return process.env[key];
}

function getNodeEnv(){
  return process.env.NODE_ENV || 'development';
}

function compareNodeEnv(regexp){
  return regexp.test(getNodeEnv());
}

function load(config, options, onLoad){
  var resolver = shortstop.create();

  if(typeof config === 'string'){
    config = require(config);
  }

  if(typeof options === 'function'){
    onLoad = options;
    options = {};
  }

  function registerHandlers(handler, protocol){
    if(_.isArray(handler)){
      _.forEach(handler, function(h){
        resolver.use(protocol, h);
      });
    } else {
      resolver.use(protocol, handler);
    }
  }

  _.forEach(options.handlers, registerHandlers);

  var joiOptions = _.assign({}, defaultJoiOptions, options.joi);

  var env = _.mapValues(config, fromEnv);
  var data = _.mapValues(config, traverse('resolve'));
  var nodeEnv = _.mapValues(nodeEnvRegExps, compareNodeEnv);
  var defaults = _.mapValues(config, traverse('default'));
  var validation = _.mapValues(config, traverse('validate'));

  var schema = joi.compile(validation);

  function onResolve(err, data){
    if(err){
      onLoad(err);
      return;
    }

    var defaultedData = _.defaultsDeep(env, data, defaults);

    // If Joi is allowing unknown, attach our nicities
    if(joiOptions.allowUnknown){
      defaultedData = _.defaultsDeep(defaultedData, nodeEnv, {
        NODE_ENV: getNodeEnv()
      });
    }

    joi.validate(defaultedData, schema, joiOptions, onLoad);
  }

  resolver.resolve(data, onResolve);
}

module.exports = load;
