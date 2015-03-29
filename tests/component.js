var Component = require("../lib/Component")
var assert = require("chai").assert

/**
 * fill the arguments with component instances
 * */
function c( fn ){
  var count = fn.length
  var components = []
  while( count ){
    components.unshift(new Component("c:"+count))
    --count
  }
  return function(  ){
    fn.apply(null, components)
  }
}

describe("Component", function(  ){

  it("should have no parent initially", c(function( c ){
    assert.isNull(c.parent)
  }))
  it("should have a string name property", c(function( c ){
    assert.isString(c.name)
  }))

  describe("components", function(  ){
    it("should tell if a sub component is defined", c(function( c1, c2, c3 ){
      assert.isFalse(c1.isComponentDefined(c2))
      assert.isFalse(c1.isComponentDefined(c2.name))
      assert.isFalse(c1.isComponentDefined(c3))
      assert.isFalse(c1.isComponentDefined(c3.name))
      c1.component(c2)
      assert.isTrue(c1.isComponentDefined(c2))
      assert.isTrue(c1.isComponentDefined(c2.name))
      assert.isFalse(c1.isComponentDefined(c3))
      assert.isFalse(c1.isComponentDefined(c3.name))
    }))
    it("should tell if a sub component exists", c(function( c1, c2, c3 ){
      assert.isFalse(c1.isSubComponent(c2))
      assert.isFalse(c1.isSubComponent(c2.name))
      assert.isFalse(c1.isSubComponent(c3))
      assert.isFalse(c1.isSubComponent(c3.name))
      c1.component(c2)
      assert.isTrue(c1.isSubComponent(c2))
      assert.isFalse(c1.isSubComponent(c3))
    }))
    it("should define a sub component from another component", c(function( c1, c2 ){
      c1.component(c2)
      assert.isTrue(c1.isSubComponent(c2))
    }))
    it("should define a sub component from a string", c(function( c1 ){
      var c2 = c1.component("c:2")
      assert.isTrue(c1.isSubComponent(c2))
    }))
    it("should delete a sub component", c(function( c1, c2 ){
      c1.component(c2)
      c1.deleteComponent(c2)
      assert.isFalse(c1.isSubComponent(c2))
    }))
    it("should not register itself", c(function( c ){
      c.component(c)
      assert.isFalse(c.isSubComponent(c))
    }))
    it("should not register the same component twice or a component with the same name", c(function( c1, c2 ){
      c1.component(c2)
      var c3 = new Component(c2.name)
      c1.component(c3)
      assert.isFalse(c1.isSubComponent(c3))
      c1.component(c2.name)
      assert.isFalse(c1.isSubComponent(c3))
    }))
    it("should return a component instance", c(function( c ){
      assert.instanceOf(c.component("c"), Component)
    }))
    it("should return the component if it already is defined", c(function( c1, c2 ){
      c1.component(c2)
      assert.equal(c1.component(c2), c2)
      assert.equal(c1.component(c2.name), c2)
    }))
  })

  describe("services", function(  ){
    it("should tell if a service exists", c(function( c1 ){
      c1.service("s1", function(  ){})
      assert.isTrue(c1.serviceExists("s1"))
    }))
    it("should define a service", c(function( c1 ){
      function s1(  ){}
      c1.service("s1", s1)
      assert.isTrue(c1.serviceExists("s1"))
      assert.equal(c1._services["s1"], s1)
    }))
    it("should not define a service with the same name", c(function( c1 ){
      function s1(  ){}
      function s2(  ){}
      c1.service("s1", s1)
      c1.service("s1", s2)
      assert.equal(c1._services["s1"], s1)
      assert.notEqual(c1._services["s1"], s2)
    }))
    it("should delete a service", c(function( c1 ){
      function s1(  ){}
      c1.service("s1", s1)
      assert.isTrue(c1.serviceExists("s1"))
      assert.equal(c1._services["s1"], s1)
      c1.deleteService("s1")
      assert.isFalse(c1.serviceExists("s1"))
      assert.isUndefined(c1._services["s1"])
    }))
    it("should return this", c(function( c1 ){
      var ret = c1.service("s1")
      assert.instanceOf(ret, Component)
      assert.equal(ret, c1)
    }))
    it("should define the service on the root", c(function( c1, c2, c3 ){
      function s2(  ){}

      // service defined on a sub component should be hoisted to the root
      c1.component(c2)
      c2.service("s2", s2)
      // service should report exists regardless which component asks it
      assert.isTrue(c2.serviceExists("s2"))
      assert.isTrue(c1.serviceExists("s2"))
      // if a service is defined on a sub component
      // it should be registered on the root automatically
      // and not exist on the defining component
      assert.isUndefined(c2._services["s2"])
      assert.isDefined(c1._services["s2"])
    }))
    it("should serve lazy clients after defining a service", c(function( c1 ){
      var invoked = false
      var invokeLazyRet = c1.invokeLazy("s1", function(){
        invoked = true
      })
      assert.isNull(invokeLazyRet)
      assert.isFalse(invoked)
      c1.service("s1", function( client ){
        client()
      })
      assert.isTrue(invoked)
    }))
    it("should hoist services after joining a network", c(function( c1, c2 ){
      debugger
      function s2(  ){}
      // service defined before joining a network
      // the service here is on the root
      c2.service("s2", s2)
      // after joining a network the service should be hoisted to the root
      c1.component(c2)

      // it should be report exists no matter which component asks for it
      assert.isTrue(c2.serviceExists("s2"))
      assert.isTrue(c1.serviceExists("s2"))
      // it should be removed during the join
      assert.isUndefined(c2._services["s2"])
      // and moved to the new root
      assert.isDefined(c1._services["s2"])
    }))

    it("should invoke a service synchronously", c(function( c1 ){
      var invoked = false
      c1.service("s1", function(){
        invoked = true
      })
      assert.isFalse(invoked)
      c1.invoke("s1")
      assert.isTrue(invoked)
    }))
    it("should return what the service returns", c(function( c1 ){
      c1.service("s1", function(  ){
        return "hello"
      })
      assert.equal(c1.invoke("s1"), "hello")
    }))
    it("should pass arguments to the service", c(function( c1 ){
      c1.service("s1", function( a, b, c ){
        assert.equal(a, 1)
        assert.equal(b, "2")
        assert.isArray(c)
        assert.lengthOf(c, 1)
        assert.equal(c[0], 3)
      })
      c1.invoke("s1", 1, "2", [3])
    }))
    it("should do nothing if a service doesn't exist", c(function( c1 ){
      c1.invoke("s1")
    }))
    it("should return null if a service doesn't exist", c(function( c1 ){
      assert.isNull(c1.invoke("s1"))
    }))
    it("should define lazy clients on the root", c(function( c1, c2 ){
      c1.component(c2)
      c2.invokeLazy("s1")
      assert.isUndefined(c2._lazyClients["s1"])
      assert.isDefined(c1._lazyClients["s1"])
      assert.lengthOf(c1._lazyClients["s1"], 1)
    }))
    it("should hoist lazy clients after joining a network", c(function( c1, c2 ){
      c2.invokeLazy("s1")
      c1.component(c2)
      assert.isUndefined(c2._lazyClients["s1"])
      assert.isDefined(c1._lazyClients["s1"])
      assert.lengthOf(c1._lazyClients["s1"], 1)
    }))
  })

  describe("intents", function(  ){

  })

  describe("events", function(  ){

  })

})