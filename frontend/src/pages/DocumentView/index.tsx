import { FullScreenLoader } from '../../components/Preloader';
import useUser from '../../hooks/useUser';
import { useState, useEffect } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import User from '../../models/user';
import paths from '../../utils/paths';
import AppLayout from '../../layout/AppLayout';
import { useParams } from 'react-router-dom';
import Workspace from '../../models/workspace';
import FragmentList from './FragmentList';

export default function DocumentView() {
  const { user } = useUser();
  const { slug, workspaceSlug, docUid } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [organizations, setOrganizations] = useState<object[]>([]);
  const [organization, setOrganization] = useState<object | null>(null);
  const [workspaces, setWorkspaces] = useState<object[]>([]);
  const [document, setDocument] = useState<object[]>([]);

  useEffect(() => {
    async function userOrgs() {
      if (!slug || !workspaceSlug) return false;

      const orgs = await User.organizations();
      if (orgs.length === 0) {
        window.location.replace(paths.onboarding());
        return false;
      }

      const _workspaces = await User.workspaces();
      const _documents = slug
        ? await Workspace.documents(slug, workspaceSlug)
        : [];

      setOrganizations(orgs);
      setOrganization(orgs?.find((org: any) => org.slug === slug) || null);
      setWorkspaces(_workspaces);
      setDocument(_documents?.find((doc: any) => doc.uid === docUid) || null);
      setLoading(false);
    }
    userOrgs();
  }, [user.uid]);

  if (loading || organizations.length === 0) {
    return (
      <DefaultLayout>
        <FullScreenLoader />
      </DefaultLayout>
    );
  }

  return (
    <AppLayout
      headerEntity={document}
      headerProp="uid"
      headerNameProp="documentName"
      organizations={organizations}
      organization={organization}
      workspaces={workspaces}
    >
      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-12">
          <FragmentList />
        </div>
      </div>
    </AppLayout>
  );
}
