module.exports = Operation

/**
 * An operation is a general purpose wrapper
 * containing a handler and an optional onEnd callback.
 * */
function Operation( handler, onEnd ){
  this.handler = handler
  this.onEnd = onEnd
}
