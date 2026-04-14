import api from '../services/api';

interface CountResponse {
  count: number;
}

export interface AdminDashboardCounts {
  projectCount: number;
  workCount: number;
  siteNoteCounts: {
    total: number;
    active: number;
  };
  quoteCounts: {
    total: number;
    active: number;
  };
  libraryItemCount: number;
}

const fetchCount = async (path: string): Promise<number> => {
  const response = await api.get<CountResponse>(path);
  return response.data.count;
};

export const adminApi = {
  async getList<T>(endpoint: string, signal?: AbortSignal): Promise<T[]> {
    const response = await api.get<T[]>(endpoint, { signal });
    return response.data;
  },

  async getById<T>(endpoint: string, id: string | number): Promise<T> {
    const response = await api.get<T>(`${endpoint}/${id}`);
    return response.data;
  },

  async create<TPayload, TResponse = void>(endpoint: string, payload: TPayload): Promise<TResponse> {
    const response = await api.post<TResponse>(endpoint, payload);
    return response.data;
  },

  async update<TPayload, TResponse = void>(
    endpoint: string,
    id: string | number,
    payload: TPayload
  ): Promise<TResponse> {
    const response = await api.put<TResponse>(`${endpoint}/${id}`, payload);
    return response.data;
  },

  async remove(endpoint: string, id: number): Promise<void> {
    await api.delete(`${endpoint}/${id}`);
  },

  async getDashboardCounts(): Promise<AdminDashboardCounts> {
    const [
      projectCount,
      workCount,
      siteNotesTotalCount,
      siteNotesActiveCount,
      quotesTotalCount,
      quotesActiveCount,
      libraryItemCount,
    ] = await Promise.all([
      fetchCount('/projects/summary/count'),
      fetchCount('/work/summary/count'),
      fetchCount('/site_notes/summary/count'),
      fetchCount('/site_notes/summary/count?active=true'),
      fetchCount('/quotes/summary/count'),
      fetchCount('/quotes/summary/count?active=true'),
      fetchCount('/library-items/summary/count'),
    ]);

    return {
      projectCount,
      workCount,
      siteNoteCounts: {
        total: siteNotesTotalCount,
        active: siteNotesActiveCount,
      },
      quoteCounts: {
        total: quotesTotalCount,
        active: quotesActiveCount,
      },
      libraryItemCount,
    };
  },
};

export default adminApi;
