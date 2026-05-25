import { BASE_URL } from "./ipConfig.js";
import axios from "axios";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
export default apiClient;
