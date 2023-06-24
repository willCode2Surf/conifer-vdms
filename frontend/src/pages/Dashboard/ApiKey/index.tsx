import { useEffect, useState } from "react";
import { Copy } from "react-feather";
import PreLoader from "../../../components/Preloader";
import Organization from "../../../models/organization";

export default function ApiKeyCard({ organization }: { organization?: object }) {
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    async function fetchApi() {
      if (!organization?.slug) return;
      const apiKey = await Organization.apiKey(organization.slug);
      setApiKey(apiKey);
      setLoading(false);
    }
    fetchApi()
  }, [organization?.slug])

  return (
    <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex flex-col gap-y-2">
        <p className="text-slate-800 font-semibold">Copy API Key</p>
        <p className="text-slate-600 text-sm">For use of syncing Conifer with Pinecone programmatically.</p>
      </div>

      <div className="mt-4 flex items-end justify-between">
        {loading ? (
          <PreLoader />
        ) : (
          <ApiKey apiKey={apiKey} />
        )}
      </div>
    </div>
  )
}

const ApiKey = ({ apiKey }: { apiKey: { key: string } }) => {
  const { key: secret } = apiKey;
  const [show, setShow] = useState(false);
  const copyCode = () => {
    setShow(true);
    window.navigator.clipboard.writeText(secret);
    return;
  };

  const displaySecret = () => {
    if (show) {
      return secret;
    }

    const sections = secret.split('ck-')[1].split('-');
    return 'ck-' + sections
      .map((section, i) => {
        if (i < sections.length)
          return section
            .split('')
            .map(() => '*')
            .join('');
        return section;
      })
      .join('-');
  };

  useEffect(() => {
    if (!show) return;
    setTimeout(() => {
      setShow(false);
    }, 3500);
  }, [show]);

  return (
    <li className="flex flex-row mb-2 border-gray-400 justify-between w-full">
      <div className="relative shadow border bg-white rounded-md flex flex-1 items-center px-4 py-2 overflow-hidden no-scroll">
        <div className="flex flex-1 items-center justify-start w-fit gap-x-4">
          <p className="font-semibold text-gray-500 whitespace-nowrap overflow-x-scroll">{displaySecret()}</p>
        </div>
        <div className="absolute right-0 flex gap-x-2 items-center w-fit">
          <button onClick={copyCode} className="w-fit text-right bg-white p-1">
            <div
              className="p-2 flex items-center justify-center hover:bg-gray-100 group rounded-full"
              title="Copy the api key">
              {show ? (
                <Copy className="h-4 w-4 text-green-600 animate-pulse" />
              ) : (
                <Copy className="h-4 w-4 group-hover:text-gray-500 text-gray-400" />
              )}
            </div>
          </button>
        </div>
      </div>
    </li>
  );
};