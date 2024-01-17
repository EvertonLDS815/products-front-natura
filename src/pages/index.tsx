import { FormEvent, useContext, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../../styles/Home.module.scss';
import Logo from '../../public/logo-jl-2.png';

import { Input } from '../components/ui/input';
import {Button} from '../components/ui/button';
import Link from 'next/link';
import {canSSRGuest} from '../utils/canSSRGuest';
import {toast} from 'react-toastify';

import {AuthContext} from '../contexts/AuthContext';

export default function Home() {
  const {signIn} = useContext(AuthContext);

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();

    try {
      if (login === '' || password === '') {
        throw new Error('Preencha todos os dados!');
      }
  
      setLoading(true);
      
      const data = {
        login,
        password
      }
      await signIn(data);
  
      setLoading(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <>
      <Head>
        <title>Natura - Login</title>
      </Head>
      <main className={styles.container}>

        <div className={styles.containerCenter}>
          <Image src={Logo} alt="logo do site" />

          <div className={styles.login}>
            <form onSubmit={handleLogin}>
              <Input 
                type="text" 
                placeholder={'Digite seu email...'} 
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                />
              <Input 
                type="password" 
                placeholder={'Digite sua senha...'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}/>
              <Button 
                type="submit"
                loading={loading}
                >Acessar</Button>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}


export const getServerSideProps = canSSRGuest(async (ctx) => {

  return {
    props: {}
  }
  
})