import {createContext, ReactNode, useState, useEffect} from 'react';
import {api} from '../services/apiClient';

import {destroyCookie, setCookie, parseCookies} from 'nookies';
import Router from 'next/router';

import {toast} from 'react-toastify';
type AuthContextData = {
    user?: UserProps;
    isAuthenticated: boolean;
    signIn: (credentials: SignInProps) => Promise<void>;
    signOut: () => void;
    signUp: (credentials: SignUpProps) => Promise<void>
}

type UserProps = {
    id: string;
    name: string;
    login: string;
}

type SignInProps = {
    login: string;
    password: string;
}

type SignUpProps = {
    name: string;
    login: string;
    password: string;
}
type AuthProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData);

export function signOut() {
    try {
        destroyCookie(undefined, '@nextauthtwo.token');
        Router.push('/');
    } catch (err) {
        console.log('Erro ao deslogar');
    }
}

export function AuthProvider({children}: AuthProviderProps) {
    const [user, setUser] = useState<UserProps>();
    const isAuthenticated = !!user;

    useEffect(() => {
        // Tentar pegar algo na nookie
        const {'@nextauthtwo.token': token} = parseCookies();

        if (token) {
            api.get('/me/client').then(response => {
                const {id, name, login} = response.data;

                setUser({
                    id,
                    name,
                    login
                });
            })
            .catch((err) => {
                // Se deu erro deslogamos o user
                signOut();
            })
        }
    }, [])
    
    
    async function signIn({login, password}: SignInProps) {
        try {
            const response = await api.post('/session/client', {
                login,
                password
            });

            const {id, name, token} = response.data
    
            setCookie(undefined, '@nextauthtwo.token', token, {
                maxAge: 60 * 60 * 24 * 30,
                path: '/'
            });

            setUser({
                id,
                name,
                login
            });

            api.defaults.headers['Authorization'] = `Bearer ${token}`

            toast.success("Logado com sucesso!");

            Router.push('/dashboard')
        } catch (err: any) {
            console.error(err.response.data.error);
            toast.error(err.response.data.error);
        }
    }

    async function signUp({name, login, password}: SignUpProps) {
        try {
            const response = await api.post('/client', {
                name,
                login,
                password
            });

            toast.success("Conta criada com sucesso!");
            
            Router.push('/');
        } catch (err: any) {
            console.error(err.response.data.error);
            toast.error(err.response.data.error);
        }
    }
    
    return (
        <AuthContext.Provider value={{user, isAuthenticated, signIn, signOut, signUp}}>
            {children}
        </AuthContext.Provider>
    )
}