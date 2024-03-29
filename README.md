# Tratta Fields

Tratta Fields can be used to collect sensitive payment information in secure way. These information can be tokenized into a single use payment token provided by USAePay.

## Setting up Tratta Fields

Include `tratta-fields.js` on the page where you'd like to collect payment information.

```html
<script src="tratta-fields.js"></script>
```

*To be added - NPM and CDN support.*

Next, create an instance of the `TrattaFields` object using **Public API Key** created using the [Public API Key Endpoint](https://help.usaepay.info/developer/rest-api/more/public-api-key/). For those using USAePay Console 2, you can also create this key manually in the [payment gateway admin interface](https://help.usaepay.info/merchant/guide/settings/api-keys/#public-key). Make sure to also call `mount` method with **id of element** where Tratta Fields will be rendered.

```js
var fields = new TrattaFields({
  api_key: '<public_api_key>', # required
});

fields.mount('cardContainer'); # required
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
 - INVALID_CARD_LENGTH
 - INVALID_CARD_NUMBER
 - INVALID_CARD_INFORMATION
 - CARD_NUMBER_IS_REQUIRED
 - EXPIRATION_DATE_IS_REQUIRED
 - CARD_IS_EXPIRED
 - CVV_IS_REQUIRED
 - VALID_AUTHENTICATION_REQUIRED
 - SOURCE_KEY_NOT_FOUND

## Styling Fields

You can customize how payment fields look like by passing in a style object. You can style any of these classes or ids present in the fields:
 - #payjs-container
 - #payjs-cnum
 - #payjs-exp
 - #payjs-cvv
 - .payjs-base
 - .payjs-invalid (added to any of the input fields, when validation fails)
 - .payjs-valid (added to any of the input fields, when validation succeeds)

You only need to specify the suffix of class or id. So for example when you'd like to add 1px solid black border around the whole payment field and set successful validation state of fields to bold black font, you could do it like this:

```js
var fields = new TrattaFields({
  api_key: '<public_api_key>', # required
  el: 'cardContainer' # required

  style: {
    container: {
      border: '1px solid black'
    },

    valid: {
      color: 'black',
      fontWeight: 'bold'
    }
  }
});
```

## Environments

You can toggle between `production` and `sandbox` environments using `sandbox` parameter. By default Tratta Fields works in `production` mode.

```js
var fields = new TrattaFields({
  api_key: '<public_api_key>', # required

  sandbox: true,
});

fields.mount('cardContainer'); # required
```

## Card Security Code (CVV)

By default card security code is required. If you'd like to disable it's validation, you can do it with cvv_required parameter:

```js
var fields = new TrattaFields({
  api_key: '<public_api_key>', # required

  cvv_required: false,
});

fields.mount('cardContainer'); # required
```

## Extended response

When tokenizing card data by default you'll only get a `payment_key` token string in response. If you'd like to get extended response with card type and bin information you can set `extended_response` parameter to `true`.

```js
var fields = new TrattaFields({
  api_key: '<public_api_key>', # required

  extended_response: true,
});

fields.mount('cardContainer'); # required
```

Response from `createToken` will then be

```js
{
  "type": "payment_key",
  "key": "payment-key-token",
  "creditcard": {
    "number": "424242xxxxxx4242",
    "cardtype": "Visa"
    }
  }
```

## Mounting and unmounting fields

Tratta Fields provide `mount` and `unmount` methods to programatically insert or remove payment fields from document.

```js
var fields = new TrattaFields({
  api_key: '<public_api_key>',
});

fields.mount('cardContainer');
fields.unmount();
```

This can be useful, when you use Tratta Fields in modal. When closing modal, payment fields html is usually removed from the document alongside the modal component. When you re-open the modal, you just need to call `mount` and fields will be inserted into the document again.

## Example Code

You can find the example code [here](https://github.com/Revenly/tratta-fields/blob/main/examples/example.html).
