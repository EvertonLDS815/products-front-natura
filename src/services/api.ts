import axios, {AxiosError} from 'axios';
import {parseCookies} from 'nookies';
import {AuthTokenError} from './errors/AuthTokenError';
import { signOut } from '../contexts/AuthContext';
export function setUpAPIClient(ctx = undefined) {
    let cookies = parseCookies(ctx);

    const api = axios.create({
        baseURL: 'http://localhost:2222',
        headers: {
            Authorization: `Bearer ${cookies['@nextauthtwo.token']}`
        },
        
    });

    api.interceptors.response.use(response => {
        return response;
    }, (error: AxiosError) => {
        if (error.response?.status === 401) {
            if (typeof window !== undefined) {
                signOut();
            } else {
                return Promise.reject(new AuthTokenError());
            }
        }
        return Promise.reject(error);
    });

    return api;

}


export function setMe(ctx = undefined) {
    let cookies = parseCookies(ctx);

    const verify = axios.create({
        baseURL: 'http://localhost:2222',
        headers: {
            Authorization: `Bearer ${cookies['@nextauthtwo.token']}`
        },
        
    });

    return verify;

}