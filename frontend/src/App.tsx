import { Route, Routes } from 'react-router-dom';
import { ContextWrapper } from './AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Landing from './pages/Landing';
import AuthenticateStytch from './pages/Authentication/Stytch';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';

import OnboardingHome from './pages/Onboarding';
import OrganizationDashboard from './pages/Dashboard';
import WorkspaceDashboard from './pages/WorkspaceDashboard';
import DocumentView from './pages/DocumentView';

function App() {
  return (
    <ContextWrapper>
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
      </Routes>
    </ContextWrapper>
  );
}

export default App;
