# vue-pilot
A Trie-based vue router with the ability of managing history.state.

## Install

```
npm install vue-pilot
```

## Features
* Small (8kb after gzipped).
* Ability of managing history.state.
* Decoupling UI layout from URL segments.
* Dispatching route without changing URL.
* Typed query and params.

## Table of Contents
- [vue-pilot](#vue-pilot)
  - [Install](#install)
  - [Features](#features)
  - [Table of Contents](#table-of-contents)
  - [Constructor](#constructor)
    - [PathRouter](#pathrouter)
    - [HashRouter](#hashrouter)
  - [\<RouterView>](#routerview)
  - [\<RouterLink>](#routerlink)
  - [Location object](#location-object)
    - [path](#path)
    - [external](#external)
    - [query](#query)
    - [hash](#hash)
    - [fullPath](#fullpath)
    - [url](#url)
    - [state](#state)
    - [hidden](#hidden)
    - [appearPath](#appearpath)
  - [Matched route object](#matched-route-object)
    - [path](#path-1)
    - [query](#query-1)
    - [hash](#hash-1)
    - [fullPath](#fullpath-1)
    - [url](#url-1)
    - [params](#params)
    - [meta](#meta)
  - [Routes definition](#routes-definition)
  - [APIs](#apis)
    - [router.current](#routercurrent)
    - [router.start()](#routerstart)
    - [router.normalize()](#routernormalize)
    - [router.url()](#routerurl)
    - [router.push()](#routerpush)
    - [router.replace()](#routerreplace)
    - [router.dispatch()](#routerdispatch)
    - [router.setState()](#routersetstate)
    - [router.go()](#routergo)
    - [router.back()](#routerback)
    - [router.forward()](#routerforward)
    - [router.captureLinkClickEvent()](#routercapturelinkclickevent)
    - [router.on()](#routeron)
    - [router.off()](#routeroff)
  - [Events](#events)
    - [beforeChange](#beforechange)
      - [Arguments](#arguments)
      - [Returns](#returns)
    - [beforeUpdate](#beforeupdate)
    - [afterChange](#afterchange)
  - [Dependencies](#dependencies)
  - [License](#license)

## Constructor

### PathRouter

```js
import Vue from 'vue'
import { PathRouter } from 'vue-pilot'

Vue.use(PathRouter)

const router = new PathRouter({
  routes: [
    // see routes definition below
  ],

  base: '/app/',
  origin: 'https://www.example.com/'
})

const app = new Vue({
  // inject the router instance
  router,
  
  // ...
})

router.start()
```

`base`: `String`. defines the base path of the app. If you want the root path not end with slash,
you can set the base without ending slash, like '/app'. Defaults to `''`.

`origin`: `String` | `Array<String>`. Let `<RouterLink>` treats absolute URLs with `origin` as in-app links.

### HashRouter

```js
import Vue from 'vue'
import { HashRouter } from 'vue-pilot'

Vue.use(HashRouter)

const router = new HashRouter({
  routes: [
    // ...
  ]
})
```

`HashRouter` doesn't have `base` option.

## \<RouterView>

The `<RouterView>` is a functional component that renders the matched component.

It has a `name` property.  The default value is `default`.

Example:

```html
<div id="app">
  <RouterView name="aside">
  <RouterView />
</div>
```

## \<RouterLink>

```html
<RouterLink to="/list?page=1">List</RouterLink>
<RouterLink to="/home" target="_blank">Open new tab</RouterLink>

<RouterLink
  tag="div"
  action="replace"
  :to="{ path: '/category', query: { cat: 'shoes' }, state: { from: 'home' } }"
>
  Shoes
</RouterLink>

<RouterLink to="https://www.example.com">external link</RouterLink>
```

The `<RouterLink>` is a navigation component, it normally renders an `<a>` element.

* `to`: `Location` object, or `path`/`fullPath` of the `Location` object, or an absolute URL.
* `action`: `String`. `push`, `replace`, or `dispatch`. Defaults to `push`.
* `tag`: `String`. The HTML tag name. Defaults to `a`.

`<RouterLink>` will have `active` class if it equals to the current path.

## Location object
A location object is used for changing the current address.
It can be used in `<RouterLink :to="location">`, `router.start(location)`, `router.push(location)`, `router.replace(location)`, `router.dispatch(location)`, etc.

A string URL can be converted to a location object by [router.normalize()](#routernormalize).
And a location object can be converted to a URL string by [router.url()](#routerurl).

```js
{
  path,
  external,
  query,
  hash,
  fullPath,
  url,
  state,
  hidden,
  appearPath
}
```

### path
`String`

Router internal path, which has stripped the protocol, host, and base path.

### external
`Boolean`

If `path` is started with protocal, or `external` is `true`,
`path` is treated as an external path, and will be converted to an internal path.

### query
`Object` | `String` | `Array` | `URLSearchParams` | `StringCaster<URLSearchParams>`

`query` accepts the same parameter types as [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams)
constructor. Or it can be a [StringCaster](https://github.com/jiangfengming/cast-string#stringcaster) object that wraps a `URLSearchParams` object.

### hash
`String`

A string containing a `#` followed by the fragment identifier of the URL.
If `HashRouter` is used, the fragment identifier is followed by the second `#` mark.

### fullPath
`String`. Read-only.

path + query string + hash

### url
`String`. Read-only.

An external relative URL which can be used as `href` attribute of `<a>`.
It is the same as `router.url(location)`.

* `PathRouter`: base + path + query string + hash
* `HashRouter`: # + path + query string + hash

### state
`Object`

The state object is a JavaScript object which is associated with the history entry.
See `state` parameter of [history.pushState()](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) for details.

### hidden
`Boolean`

Indicate whether it is a hidden history entry. see [router.push()](#routerpush) for detail.

### appearPath
`String`

If `hidden` is `true` and `appearPath` is set, the location bar will show this address instead.

## Matched route object
A matched route object contains the information of the matched route.
It contains some same properties as the `Location` object, and some extra properties.
It's provided by the hook functions as the `to` and `from` parameter.

```js
{
  path,
  query,
  hash,
  fullPath,
  url,
  state,
  params,
  meta
}
```

### path
`String`

Same as `location.path`.

### query
`StringCaster`

A [StringCaster](https://github.com/jiangfengming/cast-string#stringcaster) object that wraps a `URLSearchParams` object.

### hash
`String`

Same as `location.hash`.

### fullPath
`String`

Same as `location.fullPath`.

### url
`String`

Same as `location.url`.

### params
`StringCaster`

A [StringCaster](https://github.com/jiangfengming/cast-string#stringcaster) object that wraps a plain object.
The plain object is collected from the path segments.
See [Routes definition](#routes-definition) below for details.

### meta
`Object`

A object collected from the route definiton. See [Routes definition](#routes-definition) below for details.

## Routes definition

```js
const routes = [
  {
    name: 'aside', // will be mounted into <RouterView name="aside">
    component: { /* component definition */ }
  },

  {
    path: '/basic',

    // Definition without `name`.
    // The component will be mounted into <RouterView name="default">
    component: { /* component definition */ }
  },

  // Return promise to define async components
  { path: '/async', component: () => import('./Component.vue') },

  {
    path: '/prop',

    // Pass some props to the component
    props: { foo: 'hello' },

    component: {
      props: ['foo'],
      // ...
    }
  },

  {
    // Use `:paramName` to define params
    // More pattern syntax, see https://github.com/jiangfengming/url-router
    path: '/article/:id',

    // props can be a factory function, it receives the current route object as the first argument.
    props: route => ({
      articleId: route.params.int('id'),
      foo: route.query.string('foo'),
      bar: route.state.bar
    }),

    component: {
      props: ['articleId', 'foo', 'bar'],
      // ...
    },

    // Setting key attribute of the <RouterView>.
    // It will re-create the component instead of reusing it when key changes.
    // So you needn't to watch the prop changes.
    // See https://vuejs.org/v2/api/#key
    // If key is a function, the returned value will be the key
    key: route => route.params.int('id')
  },

  {
    // param with regex
    path: '/date/:year(\\d+)-:month(\\d+)',
    component: VFoo,
    props: route => ({ foo: route.params.int('year'), bar: route.params.int('month') })
  },

  // Define hooks
  {
    path: '/login',

    // beforeEnter hook will be called before confirming the navigation.
    // See global `beforeChange` event for details.
    // Function | Array<Function>
    // `this` refers to the router instance.
    beforeEnter(to, from, action, router) {

    },

    component: {
      // in-component beforeRouteLeave hook.
      // Will be called before route leave.
      // See global `beforeChange` event for details.
      // Function | Array<Function>
      // `this` refers to the vue component instance.
      beforeRouteLeave(to, from, action, router) {

      },

      // ...
    }
  },


  // Use array to group <RouterView> definitions
  // Router view definitions in array will override outer definitions which has the same name.
  [
    {
      name: 'aside',
      component: { /* ... */}
    },

    {
      // In this layout, the default <RouterView> will mount a component that has nested <RouterView>s
      component: {
        props: ['activeTab'],

        // Define two child <RouterView>s
        template: `
          <RouterView />
          <RouterView name="footer" />
        `
      },

      // Define some meta
      meta: { activeTab: 'main' },

      // route.meta.activeTab is "foo" when path is "/foo"
      props: route => ({ activeTab: route.meta.activeTab })

      // Define child <RouterView>s
      children: [
        {
          name: 'footer',
          component: { /* ... */ }
        },

        {
          path: '/foo',
          component: { /* ... */ },

          // Parent route meta and child route meta will be merged together.
          // If child route meta has same keys as parent, it will override parent ones.
          meta: { activeTab: 'foo' }
        },

        [
          // Override footer
          {
            name: 'footer',
            component: { /* ... */ }
          },

          {
            path: '/bar',
            component: { /* ... */},

            // meta can be a factory function
            meta: route => ({ activeTab: route.query.string('active') })
          }
        ],

        // Define a catch-all route
        {
          path: '(.*)',
          component: {
            template: '<h1>404 Not Found</h1>'
          }
        }
      ]
    }
  ]
]
```

## APIs
Most of the APIs are proxied to [spa-history](https://github.com/jiangfengming/spa-history).

In the vue instance, you can get the router object from `this.$router`.

### router.current
The current [matched route object](#matched-route-object).

### router.start()

```js
router.start(URL string | location)
```

Starts the router.

In browser, if URL/location is not given, the default value is the current address.

### router.normalize()

```js
router.normalize(URL string | location)
```

converts the URL string or unnormalized location object to a normalized object.

if URL/location.path is started with protocal, or `location.external` is `true`, `location.path` is treated as an external path, and will be converted to an internal path.

```js
// PathRouter with base '/foo/bar/'
router.normalize('http://www.example.com/foo/bar/home?a=1#b')
/*
  {
    path: '/home',
    query: new StringCaster(new URLSearchParams('a=1')),
    hash: '#b',
    fullPath: '/home?a=1#b',
    state: {}
  }
*/

// same result as above
router.normalize({
  path: '/foo/bar/home?a=1#b',
  external: true
})

// same result as above
router.normalize('/home?a=1#b')

// same result as above
router.normalize({
  path: '/home',
  query: {
    a: 1
  },
  hash: '#b'
})

// HashRouter
// same result as above
router.normalize('http://www.example.com/app/#/home?a=1#b')
```

The `query` property can be of type `Object`, `String` or `Array`. see [URLSearchParams()](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams) for detail.

### router.url()

```js
router.url(URL string | location)
```

Converts an internal URL string or location object to an external relative URL which can be set as `href` attribute of `<a>`.

```js
router.url({
  path: '/home',
  query: {
    a: 1
  },
  hash: '#b'
})

// or
router.url('/home?a=1#b')

/*
  result:
  HashRouter: #/home?a=1#b
  PathRouter(with base: '/foo/bar/'): /foo/bar/home?a=1#b
*/
```

### router.push()

```js
router.push(URL string | location)
```

Pushs the location onto the history stack. `beforeChange` event will be fired.

```js
router.push('/home?a=1#b')

router.push({
  path: '/home',
  query: {
    a: 1
  },
  hash: '#b'
})

// PathRouter, complete URL
router.push('http://www.example.com/foo/bar/home?a=1#b')

// HashRouter, complete URL
router.push('http://www.example.com/#/home?a=1#b')
```

You can push a location with state.

```js
router.push({
  path: '/home',
  state: {
    foo: 1,
    bar: 2
  }
})
```

And you can push a hidden location, which will not change the value of browser's address bar. the hidden location is stored in `window.history.state`

```js
router.push({
  path: '/login',
  state: {
    foo: 1
  },

  // '/login' won't show in the location bar
  hidden: true,

  // optional. if set, the location bar will show this address instead
  appearPath: '/buy'
})
```

### router.replace()

```js
router.replace(URL string | location)
```

Replaces the current history entry with the location specified.

### router.dispatch()

```js
router.dispatch(URL string | location)
```

Dispatchs the route without changing the history. That is, the location of browser's address bar won't be changed.

### router.setState()

```js
router.setState(state)
```

Sets state of the current route. the state will be merged into `router.current.state`

### router.go()

```js
router.go(position, { silent = false, state = null } = {})
```

Counterpart of `window.history.go()`. Returns a promise which will be resolved when `popstate` event fired.

`silent`: if true, `beforeChange` event won't be fired.

`state`: if set, the state object will be merged into the state object of the destination location.

### router.back()

```js
router.back(options)
```

Alias of `router.go(-1, options)`

### router.forward()

```js
router.forward(options)
```

Alias of `router.go(1, options)`

### router.captureLinkClickEvent()

```js
router.captureLinkClickEvent(event)
```

Prevents the navigation when clicking the `<a>` element in the container and `href` is an in-app address,
`router.push()` will be called instead.

```html
<div @click="$router.captureLinkClickEvent($event)">
  <a href="/foo">foo</a>
</div>
```

### router.on()

```js
router.on(event, callback, { once = false, beginning = false })
```

Adds a callback function that will be called when the specified event fires.

If `once` is `true`, the callback function will be removed after 

If `beginning` is `true`, the callback function will be inserted at the beginning of the callback array,
so it will be called first.

### router.off()

```js
router.off(event, callback, { once = true })
```

Removes the specified event callback.

## Events

### beforeChange

```js
router.on('beforeChange', function(to, from, action, router) {
  // ...
})
```

The `beforeChange` hook will be called before confirming the navigation.
`this` refers to the router instance.

#### Arguments
* to: Route object. The route will be changed to.
* from: Route object. The current route.
* action:
    - push: router.push() is called.
    - replace: router.replace() is called.
    - init: "to" is the initial page, at this stage, "from.path" is null.
    - pop: user clicked the back or foraward button , or router.go(), router.back(), router.forward() is called, or hash changed.
    - dispatch: router.dispatch() is called.
* router: the router instance

#### Returns

The hook can return one of the following values, or a promise that resolves with one of the following values,
to control the navigation:

* true | undefined: The navigation is confirmed.
* false: Prevent the navigation.
* null: Do nothing.
* location: Redirect to this location.
            You can override the history manipulate action by providing location.action property, values are: 'push', 'replace', 'dispatch'.

### beforeUpdate

```js
router.on('beforeUpdate', function(to, from, action, router) {
  // ...
})
```

The `beforeUpdate` hook will be called after the history has been changed but before updating the `<RouterView>`s.
`this` refers to the router instance.

Returning `false` or a promise that resolves with `false` can prevent to update the `<RouterView>`s.

### afterChange

```js
router.on('afterChange', function(to, from, action, router) {
  // ...
})
```

The `afterChange` hook will be called after `<RouterView>`s have been updated.
`this` refers to the router instance.

## Dependencies
- [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL)
- [Object.assign()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
- [Element.closest()](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest)

You can use [@babel/polyfill](https://babeljs.io/docs/en/babel-polyfill/) and
[dom4](https://github.com/WebReflection/dom4) to meet the requirements.

Or use the [polyfill.io](https://polyfill.io/) service:
```html
<script src="https://polyfill.io/v3/polyfill.min.js"></script>
```

## License
[MIT](LICENSE)
