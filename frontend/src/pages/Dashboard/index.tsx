import { FullScreenLoader } from '../../components/Preloader';
import useUser from '../../hooks/useUser';
import { useState, useEffect } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import User from '../../models/user';
import paths from '../../utils/paths';
import AppLayout from '../../layout/AppLayout';
import { useParams } from 'react-router-dom';
import Statistics from './Statistics';
import WorkspacesList from './WorkspacesList';
import DocumentsList from './DocumentsList';
import Organization from '../../models/organization';
import ApiKeyCard from './ApiKey';

export default function Dashboard() {
  const { slug } = useParams();
  const { user } = useUser();
  const [loading, setLoading] = useState<boolean>(true);
  const [organizations, setOrganizations] = useState<object[]>([]);
  const [organization, setOrganization] = useState<object | null>(null);
  const [workspaces, setWorkspaces] = useState<object[]>([]);
  const [documents, setDocuments] = useState<object[]>([]);

  useEffect(() => {
    async function userOrgs() {
      const orgs = await User.organizations();
      if (orgs.length === 0) {
        window.location.replace(paths.onboarding());
        return false;
      }

      const focusedOrg =
        orgs?.find((org: any) => org.slug === slug) || orgs?.[0];
      const _workspaces = await Organization.workspaces(focusedOrg.slug);
      const _documents = slug
        ? await Organization.documents(focusedOrg.slug)
        : [];

      setOrganizations(orgs);
      setOrganization(focusedOrg);
      setWorkspaces(_workspaces);
      setDocuments(_documents);
      setLoading(false);
    }
    userOrgs();
  }, [user.uid, window.location.pathname]);

  if (loading || organizations.length === 0 || !organization) {
    return (
      <DefaultLayout>
        <FullScreenLoader />
      </DefaultLayout>
    );
  }

  return (
    <AppLayout
      headerEntity={organization}
      headerProp="orgId"
      organizations={organizations}
      organization={organization}
      workspaces={workspaces}
    >
      {!!organization && (
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
          <ApiKeyCard organization={organization} />
        </div>
      )}

      <Statistics organization={organization} />
      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-8">
          <DocumentsList organization={organization} documents={documents} />
        </div>
        <WorkspacesList organization={organization} workspaces={workspaces} />
      </div>
    </AppLayout>
  );
}
