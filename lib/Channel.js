module.exports = Channel

function Channel( name ){
  this.name = name || ""
}

Channel.prototype = []
Channel.prototype.constructor = Channel

Channel.prototype.broadcast = Channel.prototype.publish = function(  ){
  var listeners = this.slice()
  var l = listeners.length
  if( !l ){
    return false
  }

  var err = null
  var i = -1
  var listener

  while( ++i < l ){
    listener = listeners[i]
    if( listener.proxy ) listener = listener.proxy
    err = listener.apply(null, arguments)
    if( err != null ) return err
  }

  return false
}
Channel.prototype.subscribe = function( listener ){
  if( typeof listener != "function" ){
    console.warn("Listener is not a function", listener)
    return this
  }

  if( !this.isSubscribed(listener) ) {
    this.push(listener)
  }

  return this
}
Channel.prototype.unsubscribe = function( listener ){
  var i = this.indexOf(listener)
  if( ~i ) this.splice(i, 1)
  return this
}
Channel.prototype.peek = function( listener ){
  var channel = this

  // piggyback on the listener
  listener.proxy = function proxy(  ){
    var ret = listener.apply(null, arguments)
    channel.unsubscribe(listener)
    return ret
  }
  this.subscribe(listener)

  return this
}
Channel.prototype.isSubscribed = function( listener ){
  return !!(listener && ~this.indexOf(listener))
}
Channel.prototype.hasSubscribers = function(  ){
  return this.length > 0
}
Channel.prototype.empty = function(){
  this.splice(0)
  return this
}
