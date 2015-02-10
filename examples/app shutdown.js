// index.js

var network = require("synapse")()

network.service("app:close", function( intent ){
  // maybe log the intent
  console.log(intent)
}, function( intent ){
  // the root component cares when all the services finished their work
  // and shuts down the app for good
  process.exit(0)
})

require("./c1")(network)
require("./c2")(network)

// ----------------------

// C1.js

module.exports = function( network ){

  var c1 = network.component("c1")
  c1.service("app:close", function( intent, cb ){
    // this component requires some async operation before shutdown
    // we imitate it with a timeout
    setTimeout(cb, 1000)
  })
}

// ----------------------

// C2.js

module.exports = function( network ){

  var component = network.component("c2")
  component.service("app:shutdown", function( intent ){
    // we could do this right in the function
    // that triggers the relay here
    // but if we register a service
    // the routine will run even if the app:shutdown
    // was triggered by some other than this component
    // this way we don't have to care or even take track of
    // who or what initiated this service,
    // we just do the job that's need to be done here
  })

  // trigger app shutdown
  function someAction(  ){
    network.relay("app:close")
  }
}