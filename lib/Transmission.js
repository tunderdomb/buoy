module.exports = Transmission

function Transmission( intent, finalCallback ){
  this._onEndCallbacks = []
  this._intent = intent
  this._finalCallback = finalCallback
  this.finished = false
}
Transmission.prototype = {
  handle: function( operation ){
    var transmission = this
    if( transmission.finished ){
      return
    }

    var intent = transmission.intent
    if( intent.interrupted ){
      return
    }

    operation.handler.call(null, intent)

    if( intent.interrupted ){
      transmission._handleInterruption()
    }
    else if( operation.onEnd ){
      transmission._onEndCallbacks.push(operation.onEnd)
    }
  },
  _handleInterruption: function(  ){
    this._onEndCallbacks = null
    this._intent = null
    this._finalCallback = null
    this.finished = true
  },
  _finish: function(  ){
    if( this.finished ){
      return
    }
    this.finished = true

    // notify receivers that everyone finished with the intent
    // this allows for a kind of "pass-the-hat-around-and-see-what-we-got" behaviour
    if( this._onEndCallbacks ){
      var intent = this._intent
      this._onEndCallbacks.forEach(function( onEnd ){
        // this callback is meant to work on processed data
        // you really shouldn't modify the intent at this point
        // you had the chance for that in the handler
        onEnd(intent)
      })
    }
    // finally call back what initiated the relay
    // (making a full circle with the intent)
    if( this._finalCallback ){
      this._finalCallback(this._intent)
    }
  },
  attemptFinish: function(  ){
    this._finish()
  }
}