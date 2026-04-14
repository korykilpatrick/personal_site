import api from '../services/api';

export const authApi = {
  async login(username: string, password: string): Promise<string> {
    const response = await api.post<{ token: string }>('/auth/login', {
      username,
      password,
    });

    return response.data.token;
  },
};

export default authApi;
