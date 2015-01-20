
module.exports = Intent

function Intent( data ){
  this.data = data
  this.refused = false
  this.interrupted = false
  this.state = {}
}
Intent.prototype.refuse = function( reasons ){
  this.refused = true
  this.state = reasons
}
Intent.prototype.interrupt = function(  ){
  this.interrupted = true
}