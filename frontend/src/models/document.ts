import { API_BASE } from '../utils/constants';
import { baseHeaders } from '../utils/request';

const Document = {
  fragments: async (uid: string) => {
    return fetch(`${API_BASE}/v1/document/${uid}/fragments`, {
      method: 'GET',
      cache: 'no-cache',
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .then((res) => res?.fragments || [])
      .catch((e) => {
        console.error(e);
        return [];
      });
  },
  fragment: async (uid: string, order: number) => {
    return fetch(`${API_BASE}/v1/document/${uid}/fragment/${order}`, {
      method: 'GET',
      cache: 'no-cache',
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .catch((e) => {
        console.error(e);
        return null;
      });
  },
};

export default Document;
