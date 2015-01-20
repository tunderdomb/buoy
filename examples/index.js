var App = require("../App")

var app = new App()

var messageScreen = app.component("screen:message", function onCreate( createIntent, sendResult ){
  if( app.state.someStuff ){
    return createIntent.refuse({
      someReason: "stuff"
    })
  }

  var someElement = app.construct("some-element", "arg1", "arg2")

  var relayIntent = app.relay("action:send", {/*data*/}, function onResult( result ){

  })

  if( relayIntent.refused ){
    console.log(relayIntent.state)
  }
})

// static receiver
messageScreen.receive("action:send", function receiver( intent ){
  var createIntent = app.invoke("screen:sending", intent, function onResult( result ){

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
