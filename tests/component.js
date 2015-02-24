var Component = require("../lib/Component")

describe("Component", function(  ){

  it("should be a Radio instance", function(  ){})
  it("should have no parent initially", function(  ){})
  it("should have a string name property", function(  ){})

  describe("sub-components", function(  ){
    it("should define a sub component", function(  ){})
    it("should delete a sub component", function(  ){})
    it("should tell if it has a sub component", function(  ){})
    it("should not register itself", function(  ){})
    it("should not register the same component twice or a component with the same name", function(  ){})
    it("should return a component instance", function(  ){})
  })

  describe("services", function(  ){
    it("should define a service", function(  ){})
    it("should not define a service with the same name", function(  ){})
    it("should tell if a service exists", function(  ){})
    it("should delete a service", function(  ){})
    it("should return this", function(  ){})
    it("should serve lazy clients", function(  ){})
  })

  describe("invoke", function(  ){
    it("should invoke a service", function(  ){})
    it("should do nothing if a service doesn't exist", function(  ){})
    it("should return an intent", function(  ){})
    it("should return null if a service doesn't exist", function(  ){})
    it("should invoke a service lazily", function(  ){})
  })

})