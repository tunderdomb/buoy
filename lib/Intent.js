var Radio = require("stations").Radio
var inherits = require("util").inherits

module.exports = Intent

function Intent( data ){
  Radio.call(this, "intent")
  this.data = data
  this.rejected = false
  this.interrupted = false
  this.state = {}
}

// inherit from Radio to enable flat events
inherits(Intent, Radio)

/**
 * Reject is a simple built in mechanism to help
 * propagate errors and rejections.
 * Rejecting an intent will not stop its propagation.
 *
 * You can reject an intent many times.
 * */
Intent.prototype.reject = function( reasons ){
  this.rejected = true
  this.state = reasons
}
/**
 * Interrupting an intent will halt its propagation.
 * It optionally accepts a reason that will automatically
 * refuse the intent.
 *
 * You can only interrupt an intent once.
 * Subsequent calls to interrupt will do nothing.
 * */
Intent.prototype.interrupt = function( reason ){
  if( this.interrupted ) return
  this.interrupted = true
  if( typeof reason != "undefined" ) this.reject(reason)
}