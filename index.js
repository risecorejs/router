const express = require('express')

/**
 * ROUTER
 * @param routes {Array}
 * @param paths {{
 *   controllers: string,
 *   middleware: string
 * }}
 * @return {Object}
 */
module.exports = (routes, paths) => {
  const Router = express.Router()

  recursive(routes, paths, Router)

  return Router
}

/**
 * RECURSIVE
 * @param routes {Array}
 * @param paths {{
 *   controllers: string,
 *   middleware: string
 * }}
 * @param Router {Object}
 * @param parentUrl {string}
 * @param parentMiddleware {Array}
 */
function recursive(routes, paths, Router, parentUrl = '', parentMiddleware = []) {
  for (const route of routes) {
    if (process.env.NODE_ENV === 'production' && route.dev) {
      continue
    }

    const url = parentUrl + (route.url || '')
    const middleware = [...parentMiddleware]

    if (route.middleware) {
      const handlers = Array.isArray(route.middleware) ? route.middleware : [route.middleware]

      for (const handler of handlers) {
        if (typeof handler === 'string') {
          middleware.push(require(paths.middleware + '/' + handler))
        } else if (typeof handler === 'function') {
          middleware.push(handler)
        }
      }
    }

    if (route.method && route.controller) {
      const httpMethod = route.method.toLowerCase()

      const controller = getController(route.controller, paths)

      Router[httpMethod](url, ...middleware, controller)
    }

    if (route.children?.length) {
      recursive(route.children, paths, Router, url, middleware)
    }
  }
}

/**
 * GET-CONTROLLER
 * @param controller {Function|string}
 * @param paths {{
 *   controllers: string,
 *   middleware: string
 * }}
 * @return {any}
 */
function getController(controller, paths) {
  switch (typeof controller) {
    case 'function': {
      return controller
    }

    case 'string': {
      const [filePath, method] = controller.split('.')

      const _controller = require(paths.controllers + '/' + filePath)

      if (method) {
        return _controller[method]
      } else {
        return _controller
      }
    }
  }
}
