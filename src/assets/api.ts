import axios from 'axios';
import {BACKEND_API_TOKEN, BACKEND_API_URL} from "../common/config.ts";

const API = axios.create({
    baseURL: BACKEND_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `bga ${BACKEND_API_TOKEN}`
    }
})

export {API};