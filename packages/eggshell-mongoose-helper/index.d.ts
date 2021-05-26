import 'egg';
import ExtendApplication = require('./app/extend/application');
import ExtendHelper = require('./app/extend/helper');

type ExtendApplicationType = typeof ExtendApplication;
type ExtendHelperType = typeof ExtendHelper;

declare module 'egg' {
  interface IHelper extends ExtendHelperType { }
  interface Application extends ExtendApplicationType { }
}