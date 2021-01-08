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
  /**
   * Tratta Fields Constructor
   */
  TrattaFields = function (options) {
    console.log('hahaha it works');
  };

  return TrattaFields;
}));