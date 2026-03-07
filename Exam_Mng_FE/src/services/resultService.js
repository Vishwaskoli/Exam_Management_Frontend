import api from "./axiosConfig";

const API = "/ResultMaster";

export const getResults = () => {
  return api.get(`${API}/All`);
};

export const saveResult = (data) => {
  return api.post(`${API}/Save`, data);
};

export const deleteResult = (data) => {
  return api.post(`${API}/Delete`, data);
};