var Radio = require("stations").Radio
var inherits = require("util").inherits

module.exports = Intent

function Intent( data ){
  Radio.call(this, "intent")
  this.data = data
  this.refused = false
  this.interrupted = false
  this.state = {}
}

// inherit from Radio to enable flat events
inherits(Intent, Radio)

/**
 * Refuse is a simple built in mechanism to help
 * propagate errors and rejections in an established way.
 * */
Intent.prototype.refuse = function( reasons ){
  this.refused = true
  this.state = reasons
}
Intent.prototype.interrupt = function(  ){
  this.interrupted = true
  this.broadcast("interrupt")
}