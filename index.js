"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
/**
 * MAIN
 * @param routes {RouteInterface[]}
 * @param options {OptionsInterface}
 * @return {express.Router}
 */
function main(routes, options) {
    const Router = express_1.default.Router();
    fillingRouter(Router, routes, options);
    return Router;
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
function fillingRouter(Router, routes, options, parentUrl = '', parentMiddleware = []) {
    for (const route of routes) {
        if (route.dev && process.env.NODE_ENV === 'production') {
            continue;
        }
        const url = parentUrl + (route.url || '');
        const middleware = [...parentMiddleware];
        if (route.middleware) {
            const middlewareHandlers = Array.isArray(route.middleware) ? route.middleware : [route.middleware];
            for (const middlewareHandler of middlewareHandlers) {
                switch (typeof middlewareHandler) {
                    case 'string':
                        middleware.push(require(options.middlewareDir + '/' + middlewareHandler));
                        break;
                    case 'function':
                        middleware.push(middlewareHandler);
                        break;
                }
            }
        }
        if (route.method && route.controller) {
            const controller = getController(route.controller, options);
            Router[route.method](url, ...middleware, controller);
        }
        if (route.children?.length) {
            fillingRouter(Router, route.children, options, url, middleware);
        }
    }
}
/**
 * GET-CONTROLLER
 * @param controller {express.Handler | string}
 * @param options {OptionsInterface}
 * @return {express.Handler}
 */
function getController(controller, options) {
    switch (typeof controller) {
        case 'function': {
            return controller;
        }
        case 'string': {
            const [controllerPath, controllerMethod] = controller.split('.');
            const _controller = require(options.controllersDir + '/' + controllerPath);
            if (controllerMethod) {
                return _controller[controllerMethod];
            }
            else {
                return _controller;
            }
        }
    }
}
module.exports = main;
