import axios from 'axios';
import { API_URL } from '../../constants';


export const login = async (username, password) => {
    try {
        const r2 = await axios.get(`${API_URL}/`)
        console.log(r2)
        const response = await axios.post(`${API_URL}/auth/login`, { username, password });
        const { userId, email, jwtToken } = response.data.data;
        localStorage.setItem('userData', { userId, email, jwtToken });
        return { userId, email, jwtToken };
    } catch (error) {
        console.error(error)
        throw new Error('Authentication failed');
    }
};

export const logout = () => {
    localStorage.removeItem('token');
};

export const getToken = () => {
    return localStorage.getItem('token');
};