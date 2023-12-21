import { Header } from '@/components/Header';
import styles from './styles.module.scss';
import Head from 'next/head';
import { useContext, FormEvent, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { canSSRAuth } from '@/utils/canSSRAuth';
import {setMe} from '@/services/api';
import Router from 'next/router';
import {toast} from 'react-toastify';

export default function Profile() {
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const {user} = useContext(AuthContext);

    async function handleUpdate(event: FormEvent) {
        event.preventDefault();

        try {
            const set = setMe();
            
            await set.patch('/edit/client', {
                password: password,
                newPassword: newPassword
            });

            setPassword('');
            setNewPassword('');
            
            toast.success('Senha Alterada com sucesso!');
            Router.push('/dashboard');
        } catch (err: any) {
            toast.error(err.response.data.error);
        }
    }
    return (
        <>
            <Head>
                <title>Meu Perfil</title>
            </Head>
            <Header />
            <main className={styles.container}>

                <h1>Meu Perfil</h1>

                <div className={styles.contentUser}>
                    <h2>{user?.name}</h2>
                    <p>Id: {user?.id}</p>
                    <p>Login: {user?.login}</p>
                </div>

            <div className={styles.contentPass}>

                <form className={styles.form} onSubmit={handleUpdate}>
                    <h2>Trocar a senha</h2>
                    
                    <ul>
                        <li>Sua senha deve estar correta para poder alterá-la.</li>
                        <li>Digite uma nova senha com mais de 4 caracteres.</li>
                        <li>A senha pode conter letras, números e caracteres especiais.</li>
                    </ul>
                    <input
                    type="text"
                    placeholder="Digite sua senha..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    />
                    <input
                    type="text"
                    placeholder="Digite sua nova senha..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button type="submit">Atualizar</button>
                </form>
            </div>
            </main>
        </>
    )
}

export const getServerSideProps = canSSRAuth(async (ctx) => {

    return {
        props: {}
    }
})