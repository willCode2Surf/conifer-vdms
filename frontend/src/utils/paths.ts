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
  workspace: function (slug: string, workspaceSlug: string) {
    return `/dashboard/${slug}/workspace/${workspaceSlug}`;
  },
  document: function (slug: string, workspaceSlug: string, docId: string) {
    return `/dashboard/${slug}/workspace/${workspaceSlug}/document/${docId}`;
  },
};

export default paths;
