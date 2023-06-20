import { Route, Routes } from 'react-router-dom';
import { ContextWrapper } from './AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Landing from './pages/Landing';
import AuthenticateStytch from './pages/Authentication/Stytch';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';

import OrganizationHome from './pages/Landing';

function App() {
  return (
    <ContextWrapper>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route
          path="/organizations"
          element={<PrivateRoute Component={OrganizationHome} />}
        />

        <Route path="/authenticate/stytch" element={<AuthenticateStytch />} />
        <Route path="/auth/signup" element={<SignUp />} />
        <Route path="/auth/signin" element={<SignIn />} />
      </Routes>
    </ContextWrapper>
  );
}

export default App;
