import UrlRouter from 'url-router'
import RouterView from './RouterView'
import RouterLink from './RouterLink'

export default class {
  static install(Vue) {
    Vue.component('router-view', RouterView)
    Vue.component('router-link', RouterLink)

    Vue.mixin({
      beforeCreate() {
        if (!this.$root.$options.router) return

        if (this.$options.router) {
          this.$router = this.$options.router

          // make current route reactive
          this.$route = new Vue({
            data: { route: this.$router.current }
          }).route
        } else {
          this.$router = this.$root.$router

          if (this.$vnode && this.$vnode.data._routerView) {
            const hooks = this.$root.$route._beforeLeaveHooksInComp
            const options = this.constructor.extendOptions

            if (options.extends && options.extends.beforeRouteLeave) {
              hooks.push(options.extends.beforeRouteLeave.bind(this))
            }

            if (options.mixins) {
              options.mixins.forEach(mixin => {
                if (mixin.beforeRouteLeave) {
                  hooks.push(mixin.beforeRouteLeave.bind(this))
                }
              })
            }

            if (options.beforeRouteLeave) {
              hooks.push(options.beforeRouteLeave.bind(this))
            }
          }
        }
      }
    })
  }

  constructor({ routes }) {
    this._routes = this._parseRoutes(routes)
    this._urlRouter = new UrlRouter(this._routes)
    this._beforeChangeHooks = []
    this._afterChangeHooks = []
    this._errorHooks = []

    this.current = {
      path: null,
      query: {},
      hash: null,
      fullPath: null,
      state: {},
      params: {},
      meta: {},
      _routerViews: null
    }
  }

  beforeChange(hook) {
    this._beforeChangeHooks.push(hook)
  }

  afterChange(hook) {
    this._afterChangeHooks.push(hook)
  }

  onError(hook) {
    this._errorHooks.push(hook)
  }

  _parseRoutes(routerViews, depth = [], parsed = []) {
    for (const routerView of routerViews) {
      if (routerView.constructor === Array) {
        const names = routerView.map(c => c.name)
        const children = [
          ...routerView,
          ...routerViews.filter(v => v.constructor !== Array && !v.path && !names.includes(v.name))
        ]
        this._parseRoutes(children, depth, parsed)
      } else if (routerView.path) {
        const children = [
          routerView,
          ...routerViews.filter(v => v.constructor !== Array && !v.path && v.name !== routerView.name)
        ]

        parsed.push([
          'GET',
          routerView.path,
          [...depth, children],
          (matchedRoute, { to, from, op }) => {
            to.params = matchedRoute.params
            to._layout = this._resolveRoute(to, matchedRoute.handler)
            this._generateMeta(to)
            return routerView.test ? routerView.test(to, from, op) : true
          }
        ])
      } else if (routerView.children) {
        const children = [
          routerView,
          ...routerViews.filter(v => v.constructor !== Array && !v.path && v.name !== routerView.name)
        ]
        this._parseRoutes(routerView.children, [...depth, children], parsed)
      }
    }

    return parsed
  }

  _beforeChange(to, from, op) {
    return new Promise(resolve => {
      const route = to.route = {
        path: to.path,
        fullPath: to.fullPath,
        query: to.query,
        hash: to.hash,
        state: to.state,
        meta: {},
        _beforeLeaveHooksInComp: [],
        _beforeEnterHooks: [],
        _asyncComponents: [],
        _meta: []
      }

      const _route = this._urlRouter.find('GET', to.path, {
        to: route,
        from: this.current,
        op
      })

      if (!_route) return false

      let promise = Promise.resolve(true)

      ;[].concat(
        this.current.path ? this.current._beforeLeaveHooksInComp : [], // not landing page
        this._beforeChangeHooks,
        route._beforeEnterHooks
      ).forEach(hook =>
        promise = promise.then(() =>
          Promise.resolve(hook(route, this.current, op)).then(result => {
            // if the hook abort or redirect the navigation, cancel the promise chain.
            if (!(result === true || result == null)) throw result
          })
        )
      )

      promise.catch(e => {
        if (e instanceof Error) throw e // encountered unexpected error
        else return e // the result of cancelled promise
      }).then(result => resolve(result))
    })
  }

  _generateMeta(route) {
    if (route._meta.length) {
      route._meta.forEach(m => Object.assign(route.meta, m.constructor === Function ? m(route) : m))
    }
  }

  _change(to) {
    let promise = Promise.resolve(true)

    this._afterChangeHooks.forEach(hook =>
      promise = promise.then(() =>
        Promise.resolve(hook(to.route, this.current)).then(result => {
          if (result === false) throw result
        })
      )
    )

    promise.then(() => {
      Promise.all(to.route._asyncComponents.map(comp => comp())).then(() => {
        Object.assign(this.current, to.route)
      }).catch(e => this._handleError(e))
    }).catch(e => {
      if (e !== false) throw e
    })
  }

  _handleError(e) {
    this._errorHooks.forEach(hook => hook(e))
  }

  _resolveRoute(route, depth) {
    const layout = {}
    let current = layout

    for (const routerViews of depth) {
      current.children = {}

      for (const routerView of routerViews) {
        current.children[routerView.name || 'default'] = Object.assign({}, routerView)
      }

      current = current.children[routerViews[0].name || 'default']
    }

    delete current.path

    return this._resolveRouterViews(route, layout.children)
  }

  _resolveRouterViews(route, routerViews) {
    const resolved = {}

    for (const name in routerViews) {
      const routerView = routerViews[name]

      if (routerView.constructor === Array || routerView.path) continue

      const v = resolved[name] = { props: routerView.props }

      if (routerView.meta) {
        route._meta.push(routerView.meta)
      }

      if (routerView.beforeEnter) {
        route._beforeEnterHooks.push(routerView.beforeEnter)
      }

      if (routerView.component && routerView.component.constructor === Function) {
        route._asyncComponents.push(() => routerView.component().then(m => v.component = m.__esModule ? m.default : m))
      } else {
        v.component = routerView.component
      }

      if (routerView.children) {
        v.children = this._resolveRouterViews(route, routerView.children)
      }
    }

    return resolved
  }

  start(loc) {
    return this._history.start(loc)
  }

  normalize(loc) {
    return this._history.normalize(loc)
  }

  url(loc) {
    return this._history.url(loc)
  }

  dispatch(loc) {
    return this._history.dispatch(loc)
  }

  push(loc) {
    return this._history.push(loc)
  }

  replace(loc) {
    return this._history.replace(loc)
  }

  setState(state) {
    this._history.setState(state)

    // Vue can not react if add new prop into state
    // so we replace it with a new state object
    this.current.state = { ...this._history.current.state }

    // meta factory function may use state object to generate meta object
    // so we need to re-generate a new meta
    this._generateMeta(this.current)
  }

  go(n, opts) {
    return this._history.go(n, opts)
  }

  back(opts) {
    return this._history.back(opts)
  }

  forward(opts) {
    return this._history.forward(opts)
  }

  captureLinkClickEvent(e) {
    return this._history.captureLinkClickEvent(e)
  }
}
