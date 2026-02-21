//http://localhost:5167

import axios from "axios";

const API = "https://localhost:7248/api/SemesterMaster";


export const getSemesters = () => axios.get(API);

export const createSemester = (data) =>
  axios.post(`${API}?mode=Create`, data);

export const updateSemester = (data) =>
  axios.post(`${API}?mode=Update`, data);

export const deleteSemester = (data) =>
  axios.post(`${API}?mode=Delete`, data);
