/*
Original developed as PolymerLabs/polymer-cookie:
Copyright 2013 The Polymer Authors. All rights reserved.
*/
/**
The `fortune-cookie` element can be used to set and read cookies.
You should have one `fortune-cookie` element per cookie you want to use, defined in many elements by its `name` property.
You can then read the `value` of the cookie, or save the cookie by setting the `value` attribute or explicitly calling the `save` method.

##### Beast features

#### Choose to handle value as Object or String
#### Get when cookies expires with `on-fortune-cookie-expired` observer
#### Get when cookies loads empty with `on-fortune-cookie-load-empty` observer

Example
```html
    <fortune-cookie
      name="mycookie"
      value="{{object}}"
      on-handle-value-as="Object"
      on-fortune-cookie-expired="_onExpired"
      on-fortune-cookie-load-empty="_onLoadEmpty">
    </fortune-cookie>
```

Save:
```js
    this.$.mycookie.save();
```

Reload:
```js
    this.$.mycookie.load();
```

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '../@polymer/polymer/polymer-legacy.js';

Polymer({
  is: 'fortune-cookie',
  properties: {

    _EXPIRE_NOW: {
      type: String,
      value: 'Thu, 01 Jan 1970 00:00:00 GMT',
      readOnly: true
    },

    _FOREVER: {
      type: String,
      value: 'Fri, 31 Dec 9999 23:59:59 GMT',
      readOnly: true
    },

    _COOKIES_PROPS: {
      type: Object,
      value: function(){
        var defaultVal = {
          _expiresValue: 'expires',
          secure: 'secure',
          'max-age': 'max-age',
          path: 'path'
        };
        var isMicrosoftBrowser = document.documentMode || /Edge/.test(navigator.userAgent);
        if (!isMicrosoftBrowser){
          defaultVal['domain'] = 'domain';
        }
        return defaultVal;
      },
      readOnly: true
    },

    /**
     * Name of the cookie
     *
     * @attribute name
     * @type string
     */
    name: {
      type: String,
      observer: '_autoSave'
    },
    /**
     * Value of the cookie
     *
     * @attribute value
     * @type string
     */
    value: {
      notify: true,
      observer: '_autoSave'
    },

    _expiresValue: {
      computed: '_computedExpiresValue(expires)',
      observer: '_scheduleExpiresToRemove'
    },

    /**
     * Expiry-date of the cookie as Timestamp or UTC/GMT-formatted String.
     *
     * Examples:
     * * Timestamp: 1472064810435
     * * UTC/GMT-formatted: `"Sun, 15 Jul 2012 00:00:01 GMT"`
     *
     * @attribute expires
     * @type string
     * @default never
     */
    expires: {
      value: function(_FOREVER) {
        return new Date(_FOREVER).toUTCString();
      }
    },

    /**
     * Define the type value will be handled, possible values are 'string' or 'object'
     *
     * @attribute handleValueAs
     * @type boolean
     */
    handleValueAs: {
      type: String,
      value: 'string'
    },

    /**
     * If true, the cookie will be saved asynchronously when properties are changed
     *
     * @attribute saveAsync
     * @type boolean
     */
    saveAsync: {
      type: Boolean,
      value: false
    },
    /**
     * If true, cookie will only be transmitted over secure protocol as https
     *
     * @attribute secure
     * @type boolean
     * @default false
     */
    secure: {
      type: Boolean,
      value: false,
      observer: '_autoSave'
    },
    /**
     * The domain from where the cookie will be readable.
     * E.g., "example.com", ".example.com" (includes all subdomains)
     * or "subdomain.example.com"; if not specified, defaults to the
     * host portion of the current document location
     *
     * @attribute domain
     * @type string
     */
    domain: {
      type: String,
      observer: '_autoSave'
    },
    /**
     * The path from where the cookie will be readable.
     * E.g., "/", "/mydir"; if not specified, defaults to the current
     * path of the current document location.
     *
     * @attribute path
     * @type string
     */
    path: {
      type: String,
      observer: '_autoSave'
    },
    /**
     * The maximum age of the cookie in seconds.
     *
     * @attribute maxAge
     * @type number
     */
    maxAge: {
      type: Number,
      observer: '_autoSave'
    },
    /**
     * If true, the cookie will be automatically saved when properties are changed
     *
     * @attribute autoSave
     * @type boolean
     */
    autoSave: {
      type: Boolean,
      value: false
    },

    _expiresAsyncNumber: {
      type: Number
    }
  },
  ready: function() {
    this.load();
  },

  _scheduleExpiresToRemove: function() {
    if (this._expiresValue
            && this._expiresValue != 'Invalid Date'
            && this._expiresValue != this._FOREVER
            && this._expiresValue != this._EXPIRE_NOW) {

      this.cancelAsync(this._expiresAsyncNumber);

      var timeout = new Date(this._expiresValue).getTime() - new Date().getTime();
      this._expiresAsyncNumber = this.async(this._expiresWakeUp, timeout);
    } else if (this._expiresValue && this._expiresValue != 'Invalid Date') {
      this.cancelAsync(this._expiresAsyncNumber);
    }
  },

  _expiresWakeUp: function() {
    this.deleteCookie();
    this.fire('fortune-cookie-expired');
  },

  _computedExpiresValue: function(expires) {
    return expires ? new Date(expires).toUTCString() :
            new Date(this._FOREVER).toUTCString();
  },

  _autoSave: function() {
    if (this.autoSave) {
      this.save();
    }
  },

  _parseCookie: function() {
    var pairs = document.cookie.split(/\s*;\s*/);
    var map = pairs.map(function(kv) {
      var eq = kv.indexOf('=');
      return {
        name: decodeURI(kv.slice(0, eq)),
        value: decodeURIComponent(kv.slice(eq + 1))
      };
    });
    var nom = this.name;
    return map.filter(function(kv){ return kv.name === nom; })[0];
  },

  /**
   * Load or reload cookie attributes.
   *
   * @method isCookieStored
   */
  load: function() {
    var kv = this._parseCookie();
    var value = kv && kv.value;

    if (!value) {
      this.fire('fortune-cookie-load-empty', this.name);
    }
    else if (value && this.handleValueAs.toLowerCase() === 'object') {
      var object = JSON.parse(value);
      this.expires = object._expires || this._parseExpiresFromUTC(object.expires);
      this.value = object;
    } else {
      this.value = value.replace(/\"/g, '');
    }
  },

  _parseExpiresFromUTC: function(timestamp) {
    return timestamp && new Date(new Date(timestamp).toUTCString().substring(0, 25)).getTime();
  },

  /**
   * Returns true if the cookie is currently set.
   *
   * @method isCookieStored
   */
  isCookieStored: function() {
    return Boolean(this._parseCookie());
  },
  /**
   * Deletes the cookie.
   *
   * @method deleteCookie
   */
  deleteCookie: function() {
    this.async(function() {
      this.set('expires', this._EXPIRE_NOW);
      this.set('value');
      this.save();
    }.bind(this));
  },

  _prepareProperties: function() {
    var prepared = '';
    for (var k in this._COOKIES_PROPS) {
      if (this[k]) {
        prepared += (';' + this._COOKIES_PROPS[k] + '=' + this[k]);
      }
    }
    return prepared;
  },

  _getValueToSave: function() {
    if (this.value && this.handleValueAs.toLowerCase() === 'object') {
      this.value._expires = this.expires;
    }

    return this.value ? JSON.stringify(this.value) : encodeURI(this.value);
  },

  /**
   * Sets the cookie with the currently defined parameters.
   *
   * @method save
   */
  save: function(callback) {
    if (this.saveAsync) {
      this.debounce('save-cookie', this.atomicSave);
    } else {
      this.atomicSave();
      if (callback) {
        callback();
      }
    }
  },
  /**
   * Force synchronously save (no matter if you set saveAsync as true)
   *
   * @method atomicSave
   */
  atomicSave: function() {
    if (this.name && (this.value || this.expires === this._EXPIRE_NOW)) {
      document.cookie = encodeURI(this.name) + '=' + encodeURIComponent(this._getValueToSave()) + this._prepareProperties();
    }
  }
});
