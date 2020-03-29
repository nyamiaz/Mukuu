import axios from "axios";

const VERSION = "v1";
const API_ROOT = `/api/${VERSION}`;

export default {
  async fetch(type, params) {
    const { data, request } = await axios.get(`${API_ROOT}/history/${type}/list`, {
      params
    });
    return { url: request.responseURL, data };
  },
  async register(type, params) {
    const { data, request } = await axios.post(`${API_ROOT}/history/${type}`, params);
    return { url: request.responseURL, count: data.count };
  }
};