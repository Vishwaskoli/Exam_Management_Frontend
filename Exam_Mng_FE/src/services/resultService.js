import axios from "axios";

const API = "https://localhost:7248/api/ResultMaster";

export const getResults = () => {
  return axios.get(`${API}/All`);
};

export const saveResult = (data) => {
  return axios.post(`${API}/Save`, data);
};

export const deleteResult = (data) => {
  return axios.post(`${API}/Delete`, data);
};