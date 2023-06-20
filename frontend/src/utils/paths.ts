const paths = {
  root: function () {
    return '/';
  },
  signIn: function () {
    return '/auth/signin';
  },
  signUp: function () {
    return '/auth/signup';
  },
  get home() {
    return this.root;
  },
};

export default paths;
