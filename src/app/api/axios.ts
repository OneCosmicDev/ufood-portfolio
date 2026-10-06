import axios from 'axios';
const axiosClient = axios.create({
    baseURL: 'https://ufoodapi.herokuapp.com',
    timeout: 15000,
});

axiosClient.interceptors.response.use(
    res => res,
    err => {
        return Promise.reject(err);
    }
);

export default axiosClient;