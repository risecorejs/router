import express from 'express';
import { RouteInterface, OptionsInterface } from './interfaces';
export = main;
/**
 * MAIN
 * @param routes {RouteInterface[]}
 * @param options {OptionsInterface}
 * @return {express.Router}
 */
declare function main(routes: RouteInterface[], options: OptionsInterface): express.Router;
