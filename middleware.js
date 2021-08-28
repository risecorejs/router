const express = require('express')

const Router = express.Router()

module.exports = (routes, paths) => {
  const recursiveFilling = (routes, parentUrl = '', parentMiddleware = []) => {
    for (const route of routes) {
      if (process.env.NODE_ENV === 'production' && route.dev) {
        continue
      }

      const url = parentUrl + (route.url ?? '')
      const middleware = [...parentMiddleware]

      if (route.middleware) {
        const handlers = Array.isArray(route.middleware)
          ? route.middleware
          : [route.middleware]

        for (const handler of handlers) {
          if (typeof handler === 'string') {
            middleware.push(require(paths.middleware + '/' + handler))
          } else if (typeof handler === 'function') {
            middleware.push(handler)
          }
        }
      }

      if (route.method && route.controller) {
        const method = route.method.toLowerCase()
        const [controllerPath, controllerMethod] = route.controller.split('.')

        const controller = require(paths.controllers + '/' + controllerPath)

        Router[method](
          url,
          ...middleware,
          controllerMethod ? controller[controllerMethod] : controller
        )
      }

      if (route.children?.length) {
        recursiveFilling(route.children, url, middleware)
      }
    }
  }

  recursiveFilling(routes)

  return Router
}
