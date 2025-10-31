import { useAuthStore } from "@/store";
import axios from "axios";
const myAxios = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
});
console.log(process.env.EXPO_PUBLIC_API_URL);

myAxios.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  config.headers["Authorization"] = `Bearer ${accessToken}`;
  return config;
});

export default myAxios;
