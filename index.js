var Intent = require("./lib/Intent")
var Component = require("./lib/Component")
var Channel = require("./lib/Channel")
var Radio = require("./lib/Radio")

module.exports.Component = Component
module.exports.component = function( name ){
  return new Component(name)
}

module.exports.Intent = Intent
module.exports.intent = function( data ){
  return new Intent(data)
}

module.exports.Channel = Channel
module.exports.channel = function( data ){
  return new Channel(data)
}

module.exports.Radio = Radio
module.exports.radio = function(){
  return new Radio()
}
