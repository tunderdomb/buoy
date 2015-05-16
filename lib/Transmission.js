module.exports = Transmission

/**
 * A transmission is a manager for handling operations that deal with intents.
 * Transmissions handles common logic so users can maintain custom
 * structure of their operations (be it a list, a tree or anything).
 * A transmission handles interruptions and final callbacks automatically.
 * Users only need to iterate over their operations
 * and call `handle(operation)` each time.
 * At the end of the loop they may call `attemptFinish()` to
 * attempt calling the final callback.
 * */
function Transmission( intent, finalCallback ){
  this._onEndCallbacks = []
  this._intent = intent
  this._finalCallback = finalCallback
  this.finished = false
}

/**
 * @private Function handleInterruption
 * */
function handleInterruption( transmission ){
  transmission._onEndCallbacks = null
  transmission._intent = null
  transmission._finalCallback = null
  transmission.finished = true
}

/**
 * @private Function finish
 * */
function finish( transmission ){
  if( transmission.finished ){
    return
  }
  transmission.finished = true

  // notify receivers that everyone finished with the intent
  // transmission allows for a kind of "pass-the-hat-around-and-see-what-we-got" behaviour
  if( transmission._onEndCallbacks && transmission._onEndCallbacks.length ){
    var intent = transmission._intent
    transmission._onEndCallbacks.forEach(function( onEnd ){
      // this callback is meant to work on processed data
      // you really shouldn't modify the intent at this point
      // you had the chance for that in the handler
      onEnd(intent)
    })
  }
  // finally call back what initiated the transmission
  // (making a full circle with the intent)
  if( typeof transmission._finalCallback == "function" ){
    transmission._finalCallback(transmission._intent)
  }
}

/**
 * Handle an operation
 * */
Transmission.prototype.handle = function( operation, next ){
  var transmission = this
  if( transmission.finished ){
    return
  }

  var intent = transmission._intent
  if( intent.interrupted ){
    return
  }

  operation.handler.call(null, intent, next)

  if( intent.interrupted ){
    handleInterruption(transmission)
  }
  else if( operation.onEnd ){
    transmission._onEndCallbacks.push(operation.onEnd)
  }
}
/**
 * Attempt to finish the transmission
 * */
Transmission.prototype.attemptFinish = function(  ){
  finish(this)
}