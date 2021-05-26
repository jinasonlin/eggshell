const crypto = require('crypto');
const url = require('url');

module.exports = {
  encrypt(user) {
    const clearEncoding = 'utf8';
    const cipherEncoding = 'base64';
    const cipherChunks = [];
    const cipher = crypto.createCipheriv('aes-128-cbc', this.app.config.nsso.CRYPTO_KEY, this.app.config.nsso.CRYPTO_IV);
    cipher.setAutoPadding(true);

    cipherChunks.push(cipher.update(JSON.stringify(user), clearEncoding, cipherEncoding));
    cipherChunks.push(cipher.final(cipherEncoding));

    return cipherChunks.join('');
  },
  decrypt(str) {
    const clearEncoding = 'utf8';
    const cipherEncoding = 'base64';
    const cipherChunks = [];
    const decipher = crypto.createDecipheriv('aes-128-cbc', this.config.nsso.CRYPTO_KEY, this.config.nsso.CRYPTO_IV);
    decipher.setAutoPadding(true);

    cipherChunks.push(decipher.update(str, cipherEncoding, clearEncoding));
    cipherChunks.push(decipher.final(clearEncoding));

    return JSON.parse(cipherChunks.join(''));
  },
  /**
   * @link egg.helper.urlFor
   */
  boomUrlFor(name, params) {
    return `${this.ctx.protocol}://${this.ctx.boomHost}${url.resolve('/', this.app.router.url(name, params))}`;
  },
};
