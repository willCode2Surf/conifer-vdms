import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FullScreenLoader } from '../Preloader';
import validateSessionTokenForUser from '../../utils/session';

function useIsAuthenticated() {
  const [isAuthd, setIsAuthed] = useState<Boolean | null>(null);

  useEffect(() => {
    const validateSession = async () => {
      const localUser = localStorage.getItem('conifer_user');
      const localAuthToken = localStorage.getItem('conifer_authToken');
      if (!localUser || !localAuthToken) {
        setIsAuthed(false);
        return;
      }

      const isValid = await validateSessionTokenForUser();
      if (!isValid) {
        localStorage.removeItem('conifer_user');
        localStorage.removeItem('conifer_authToken');
        setIsAuthed(false);
        return;
      }

      setIsAuthed(true);
    };
    validateSession();
  }, []);

  return isAuthd;
}

const PrivateRoute = ({
  Component,
}: {
  Component: React.FunctionComponent;
}) => {
  const authed = useIsAuthenticated();
  if (authed === null) return <FullScreenLoader />;

  return authed ? <Component /> : <Navigate to="/login" />;
};

export default PrivateRoute;
