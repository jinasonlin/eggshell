import 'egg';
import ExtendContext = require('./app/extend/context');
type ExtendContextType = typeof ExtendContext;

declare module 'egg' {
  export interface Context extends ExtendContextType {}
}