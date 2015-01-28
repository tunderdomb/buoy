var App = require("./lib/App")
var Intent = require("./lib/Intent")
var Component = require("./lib/Component")

module.exports.App = App
module.exports.app = function( name ){
  return new App(name)
}

module.exports.Component = Component
module.exports.component = function( name, onCreate ){
  return new Component(name, onCreate)
}

module.exports.Intent = Intent
module.exports.intent = function( data ){
  return new Intent(data)
}