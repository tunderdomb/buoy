module.exports = Service

function Service( handler, onEnd ){
  this.handler = handler
  this.onEnd = onEnd
}
