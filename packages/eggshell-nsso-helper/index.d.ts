import 'egg';
import ExtendContext = require('./app/extend/context');
import ExtendIHelper = require('./app/extend/helper');
type ExtendContextType = typeof ExtendContext;
type ExtendIHelperType = typeof ExtendIHelper;

declare module 'egg' {
  export interface Context extends ExtendContextType {}
  export interface Context extends ExtendContextType {}
}