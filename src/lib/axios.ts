import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://apiamis.test/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

export default apiClient;
