var App = require("./App")
var Widget = require("./Widget")
var Intent = require("./Intent")
var Component = require("./Component")

module.exports.App = App
module.exports.app = function( name, onCreate ){
  return new App(name, onCreate)
}

module.exports.Component = Component
module.exports.component = function( name, onCreate ){
  return new Component(name, onCreate)
}

module.exports.Widget = Widget
module.exports.widget = function( name, define ){
  return new Widget(name, define)
}

module.exports.Intent = Intent
module.exports.intent = function( data ){
  return new Widget(data)
}

