# Tratta Fields

Tratta Fields can be used to collect sensitive payment information in secure way. These information can be tokenized into a single use payment token provided by USAePay.

## Setting up Tratta Fields

Include `tratta-fields.js` on the page where you'd like to collect payment information.

```html
<script src="tratta-fields.js"></script>
```

*To be added - NPM and CDN support.*

Next, create an instance of the `TrattaFields` object using **Public API Key** created using the [Public API Key Endpoint](https://help.usaepay.info/developer/rest-api/more/public-api-key/). You can also create this key manually in the [merchant account](https://help.usaepay.info/merchant/guide/settings/api-keys/#public-key). Make sure to also provide **id of element** where Tratta Fields will be rendered.

```js
var fields = new TrattaFields({
  api_key: '<public_api_key>', # required
  el: 'cardContainer' # required
});
```

## Generating Token

You can generate payment token using `createToken` method on TrattaFields object. `createToken` method returns promise with either token value or error type.

```js
fields.createToken()
  .then(function (token) {
    // Here you can send token to your backend
    // alongside other information
  })
  .catch(function (errorType) {
    // Here you can handle errors when trying to generate
    // token, while card information are invalid
  });
```

## Handling errors

You can listen for `blur` events on `TrattaFields` object. These events are triggered every time you move from, click outside or go to the next element using tab key. Before `blur` is triggered, payment information is validated. If there is an error in the current payment field, event object will contain error type information.

```js
fields.on('blur', function (event) {
  if (event.error) {
    // Here you can handle errors
    console.log(event);
  }
});
```

### Error types

Here is the list of Error Types you can expect to find in `catch` method or `blur` events.
 - 'INVALID_CARD_LENGTH'
 - 'INVALID_CARD_NUMBER'
 - 'INVALID_CARD_INFORMATION'
 - 'CARD_NUMBER_IS_REQUIRED'
 - 'EXPIRATION_DATE_IS_REQUIRED'
 - 'CARD_IS_EXPIRED'
 - 'CVV_IS_REQUIRED'