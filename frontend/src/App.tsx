import { Route, Routes } from 'react-router-dom';
import { ContextWrapper } from './AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Landing from './pages/Landing';
import AuthenticateStytch from './pages/Authentication/Stytch';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';

import OnboardingHome from './pages/Onboarding';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <ContextWrapper>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route
          path="/dashboard"
          element={<PrivateRoute Component={Dashboard} />}
        />
        <Route
          path="/dashboard/:orgSlug"
          element={<PrivateRoute Component={Dashboard} />}
        />

        {/* <Route
          path="/dashboard/:orgSlug/workspace/:slug"
          element={<PrivateRoute Component={Dashboard} />}
        /> */}

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
