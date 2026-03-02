import axios from "axios";

const API = "https://localhost:7248/api/ResultMaster";

export const getResults = () => axios.get(`${API}/All`);

export const saveResult = (data) =>
  axios.post(`${API}/Save`, data);

export const deleteResult = (data) =>
  axios.post(`${API}/Delete`, data);