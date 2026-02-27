import axios from "axios";

const API = "https://localhost:7248/api/SemesterMaster"; // change port

export const getResults = async () => {
    return await axios.get(API);
};

export const getResultById = async (id) => {
    return await axios.get(`${API}/${id}`);
};

export const createResult = async (data) => {
    return await axios.post(API, data);
};

export const updateResult = async (data) => {
    return await axios.put(API, data);
};

export const deleteResult = async (id) => {
    return await axios.delete(`${API}/${id}`);
};