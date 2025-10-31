import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `bga ${import.meta.env.VITE_BACKEND_API_TOKEN}`
    }
})

export {API};