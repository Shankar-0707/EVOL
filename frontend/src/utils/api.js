import axios from "axios";

const API = axios.create({
    baseURL : "https://evol-k431.onrender.com",
});

export default API;