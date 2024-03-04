// axios.js

import axios from 'axios';
import { API_URL } from '../constants';

const instance = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor
instance.interceptors.request.use(
    (config) => {
        // Retrieve the authentication token from your storage
        const userData = localStorage.getItem('userData');
        console.log(userData)
        // Attach the token to the headers
        if (userData) {
            config.headers.Authorization = `Bearer ${userData.jwtToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;
