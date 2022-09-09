import express from 'express'
import path from 'path'

import { IRoute, IOptions } from './interfaces'
import { THTTPMethod } from './types'

/**
 * ROUTER
 * @param routes {IRoute[]}
 * @param options {IOptions}
 * @return {express.Router}
 */
export default function (routes: IRoute[], options?: IOptions): express.Router {
  options ||= {}
  options.controllersDir ||= path.resolve('controllers')
  options.middlewareDir ||= path.resolve('middleware')

  const Router = express.Router()

  fillingRouter(Router, routes, options)

  return Router
}

/**
 * FILLING-ROUTER
 * @param Router {express.Router}
 * @param routes {IRoute[]}
 * @param options {IOptions}
 * @param parentUrl {string}
 * @param parentMiddleware {express.Handler[]}
 * @return {void}
 */
function fillingRouter(
  Router: express.Router,
  routes: IRoute[],
  options: IOptions,
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
          case 'function':
            middleware.push(middlewareHandler)
            break

          case 'string':
            middleware.push(require(path.join(<string>options.middlewareDir, middlewareHandler)).default)
            break
        }
      }
    }

    if (route.method && route.controller) {
      const controller = getController(route.controller, options)

      Router[<Lowercase<THTTPMethod>>route.method.toLowerCase()](url, ...middleware, controller)
    }

    if (route.children?.length) {
      fillingRouter(Router, route.children, options, url, middleware)
    }
  }
}

/**
 * GET-CONTROLLER
 * @param controller {express.Handler | string}
 * @param options {IOptions}
 * @return {express.Handler}
 */
function getController(controller: express.Handler | string, options: IOptions): express.Handler {
  switch (typeof controller) {
    case 'function': {
      return controller
    }

    case 'string': {
      const [controllerPath, controllerMethod] = controller.split('.')

      const controllerFullPath = path.join(<string>options.controllersDir, controllerPath)

      if (controllerMethod) {
        return require(controllerFullPath)[controllerMethod]
      } else {
        return require(controllerFullPath).default
      }
    }
  }
}
