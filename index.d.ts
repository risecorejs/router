import express from 'express';
import { IRoute, IOptions } from './interfaces';
/**
 * ROUTER
 * @param routes {IRoute[]}
 * @param options {IOptions}
 * @return {express.Router}
 */
export default function (routes: IRoute[], options?: IOptions): express.Router;
