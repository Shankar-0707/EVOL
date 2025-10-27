import axios from "axios";

const API = axios.create({
    baseURL : "https://evol-k431.onrender.com",
    // baseURL : "http://localhost:5000",
});

export default API;