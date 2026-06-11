import Axios from 'axios';

const axios = Axios.create({
    baseURL: import.meta.env.VITE_BASE_URL_BACKEND || 'http://localhost',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },

    withCredentials: true,
    withXSRFToken: true,
});

export default axios;