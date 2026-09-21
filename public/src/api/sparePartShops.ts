import axiosClient from './axiosClient';

const base = '/spare-part-shops';

export const listShops = (params = {}) => axiosClient.get(base, { params }).then(r => r.data);
export const getShop = (id: number | string) => axiosClient.get(`${base}/${id}`).then(r => r.data);
export const createShop = (data: any) => axiosClient.post(base, data).then(r => r.data);
export const updateShop = (id: number | string, data: any) => axiosClient.put(`${base}/${id}`, data).then(r => r.data);
export const deleteShop = (id: number | string) => axiosClient.delete(`${base}/${id}`).then(r => r.data);

export default {
  listShops,
  getShop,
  createShop,
  updateShop,
  deleteShop,
};
