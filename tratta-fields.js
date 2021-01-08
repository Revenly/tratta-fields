(function (root, factory) {
  // CommonJS module
  if (typeof exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(function (req) {
      return factory();
    });
  } else {
    root.TrattaFields = factory();
  }
}(this, function () {

  var injectScript = function (url, callback) {
    if (document.getElementById('usaepay_script')) {
      return;
    }

    var object = document.createElement('script');
		object.id = 'usaepay_script';
		var scriptTag = document.getElementsByTagName('script')[0];
		object.src = url;
		object.addEventListener('load', function () {
      callback()
    });
		scriptTag.parentNode.insertBefore(object, scriptTag)
  },

  isDate = function(obj) {
    return (/Date/).test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime());
  },

  isArray = function(obj) {
    return (/Array/).test(Object.prototype.toString.call(obj));
  },

  extend = function (to, from, overwrite) {
      var prop, hasProp;
      for (prop in from) {
          hasProp = to[prop] !== undefined;
          if (hasProp && typeof from[prop] === 'object' && from[prop] !== null && from[prop].nodeName === undefined) {
              if (isDate(from[prop])) {
                  if (overwrite) {
                      to[prop] = new Date(from[prop].getTime());
                  }
              }
              else if (isArray(from[prop])) {
                  if (overwrite) {
                      to[prop] = from[prop].slice(0);
                  }
              } else {
                  to[prop] = extend({}, from[prop], overwrite);
              }
          } else if (overwrite || !hasProp) {
              to[prop] = from[prop];
          }
      }
      return to;
  },

  /**
   * defaults
   */
  defaults = {
    processor_url: 'https://www.usaepay.com/js/v1/pay.js',

    api_key: null,

    el: null,

    style: {},
  },

  errors = {
    INVALID_CARD_LENGTH: 'INVALID_CARD_LENGTH',
    INVALID_CARD_NUMBER: 'INVALID_CARD_NUMBER',
    INVALID_CARD_INFORMATION: 'INVALID_CARD_INFORMATION',
    CARD_NUMBER_IS_REQUIRED: 'CARD_NUMBER_IS_REQUIRED',
    EXPIRATION_DATE_IS_REQUIRED: 'EXPIRATION_DATE_IS_REQUIRED',
    CARD_IS_EXPIRED: 'CARD_IS_EXPIRED',
    CVV_IS_REQUIRED: 'CVV_IS_REQUIRED'
  },

  formatError = function (errorMessage) {
    if (errorMessage.length === 0) {
      return {
        error: false
      }
    }

    var formatMap = {
      'invalid length': errors.INVALID_CARD_LENGTH,
      'card number is required': errors.CARD_NUMBER_IS_REQUIRED,
      'invalid card number': errors.INVALID_CARD_NUMBER,
      'Invalid card informtion': errors.INVALID_CARD_INFORMATION,
      'expiration date is required': errors.EXPIRATION_DATE_IS_REQUIRED,
      'card is expired': errors.CARD_IS_EXPIRED,
      'cvv is required': errors.CVV_IS_REQUIRED
    };

    var errorType = Object.prototype.hasOwnProperty.call(formatMap, errorMessage)
      ? formatMap[errorMessage]
      : errorMessage;

    return {
      error: {
        type: errorType
      }
    }
  },

  /**
   * Tratta Fields Constructor
   */
  TrattaFields = function (options) {
    var self = this,

    options = self.config(options),

    init = function () {
      if (options.api_key === null) {
        throw 'API key is not specified.'
      } else if (options.id === null) {
        throw 'Element ID is not specified.'
      }

      self.client = new usaepay.Client(options.api_key);
      self.paymentCard = self.client.createPaymentCardEntry();

      self.paymentCard.generateHTML(options.style);
      self.paymentCard.addHTML(options.el);

      self.paymentCard.addEventListener('error', function (errorMessage) {
        self.blurCallback(formatError(errorMessage));
      });
    };

    injectScript(options.processor_url, init);
  };

  /**
   * public Tratta Fields API
   */
  TrattaFields.prototype = {
    blurCallback: function () {},

    client: null,

    paymentCard: null,

    /**
     * configure functionality
     */
    config: function (options) {
      // extend object
      return extend(defaults, options, true)
    },

    on: function (eventType, callback) {
      if (eventType === 'blur') {
        this.blurCallback = callback;
      }
    },

    createToken: function () {
      return this.client
        .getPaymentKey(this.paymentCard)
        .then(function (result) {
          if (result.error) {
            //
          } else {
            return result;
          }
        })
        .catch(function (result) {
          return formatError(result).error.type;
        });
    },
  };

  return TrattaFields;
}));