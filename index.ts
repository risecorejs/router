import express from 'express'

import { RouteInterface, OptionsInterface } from './interfaces'

export = main

/**
 * MAIN
 * @param routes {RouteInterface[]}
 * @param options {OptionsInterface}
 * @return {express.Router}
 */
function main(routes: RouteInterface[], options: OptionsInterface): express.Router {
  const Router = express.Router()

  fillingRouter(Router, routes, options)

  return Router
}

/**
 * FILLING-ROUTER
 * @param Router {express.Router}
 * @param routes {RouteInterface[]}
 * @param options {OptionsInterface}
 * @param parentUrl {string}
 * @param parentMiddleware {express.Handler[]}
 * @return {void}
 */
function fillingRouter(
  Router: express.Router,
  routes: RouteInterface[],
  options: OptionsInterface,
  parentUrl: string = '',
  parentMiddleware: express.Handler[] = []
) {
  for (const route of routes) {
    if (route.dev && process.env.NODE_ENV === 'production') {
      continue
    }

    const url = parentUrl + (route.url || '')
    const middleware = [...parentMiddleware]

    if (route.middleware) {
      const middlewareHandlers = Array.isArray(route.middleware) ? route.middleware : [route.middleware]

      for (const middlewareHandler of middlewareHandlers) {
        switch (typeof middlewareHandler) {
          case 'string':
            middleware.push(require(options.middlewareDir + '/' + middlewareHandler))
            break

          case 'function':
            middleware.push(middlewareHandler)
            break
        }
      }
    }

    if (route.method && route.controller) {
      const controller = getController(route.controller, options)

      Router[route.method](url, ...middleware, controller)
    }

    if (route.children?.length) {
      fillingRouter(Router, route.children, options, url, middleware)
    }
  }
}

/**
 * GET-CONTROLLER
 * @param controller {express.Handler | string}
 * @param options {OptionsInterface}
 * @return {express.Handler}
 */
function getController(controller: express.Handler | string, options: OptionsInterface): express.Handler {
  switch (typeof controller) {
    case 'function': {
      return controller
    }

    case 'string': {
      const [controllerPath, controllerMethod] = controller.split('.')

      const _controller = require(options.controllersDir + '/' + controllerPath)

      if (controllerMethod) {
        return _controller[controllerMethod]
      } else {
        return _controller
      }
    }
  }
}
