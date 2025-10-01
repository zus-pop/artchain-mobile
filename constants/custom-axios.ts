import axios from "axios";
import { useAuthStore } from "../store";
const myAxios = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
});

myAxios.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  config.headers["Authorization"] = `Bearer ${accessToken}`;
  return config;
});

export default myAxios;
