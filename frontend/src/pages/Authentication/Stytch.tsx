import { useEffect, useState, useContext } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import { AlertCircle, CheckCircle } from 'react-feather';
import { AuthContext } from '../../AuthContext';
import useQuery from '../../hooks/useQuery';
import paths from '../../utils/paths';
import User from '../../models/user';
import PreLoader from '../../components/Preloader';

type IError = string | null;

export default function AuthenticateStytch() {
  const query = useQuery();
  const context = useContext<any>(AuthContext);
  const [error, setError] = useState<IError>(null);
  const [isValid, setIsValid] = useState<Boolean>(false);

  useEffect(() => {
    const validateToken = async () => {
      const token = query.get('token');

      if (!token) {
        setError('No token provided!');
        return;
      }

      const { token: authToken, user, error } = await User.createSession(token);
      if (!!error) {
        setError(error);
        return;
      }

      context?.actions?.updateUser(user, authToken);
      setIsValid(true);

      setTimeout(() => {
        window.location.assign(paths.dashboard());
      }, 1_500);
    };

    validateToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!!error) {
    return (
      <DefaultLayout>
        <div className="flex h-full w-full flex-col">
          <div className="mx-auto mt-4 flex w-full md:w-1/2">
            <div className="bg-gray-highlight mx-auto flex w-full flex-col items-center justify-center rounded-lg px-4 py-8 md:w-1/2">
              <p className="my-2 flex items-center gap-x-1 text-lg font-black text-red-500">
                <AlertCircle className="h-6 w-6 stroke-red-500" />
                {error}
              </p>
              <a href={paths.root()} className="underline">
                &larr; back to login
              </a>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (isValid) {
    return (
      <DefaultLayout>
        <div className="flex h-full w-full flex-col">
          <div className="mx-auto mt-4 flex w-full md:w-1/2">
            <div className="bg-gray-highlight mx-auto flex w-full flex-col items-center justify-center rounded-lg px-4 py-8 md:w-1/2">
              <p className="my-2 flex items-center gap-x-1 text-lg font-black text-green-500">
                <CheckCircle className="h-6 w-6 stroke-green-500" />
                Valid login found!
              </p>
              <p className="text-sm">Loading your files. Please wait.</p>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="flex h-full w-full flex-col">
        <div className="mx-auto mt-4 flex w-full md:w-1/2">
          <div className="bg-gray-highlight mx-auto flex w-full flex-col items-center justify-center rounded-lg px-4 py-8 md:w-1/2">
            <PreLoader />
            <p className="text-2xl font-black text-gray-800">Authenticating</p>
            <div className="mt-2 flex items-center justify-center">
              <p className="text-dm-white inline-flex items-center text-center text-xs">
                <span className="ml-2">
                  please wait while we direct you to the right place.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
