import express from 'express'

import { HTTPMethodUpperCaseType } from '../types'

export interface RouteInterface {
  group?: string
  dev?: boolean
  url?: string
  method?: HTTPMethodUpperCaseType
  middleware?: string | express.Handler | (string | express.Handler)[]
  controller?: express.Handler | string
  docs?: { [id: string]: any }
  children?: RouteInterface[]
}

export interface OptionsInterface {
  controllersDir?: string
  middlewareDir?: string
}
