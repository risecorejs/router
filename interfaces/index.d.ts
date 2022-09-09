import express from 'express';
import { THTTPMethod } from '../types';
export interface IRoute {
    group?: string;
    dev?: boolean;
    url?: string;
    method?: THTTPMethod;
    middleware?: express.Handler | string | (express.Handler | string)[];
    controller?: express.Handler | string;
    docs?: {
        [id: string]: any;
    };
    children?: IRoute[];
}
export interface IOptions {
    controllersDir?: string;
    middlewareDir?: string;
}
