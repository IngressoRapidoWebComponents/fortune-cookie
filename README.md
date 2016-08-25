[![bower version](https://img.shields.io/bower/v/fortune-cookie.svg)](https://libraries.io/bower/fortune-cookie)
[![open issues](https://img.shields.io/github/issues/IngressoRapidoWebComponents%2Ffortune-cookie.svg)](https://github.com/IngressoRapidoWebComponents/fortune-cookie/issues)
[![license](https://img.shields.io/github/license/IngressoRapidoWebComponents%2Ffortune-cookie.svg)](https://github.com/IngressoRapidoWebComponents/fortune-cookie/blob/master/LICENSE)


# \<fortune-cookie\>

The `fortune-cookie` element can be used to set and read cookies.
You should have one `fortune-cookie` element per cookie you want to use, defined in many elements by its `name` property.
You can then read the `value` of the cookie, or save the cookie by setting the `value` attribute or explicitly calling the `save` method.

_[Demo and API docs](https://ingressorapidowebcomponents.github.io/components/fortune-cookie/)_

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

Realod:
```js
    this.$.mycookie.load();
```