var Intent = require("./lib/Intent")
var Component = require("./lib/Component")

module.exports = function( name ){
  return new Component(name)
}

module.exports.Component = Component
module.exports.component = function( name ){
  return new Component(name)
}

module.exports.Intent = Intent
module.exports.intent = function( data ){
  return new Intent(data)
}