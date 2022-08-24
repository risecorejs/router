import express from 'express';
import { IRoute, IOptions } from './interfaces';
export = main;
/**
 * MAIN
 * @param routes {IRoute[]}
 * @param options {IOptions}
 * @return {express.Router}
 */
declare function main(routes: IRoute[], options: IOptions): express.Router;
