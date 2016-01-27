var Relay = require("buoy")
var relay1 = require("./relay-1")
var relay2 = require("./relay-2")

var root = new Relay()
module.exports = root

root.connect(relay1)
root.connect(relay2)
