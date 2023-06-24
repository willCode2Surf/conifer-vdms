import { Link, useParams } from 'react-router-dom';
import Jazzicon from '../../../components/Jazzicon';
import paths from '../../../utils/paths';
import moment from 'moment'
import pluralize from 'pluralize'
import { useState } from 'react';
import Workspace from '../../../models/workspace';
import PreLoader from '../../../components/Preloader';
import { nFormatter } from '../../../utils/numbers';
import { File } from 'react-feather';
import truncate from 'truncate';

export default function WorkspacesList({ organization, workspaces }: { organization: any, workspaces: any[] }) {
  return (
    <div className="col-span-12 flex-1 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div className='flex items-center justify-between w-full mb-6 px-7.5'>
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Workspaces {workspaces.length > 0 ? `(${workspaces.length})` : ''}
        </h4>
        {workspaces.length > 0 && (
          <button onClick={() => {
            document.getElementById('workspace-creation-modal')?.showModal();
          }} className='px-2 py-1 rounded-lg text-slate-800 hover:bg-slate-200  text-sm'>
            New workspace
          </button>
        )}
      </div>

      {workspaces.length > 0 ? (
        <div>
          <>
            {workspaces.map((workspace) => {
              return (
                <Link
                  key={workspace.uid}
                  to={paths.workspace(organization.slug, workspace.slug)}
                  className="flex items-center gap-5 py-3 px-7.5 hover:bg-gray-3 dark:hover:bg-meta-4"
                >
                  <div className="relative h-14 w-14 rounded-full">
                    <Jazzicon uid={workspace.uid} size={55} />
                  </div>

                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <h5 className="font-medium text-black dark:text-white">
                        {workspace.name}
                      </h5>
                      <p>
                        <span className="text-xs text-slate-500">
                          {truncate(workspace.workspaceId, 20)}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-y-1">
                      <div className='flex items-center justify-center gap-x-1'>
                        <p className='text-sm text-gray-600'>
                          {nFormatter(workspace?.documents)}
                        </p>
                        <File className='h-4 w-4 text-gray-600' />

                      </div>
                      <p>
                        <span className="text-sm text-black dark:text-white">
                          created {moment.unix(workspace.createdAt._seconds).fromNow()}
                        </span>
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </>
        </div>
      ) : (
        <div>
          <div className='flex w-full min-h-[40vh] px-8'>
            <div className='bg-slate-100 hover:bg-slate-200 rounded-lg h-auto w-full flex justify-center items-center'>
              <button onClick={() => {
                document.getElementById('workspace-creation-modal')?.showModal();
              }} className='px-4 py-2 rounded-lg text-slate-800 hover:bg-slate-800 hover:text-white border border-slate-800'>
                Create a Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateWorkspaceModal organization={organization} />
    </div>
  )
}

const CreateWorkspaceModal = ({ organization }: { organization: any }) => {
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const { workspace } = await Workspace.createNew(organization.slug, e.target.name.value);
    if (!workspace) {
      setLoading(false);
      return false;
    }

    window.location.reload();
  };

  return (
    <dialog id='workspace-creation-modal' className='rounded-lg w-1/2'>
      <div className="rounded-sm bg-white dark:border-strokedark dark:bg-boxdark">
        <div className="py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Create a New Workspace
          </h3>
          <p className='text-sm text-gray-500'>
            Workspaces are collections of documents inside of your organization. They allow you to control permissions and documents with ultimate visibility.
            <br />
            They should match with what you are calling your namespaces in Pinecone.
          </p>
        </div>
        {loading ? (
          <div className="px-6.5">
            <div className="mb-4.5 flex w-full justify-center">
              <PreLoader />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="px-6.5">
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Workspace Name
                </label>
                <input
                  required={true}
                  type="text"
                  name="name"
                  placeholder="My workspace"
                  autoComplete='off'
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
              </div>
              <div className='flex flex-col gap-y-2'>
                <button type='submit' className="flex w-full justify-center rounded bg-blue-500 p-3 font-medium text-white">
                  Create Workspace
                </button>
                <button type='button' onClick={() => {
                  document.getElementById('workspace-creation-modal')?.close();
                }} className="flex w-full justify-center rounded bg-transparent hover:bg-slate-200 p-3 font-medium text-slate-500">
                  Cancel
                </button>
              </div>
              <p className='my-2 text-sm bg-orange-100 p-2 rounded-lg text-center border border-orange-800 text-orange-800'>Once your workspace exists you can start adding documents via the UI or API via code.</p>
            </div>
          </form>
        )}
      </div>
    </dialog >
  )
}