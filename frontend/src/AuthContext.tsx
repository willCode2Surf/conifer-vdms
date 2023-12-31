import { useState, createContext } from 'react';

export const AuthContext = createContext(null);
export function ContextWrapper(props: any) {
  const localUser = localStorage.getItem('conifer_user');
  const localAuthToken = localStorage.getItem('conifer_authToken');
  const [store, setStore] = useState({
    user: localUser ? JSON.parse(localUser) : null,
    authToken: localAuthToken ? localAuthToken : null,
  });

  const [actions] = useState({
    updateUser: (user: object, authToken = '') => {
      localStorage.setItem('conifer_user', JSON.stringify(user));
      localStorage.setItem('conifer_authToken', authToken);
      setStore({ user, authToken });
    },
    unsetUser: () => {
      localStorage.removeItem('conifer_user');
      localStorage.removeItem('conifer_authToken');
      setStore({ user: null, authToken: null });
    },
  });

  return (
    <AuthContext.Provider value={{ store, actions }}>
      {props.children}
    </AuthContext.Provider>
  );
}
