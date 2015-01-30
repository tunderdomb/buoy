var Network = require("./lib/Network")
var Intent = require("./lib/Intent")
var Endpoint = require("./lib/Endpoint")

module.exports.Network = Network
module.exports = function( name ){
  return new Network(name)
}

module.exports.Endpoint = Endpoint
module.exports.endpoint = function( name ){
  return new Endpoint(name)
}

module.exports.Intent = Intent
module.exports.intent = function( data ){
  return new Intent(data)
}