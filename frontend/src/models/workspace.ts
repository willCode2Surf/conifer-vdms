import { API_BASE } from '../utils/constants';
import { baseHeaders } from '../utils/request';

const Workspace = {
  createNew: async (orgSlug: string, workspaceName: string) => {
    let error;
    const workspace = await fetch(`${API_BASE}/v1/org/${orgSlug}/new-workspace`, {
      method: 'POST',
      cache: 'no-cache',
      headers: baseHeaders(),
      body: JSON.stringify({ workspaceName }),
    })
      .then((res) => res.json())
      .then((res) => {
        error = res?.error || '[001] Failed to create workspace.';
        return res.workspace;
      })
      .catch((e) => {
        console.error(e);
        error = '[002] Failed to create workspace.';
        return null;
      });

    if (!workspace) return { organization: null, error };
    return { workspace, error: null };
  },
  bySlug: async (slug: string, workspaceSlug: string) => {
    const workspace = await fetch(`${API_BASE}/v1/org/${slug}/workspace/${workspaceSlug}`, {
      method: 'GET',
      cache: 'no-cache',
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .then((res) => res?.workspace)
      .catch((e) => {
        console.error(e);
        return null;
      });

    return { workspace };
  },

};

export default Workspace;
