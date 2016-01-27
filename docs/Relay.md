# Relay

**Parameters**

-   `parent` **Relay=**  (optional, default `null`)

**Properties**

-   `parent` **Relay** the parent relay
-   `root` **Relay** the root of this relay network
-   `active` **[Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 
-   `connections` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `intents` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

## activate

Sets active to true

## canConnect

Check if a relay can connect with this one.

**Parameters**

-   `relay` **Relay** 

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

## connect

Connect a relay to this one.

**Parameters**

-   `relay` **Relay** 

## deactivate

Sets active to false

## disconnect

Disconnect a relay form this network.

**Parameters**

-   `relay` **Relay** 

## isConnected

Check if a relay is connected to this one.

**Parameters**

-   `relay` **Relay** 

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

## receive

Registers an intent handler on this relay.

**Parameters**

-   `name` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `handler` **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** 

Returns **Relay** 

## transmit

Transmit an intent on this relay.
The transmitted intent will propagate according to the intent's direction
and call handlers that listen to this intent.
Handlers receive an intent with the provided data as their only argument.
Handlers may return a promise.

**Parameters**

-   `name` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `data` **(Intent|Any)=**  (optional, default `null`)

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

## walk

Traverse this relay network starting from this one.
The callback can break out from the traversal by returning `false`.

**Parameters**

-   `cb` **walkCallback** 

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** `true` if the traversal was complete.

## walkCallback

**Parameters**

-   `relay` **Relay** 
-   `cb`  

# Intent

**Extends Radio**

**Parameters**

-   `data` **Any** 
-   `source` **Relay=**  (optional, default `null`)

**Properties**

-   `data` **Any** the data carried on this intent
-   `interrupted` **[Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** indicates if the intent was interrupted
-   `direction` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** `"capture"`, `"bubble"`

## hasData

Check if the intent carries data

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

## hasSource

Check if the source is defined on the intent

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

## interrupt

Interrupting an intent will halt its propagation and publish an `interrupt` event on it.
You can only interrupt an intent once. Subsequent calls to interrupt will do nothing.
