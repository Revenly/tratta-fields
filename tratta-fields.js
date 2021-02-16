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
      callback();
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

  addIdStyles = function(style) {
    var fieldIds = ['container', 'cnum', 'exp', 'cvv'];
    var idStyles = "";

    Object.keys(style).forEach(function (classNameOrId) {
      if (fieldIds.indexOf(classNameOrId) !== -1) {
        var cssStyle = "";
        Object.keys(style[classNameOrId]).forEach(function (styleName) {
          cssStyle += camelToDash(styleName) + ":" + style[classNameOrId][styleName] + " !important;";
        });
        idStyles += '#payjs-' + classNameOrId + " {" + cssStyle + "}"
      }
    });

    style['nonExistentRandomClass'] = {
      display: 'block; } ' + idStyles.substr(0, idStyles.length - 2)
    };

    return style;
  },

  camelToDash = function(str) {
    return str.replace(/([A-Z])/g, function($1) {
        return "-" + $1.toLowerCase();
    });
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
    sandbox: false,

    production_processor_url: 'https://www.usaepay.com/js/v1/pay.js',

    sandbox_processor_url: 'https://sandbox.usaepay.com/js/v1/pay.js',

    api_key: null,

    el: null,

    style: {},

    cvv_required: true,

    extended_response: false,
  },

  errors = {
    INVALID_CARD_LENGTH: 'INVALID_CARD_LENGTH',
    INVALID_CARD_NUMBER: 'INVALID_CARD_NUMBER',
    INVALID_CARD_INFORMATION: 'INVALID_CARD_INFORMATION',
    CARD_NUMBER_IS_REQUIRED: 'CARD_NUMBER_IS_REQUIRED',
    EXPIRATION_DATE_IS_REQUIRED: 'EXPIRATION_DATE_IS_REQUIRED',
    CARD_IS_EXPIRED: 'CARD_IS_EXPIRED',
    CVV_IS_REQUIRED: 'CVV_IS_REQUIRED',
    VALID_AUTHENTICATION_REQUIRED: 'VALID_AUTHENTICATION_REQUIRED',
    SOURCE_KEY_NOT_FOUND: 'SOURCE_KEY_NOT_FOUND'
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
      'cvv is required': errors.CVV_IS_REQUIRED,
      'Valid authentication required': errors.VALID_AUTHENTICATION_REQUIRED,
      'Specified source key not found.': errors.SOURCE_KEY_NOT_FOUND,
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

  errorListenerRegistered = false,

  /**
   * Tratta Fields Constructor
   */
  TrattaFields = function (options) {
    if (options.api_key === null) {
      throw 'API key is not specified.'
    } else if (options.id === null) {
      throw 'Element ID is not specified.'
    }

    this.options = this.config(options);
  };

  /**
   * public Tratta Fields API
   */
  TrattaFields.prototype = {
    options: {},

    blurCallback: function () {},

    client: null,

    paymentCard: null,

    elementId: null,

    /**
     * configure functionality
     */
    config: function (options) {
      options = extend(defaults, options, true);
      options.style = addIdStyles(options.style);

      return options;
    },

    mount: function (elementId) {
      var self = this;
      self.elementId = elementId,

      init = function () {
        if (self.client === null) {
          self.client = new usaepay.Client(self.options.api_key);
        }

        if (self.paymentCard === null) {
          self.paymentCard = self.client.createPaymentCardEntry();
        }

        self.paymentCard.generateHTML(self.options.style, {
          cvv_required: self.options.cvv_required,
          extended_response: self.options.extended_response,
        });

        self.paymentCard.addHTML(elementId);

        if (!errorListenerRegistered) {
          self.paymentCard.addEventListener('error', function (errorMessage) {
            self.blurCallback(formatError(errorMessage));
          });
          errorListenerRegistered = true;
        }
      };

      var processor_url = this.options.sandbox ? this.options.sandbox_processor_url : this.options.production_processor_url;

      injectScript(processor_url, init);
    },

    unmount: function () {
      if (this.elementId === null) {
        throw 'Cannot unmount Tratta Fields. Element id is not specified.'
      }

      var container = document.getElementById(this.elementId);

      if (container) {
        container.innerHTML = '';
      }
    },

    on: function (eventType, callback) {
      if (eventType === 'blur') {
        this.blurCallback = callback;
      }
    },

    createToken: function () {
      var self = this;

      return this.client
        .getPaymentKey(this.paymentCard)
        .then(function (result) {
          if (result.error) {
            //
          } else {
            if (self.options.extended_response) {
              return JSON.parse(result);
            }

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