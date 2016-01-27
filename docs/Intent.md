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
