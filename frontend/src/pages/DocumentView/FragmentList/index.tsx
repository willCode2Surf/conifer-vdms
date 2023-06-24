import { Link, useParams } from 'react-router-dom';
import paths from '../../../utils/paths';
import moment from 'moment';
import { FileText } from 'react-feather';
import { CodeBlock, CopyBlock, nord, vs2015 } from 'react-code-blocks';
import { memo, useEffect, useState } from 'react';
import PreLoader from '../../../components/Preloader';
import Document from '../../../models/document';
import truncate from 'truncate';

export default function FragmentList() {
  const { docUid } = useParams();
  const [loading, setLoading] = useState(true);
  const [fragments, setFragments] = useState([]);

  useEffect(() => {
    async function getFragments() {
      if (!docUid) return;
      const _fragments = await Document.fragments(docUid);
      setFragments(_fragments);
      setLoading(false);
    }
    getFragments();
  }, []);

  return (
    <div className="col-span-12 flex-1 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">
            Embeddings Overview
          </h4>
        </div>
      </div>

      <div className="px-6">
        {loading ? (
          <div>
            <PreLoader />
          </div>
        ) : (
          <>
            <div
              id="accordion-flush"
              data-accordion="collapse"
              data-active-classes="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              data-inactive-classes="text-gray-500 dark:text-gray-400"
            >
              {fragments.map((fragment, i) => (
                <Fragment key={i} fragment={fragment} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const Fragment = ({ fragment }: { fragment: any }) => {
  const [loaded, setLoaded] = useState(false);
  const [show, setShow] = useState(false);
  const { order } = fragment;
  return (
    <>
      <button
        onClick={() => {
          setLoaded(true);
          setShow(!show);
        }}
        type="button"
        className="flex w-full items-center justify-between border-b border-gray-200 py-5 text-left font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400"
      >
        <div className="flex items-center gap-x-8">
          <span>Embedding #{order}</span>
        </div>
        <svg
          data-accordion-icon
          className="h-6 w-6 shrink-0 rotate-180"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          ></path>
        </svg>
      </button>
      <div hidden={!show}>
        {loaded && <FragmentDetail key={fragment.uid} fragment={fragment} />}
      </div>
    </>
  );
};

const FragmentDetail = memo(({ fragment }: { fragment: any }) => {
  const { docUid } = useParams();
  const [data, setData] = useState(null);
  useEffect(() => {
    async function fetchData() {
      if (!fragment || !docUid) return;
      const _data = await Document.fragment(docUid, fragment.order);
      setData(_data);
    }
    fetchData();
  }, [fragment]);

  return (
    <div>
      {data === null ? (
        <div className="border-b border-gray-200 py-5 ">
          <div className="h-[80px] w-full animate-pulse rounded-lg bg-slate-300" />
        </div>
      ) : (
        <div className="border-b border-gray-200 py-5 dark:border-gray-700">
          <table className="w-full bg-white p-4">
            <thead>
              <tr>
                <th className="whitespace-nowrap border-b-2 p-4 text-left font-normal text-gray-900">
                  Vector Id
                </th>
                <th className="whitespace-nowrap border-b-2 p-4 text-left font-normal text-gray-900">
                  Lines
                </th>
                <th className="whitespace-nowrap border-b-2 p-4 text-left font-normal text-gray-900">
                  Text Snippet
                </th>
              </tr>
            </thead>
            <tbody>
              {data.ids.map((id, i) => {
                const metadata = data.metadatas[i];
                return (
                  <>
                    <tr key={id} className="text-sm text-gray-500">
                      <td className="border-b-2 p-4 ">{id}</td>
                      <td className="border-b-2 p-4 ">
                        {metadata['loc.lines.from']} -{' '}
                        {metadata['loc.lines.to']}
                      </td>
                      <td className="border-b-2 p-4 text-sm text-gray-500">
                        {truncate(metadata.text, 40)}
                        <button
                          onClick={() => {
                            document.getElementById(`${id}-text`)?.showModal();
                          }}
                          hidden={metadata.text.length <= 40}
                          className="pl-4 text-blue-500 underline"
                        >
                          See All
                        </button>
                      </td>
                    </tr>
                    <dialog id={`${id}-text`} className="w-1/2 rounded-lg">
                      <div className="flex flex-col overflow-y-scroll px-4">
                        <pre className="font-mono whitespace-pre-line rounded-lg bg-slate-100 p-2">
                          {metadata.text}
                        </pre>
                        <div className="mt-4 flex flex-col gap-y-2">
                          <button
                            type="button"
                            onClick={() => {
                              document.getElementById(`${id}-text`)?.close();
                            }}
                            className="flex w-full justify-center rounded bg-transparent p-3 font-medium text-slate-500 hover:bg-slate-200"
                          >
                            Close Preview
                          </button>
                        </div>
                      </div>
                    </dialog>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});
