var Network = require("./lib/Network")
var Intent = require("./lib/Intent")
var Component = require("./lib/Component")

module.exports.Network = Network
module.exports = function( name ){
  return new Network(name)
}

module.exports.Component = Component
module.exports.component = function( name ){
  return new Component(name)
}

module.exports.Intent = Intent
module.exports.intent = function( data ){
  return new Intent(data)
}