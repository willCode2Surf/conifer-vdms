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
  onboarding: function () {
    return '/onboarding';
  },
  dashboard: function () {
    return '/dashboard';
  },
  organization: function ({ slug }: { slug: string }) {
    return `/dashboard/${slug}`;
  },
  workspace: function (slug: string, workspaceUid: string) {
    return `/dashboard/${slug}/workspace/${workspaceUid}`;
  },
  document: function (slug: string, workspaceUid: string, docId: string) {
    return `/dashboard/${slug}/workspace/${workspaceUid}/document/${docId}`;
  }
};

export default paths;
