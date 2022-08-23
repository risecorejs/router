import express from 'express'

export interface RouteInterface {
  dev?: boolean
  url?: string
  method?: 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head'
  middleware?: string | express.Handler | (string | express.Handler)[]
  controller?: express.Handler | string
  children?: RouteInterface[]
}

export interface OptionsInterface {
  controllersDir: string
  middlewareDir?: string
}
