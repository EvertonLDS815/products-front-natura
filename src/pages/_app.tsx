import '../../styles/global.scss';
import type { AppProps } from 'next/app';
import 'react-toastify/ReactToastify.min.css';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
      <AuthProvider>
        <Component {...pageProps} />
        <ToastContainer autoClose={2000} />
      </AuthProvider>
  )
}
