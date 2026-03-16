import axios from "axios";

export const api = axios.create({
  baseURL: "https://van-connect-backend.onrender.com",
});
