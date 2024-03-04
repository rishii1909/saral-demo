import axios from 'axios'
import { API_URL } from '../constants';

export const fetchMails = async () => {
    try {
        const { userId } = localStorage.getItem('userData')
        if (!userId) return

        const response = await axios.post(`${API_URL}/mail/list`, { userId });
        const mails = response.data.data

        return mails;
    } catch (error) {
        throw new Error('Authentication failed');
    }
}