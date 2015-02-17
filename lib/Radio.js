var Channel = require("./Channel")

module.exports = Radio

function Radio( name ){
  Object.defineProperty(this, "name", {
    value: name
  })
  Object.defineProperty(this, "_channels", {
    value: {}
  })
}

Radio.prototype.channelExists = function( channel ){
  return this._channels.hasOwnProperty(channel)
}
Radio.prototype.channel = function( channel ){
  return this._channels[channel] || (this._channels[channel] = new Channel(channel))
}
Radio.prototype.deleteChannel = function( channel ){
  if( channel instanceof Channel ){
    return delete this._channels[channel.name]
  }
  return delete this._channels[channel]
}
Radio.prototype.hasSubscribers = function( channel ){
  return this.channelExists(channel) && this._channels[channel].length > 0
}
Radio.prototype.isSubscribed = function( channel, listener ){
  channel = this._channels[channel]
  return channel && channel.isSubscribed(listener)
}
Radio.prototype.probe = function( channel ){
  channel = this._channels[channel]
  if( !channel ) return null
  var args = [].slice.call(arguments, 1)
  return channel.poll.apply(channel, args)
}
Radio.prototype.broadcast = function( channel ){
  channel = this._channels[channel]
  if( !channel ) return null
  var args = [].slice.call(arguments, 1)
  return channel.broadcast.apply(channel, args)
}
Radio.prototype.subscribe = function( channel, listener ){
  this.channel(channel).subscribe(listener)
  return this
}
Radio.prototype.unsubscribe = function( channel, listener ){
  if( this.channelExists(channel) ) {
    this.channel(channel).unsubscribe(listener)
    if( !this.hasSubscribers(channel) ) {
      this.deleteChannel(channel)
    }
  }
  return this
}
Radio.prototype.peek = function( channel, listener ){
  var radio = this
  this.subscribe(channel, function proxy(  ){
    listener.apply(this, arguments)
    radio.unsubscribe(channel, proxy)
  })
  return this
}