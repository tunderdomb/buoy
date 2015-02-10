module.exports = Transmission

function Transmission( intent, finalCallback ){
  var serviceCall = this

  intent.peek("interrupt", function(  ){
    serviceCall._onEndCallbacks = null
    serviceCall._asyncHandlerCount = 0
    serviceCall._intent = null
    serviceCall._finalCallback = null
    serviceCall.handleService = null
  })

  function serviceHandlerCallback(  ){
    --serviceCall._asyncHandlerCount
    serviceCall.tryFinish()
  }

  this._onEndCallbacks = []
  this._asyncHandlerCount = 0
  this._intent = intent
  this._finalCallback = finalCallback
  this.handleService = function( service ){
    if( !service ) {
      return
    }
    var serviceHandler = service.handler
    var onEnd = service.onEnd
    if( onEnd && serviceCall._onEndCallbacks !== null ){
      serviceCall._onEndCallbacks.push(onEnd)
    }
    if( serviceHandler.length > 1 ){
      // the callback has a second argument indicating it's async
      ++serviceCall._asyncHandlerCount
      serviceHandler(intent, serviceHandlerCallback)
    }
    else {
      serviceHandler(intent)
    }
  }
}
Transmission.prototype = {
  _finish: function(  ){
    if( !this._intent ){
      // the transmission must have been interrupted
      return
    }

    var serviceCall = this

    // notify receivers that everyone finished with the intent
    // this allows for a kind of "pass-the-hat-around-and-see-what-we-got" behaviour
    if( this._onEndCallbacks ){
      this._onEndCallbacks.forEach(function( onEnd ){
        // this callback is meant to work on processed data
        // you really shouldn't modify the intent at this point
        // you had the chance for that in the handler
        onEnd(serviceCall._intent)
      })
    }
    // finally call back what initiated the relay
    // (making a full circle with the intent)
    if( serviceCall._finalCallback ){
      serviceCall._finalCallback(serviceCall._intent)
    }
  },
  tryFinish: function(  ){
    if( !this._asyncHandlerCount ){
      this._finish()
    }
  }
}