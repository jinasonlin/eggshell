/* eslint-disable max-classes-per-file */
const http = require('http');

class ValidationError extends Error {
  constructor(msg = 'Validate Failed', errors) {
    super(msg);
    this.name = 'ValidationError';
    if (errors) {
      this.errors = errors;
    }
  }
}

const AllowedCommonErrorName = ['NotFoundError', 'UnauthorizedError', 'ForbiddenError', 'ValidationError', 'MultipartFileTooLargeError'];
const AllowedMongooseErrorName = ['ValidationError', 'CastError'];
const AllowedErrorName = [...new Set([...AllowedCommonErrorName, ...AllowedMongooseErrorName])];

module.exports = {
  // 重写 egg-validate 默认方法
  validate(rules, data) {
    data = data || this.request.body;
    const errors = this.app.validator.validate(rules, data);
    if (errors) {
      throw new ValidationError(`validation failed: Path \`${errors[0].field}\` is ${errors[0].message}`, errors);
    }
  },
  throwValidationError(msg, errors) {
    throw new ValidationError(msg, errors);
  },
  throwNotFoundError(msg) {
    this.throw(404, msg);
  },
  throwUnauthorizedError(msg) {
    this.throw(401, msg);
  },
  throwForbiddenError(msg) {
    this.throw(403, msg);
  },
  isAllowedErrorName(name) {
    return AllowedErrorName.includes(name);
  },
  success(result) {
    this.body = {
      code: '0',
      message: 'ok',
      result,
    };
  },
  failure(code, message, result) {
    if (code instanceof Error) {
      const err = code;

      switch (err.name) {
        case 'ValidationError': {
          const body = {
            code: '20001',
            message: err.message,
          };

          // mongoose 校验错误详细数据
          if (err.errors) {
            body.errors = err.errors;
          }

          this.body = body;
          return;
        }
        case 'CastError':
        {
          const body = {
            code: '20404',
            message: err.message,
          };

          // this.status = 404;
          this.body = body;
          return;
        }
        case 'MultipartFileTooLargeError': {
          const body = {
            code: '20413',
            message: 'Request file too large',
          };

          this.body = body;
          return;
        }
        default: {
          const status = err.status || 200;
          const realCode = status === 200 ? '0' : (status >= 500 ? '-1' : `20${status}`); // eslint-disable-line
          const realMessage = (this.app.config.env !== 'prd' || err.expose) && err.message
            ? err.message
            : http.STATUS_CODES[status];

          // this.status = status;
          this.status = 200;
          this.body = {
            code: realCode,
            message: realMessage,
          };
          return;
        }
      }
    }
    this.body = {
      code,
      message,
      result,
    };
  },
};
