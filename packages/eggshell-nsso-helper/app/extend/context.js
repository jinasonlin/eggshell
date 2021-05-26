module.exports = {
  get boomHost() {
    return this.request.boomHost;
  },
  get user() {
    return this.session.user || this.session.user;
  },
  get userId() {
    return this.user && this.user._id;
  },
};
