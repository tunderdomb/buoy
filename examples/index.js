var App = require("../lib/App")

var app = new App()

var messageScreen = app.component("screen:message", function initialize( someData ){
  if( app.state.someStuff || someData.someOtherStuff ){
    return someData
  }

  var someElement = app.render("some-element", "arg1", 2, [3])

  var relayIntent = app.relay("action:send", {/*data*/}, function onResult( result ){

  })

  if( relayIntent.refused ){
    console.log(relayIntent.state)
  }
})

// static receiver
messageScreen.receiver("action:send", function( relayIntent, sendResult ){
  var createIntent = app.activate("screen:sending", relayIntent, function onResult( result ){

  })
  if( createIntent.refused ){
    console.log(createIntent.state)
  }
})

var SomeElement = app.widget("some-element", function define( definition ){
  definition.onCreate(function( arg1, arg2 ){
    this.setAttribute("arg1", arg1)
    this.setAttribute("arg2", arg2)
  })
  definition.proto({})
})


var component = app.component.define("", function(  ){

})

app.element.register("", function(  ){

})