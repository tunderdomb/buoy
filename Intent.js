var inherit = require("backyard/function/inherit")
var Radio = require("stations")

module.exports = Intent

/**
 * @extends Radio
 * @param {*} data
 * @param {Relay} [source=null]
 * @property {*} data the data carried on this intent
 * @property {Boolean} interrupted indicates if the intent was interrupted
 * @property {String} direction `"capture"`, `"bubble"`
 * */
function Intent(data, source) {
  this.data = data || null
  this.source = source || null
  this.interrupted = false
  this.direction = "capture" // "bubble"
}

inherit(Intent, Radio)

/**
 * Interrupting an intent will halt its propagation and publish an `interrupt` event on it.
 * You can only interrupt an intent once. Subsequent calls to interrupt will do nothing.
 * */
Intent.prototype.interrupt = function() {
  if (this.interrupted) return
  this.interrupted = true
  this.publish("interrupt")
}

/**
 * Check if the intent carries data
 *
 * @return {boolean}
 * */
Intent.prototype.hasData = function() {
  return this.data != null
}

/**
 * Check if the source is defined on the intent
 *
 * @return {boolean}
 * */
Intent.prototype.hasSource = function() {
  return this.source != null
}
