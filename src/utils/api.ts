import axios from 'axios';

const API_URL = '/api';

export const getUser = async (): Promise<any> => {
  const response = await axios.get(`${API_URL}/user`);
  return response.data;
};