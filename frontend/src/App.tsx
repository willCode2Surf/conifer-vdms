import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ContextWrapper } from './AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Landing from './pages/Landing';
import AuthenticateStytch from './pages/Authentication/Stytch';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import { FullScreenLoader } from './components/Preloader';

const OnboardingHome = lazy(() => import('./pages/Onboarding'));
const OrganizationDashboard = lazy(() => import('./pages/Dashboard'));
const WorkspaceDashboard = lazy(() => import('./pages/WorkspaceDashboard'));
const DocumentView = lazy(() => import('./pages/DocumentView'));

function App() {
  return (
    <ContextWrapper>
      <Suspense fallback={<div />}>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route
            path="/dashboard"
            element={<PrivateRoute Component={OrganizationDashboard} />}
          />

          <Route
            path="/dashboard/:slug"
            element={<PrivateRoute Component={OrganizationDashboard} />}
          />

          <Route
            path="/dashboard/:slug/workspace/:workspaceSlug"
            element={<PrivateRoute Component={WorkspaceDashboard} />}
          />

          <Route
            path="/dashboard/:slug/workspace/:workspaceSlug/document/:docUid"
            element={<PrivateRoute Component={DocumentView} />}
          />

          <Route
            path="/onboarding"
            element={<PrivateRoute Component={OnboardingHome} />}
          />

          <Route path="/authenticate/stytch" element={<AuthenticateStytch />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/signin" element={<SignIn />} />

          <Route
            path="/api-docs"
            element={
              <Redirect to="https://github.com/Mintplex-Labs/langchainjs/blob/conifer/langchain/src/vdbms/README.md" />
            }
          />
        </Routes>
      </Suspense>
    </ContextWrapper>
  );
}

const Redirect = ({ to }: { to: any }) => {
  if (!!window?.location) window.location = to;
  return <FullScreenLoader />;
};

export default App;
