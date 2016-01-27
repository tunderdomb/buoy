var Relay = require("buoy")

var relay = module.exports = new Relay()

var menuElement = document.querySelector("menu")
var exitButton = menuElement.querySelector(".exit")

exitButton.addEventListener("click", function() {
  relay.relay("exit")
})
