"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
/**
 * MAIN
 * @param routes {IRoute[]}
 * @param options {IOptions}
 * @return {express.Router}
 */
function main(routes, options) {
    options ||= {};
    options.controllersDir ||= path_1.default.resolve('controllers');
    options.middlewareDir ||= path_1.default.resolve('middleware');
    const Router = express_1.default.Router();
    fillingRouter(Router, routes, options);
    return Router;
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
                    case 'function':
                        middleware.push(middlewareHandler);
                        break;
                    case 'string':
                        middleware.push(require(options.middlewareDir + '/' + middlewareHandler));
                        break;
                }
            }
        }
        if (route.method && route.controller) {
            const controller = getController(route.controller, options);
            Router[route.method.toLowerCase()](url, ...middleware, controller);
        }
        if (route.children?.length) {
            fillingRouter(Router, route.children, options, url, middleware);
        }
    }
}
/**
 * GET-CONTROLLER
 * @param controller {express.Handler | string}
 * @param options {IOptions}
 * @return {express.Handler}
 */
function getController(controller, options) {
    switch (typeof controller) {
        case 'function': {
            return controller;
        }
        case 'string': {
            const [controllerPath, controllerMethod] = controller.split('.');
            const controllerFullPath = options.controllersDir + '/' + controllerPath;
            if (controllerMethod) {
                return require(controllerFullPath)[controllerMethod];
            }
            else {
                return require(controllerFullPath);
            }
        }
    }
}
module.exports = main;
