import { canSSRAuth } from '@/utils/canSSRAuth';
import Head from 'next/head';
import {Header} from '@/components/Header/index';
import styles from './styles.module.scss';
import {FiRefreshCcw} from 'react-icons/fi';
import { setUpAPIClient } from '@/services/api';
import { FormEvent, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import formatCurrency from '@/utils/formatCurrency';
import {Loading} from '../../components/loading';
import { AuthContext } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import Router from 'next/router';

type ProductItemProps = {
    id: string;
    name: string;
    price: string;
    description: string;
    banner: string;
    category_id: string;
}
export interface ProductProps {
    categoryList: ProductItemProps[]
}
type CategoryItemProps = {
    id: string;
    name: string;
}
interface CategoryProps {
    categoryList: CategoryItemProps[]
}

export default function Dashboard({categoryList}: CategoryProps) {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState(categoryList || []);
    const [categorySelected, setCategorySelected] = useState(0);
    const [loading, setLoading] = useState(true);

    const [neigh, setNeigh] = useState('');
    const [adress, setAdress] = useState('');
    const [number, setNumber] = useState('');
    const [amount, setAmount] = useState(1);
    
    async function byCategory(id: string) {
        const apiClient = setUpAPIClient();
        const response = await apiClient.get('/category/product', {
            params: {
                    category_id: id
                }
            });

            setProducts(response.data);
            setLoading(false);
        }
    
        async function handleChangeCategory(event: any) {
        setCategorySelected(event.target.value)
        
        byCategory(categories[event.target.value].id)
    }
    // recarregando a page
    useEffect(() => {
        byCategory(categories[categorySelected].id)
    }, [])
    

    async function handleAdd(event: FormEvent, id: string) {
        event.preventDefault();
        
        if (amount === 0) {
            return
        }
        const api = setUpAPIClient();

        const {data: lastOrder} = await api.get('/order/item');
        if (!lastOrder) {
            Router.push('/orders')
            return toast.info("Crie seu pedido primeiro!");
        }
        const {data: res} = await api.post('/order/add', {
            order_id: lastOrder.id,
            product_id: id,
            amount
        });

        console.log(res);
    }

    async function handleCreateOrder(event: FormEvent) {
        event.preventDefault();

        if (neigh === '' || adress === '' || number === '') {
            toast.error("Digite todos os campos");
            return;
        }

        toast.info("Crie seu Pedido");
        const api = setUpAPIClient();

        await api.post('/order', {
            neighborhood: neigh,
            adress,
            house_number: number
        });

        Router.push('/dashboard/order');
    }
    return (
        <>
            <Head>
                <title>Painel - Pedidos</title>
            </Head>
            <Header />
            <main className={styles.container}>

                <form className={styles.formOrder} onSubmit={handleCreateOrder}>
                    <h1>Cadastro do pedido</h1>
                    <label>Bairro:</label>
                    <input
                        value={neigh}
                        onChange={(event) => setNeigh(event.target.value)}
                        placeholder="São Cristóvão" />
                    
                    <section>
                        <div>
                            <label>Rua:</label>
                            <input
                                value={adress}
                                onChange={(event) => setAdress(event.target.value)}
                                placeholder="Manoel gonçalves" />
                            
                        </div>
                        <div>
                            <label>Número:</label>
                            <input
                                value={number}
                                onChange={(event) => setNumber(event.target.value)}
                                placeholder="22" />
                        </div>
                    </section>
                    <button type="submit">Criar pedido</button>
                </form>
                
            </main>
        </>
    )
}

export const getServerSideProps = canSSRAuth(async (ctx: any) => {
    const apiClient = setUpAPIClient(ctx);
    const response = await apiClient.get('/category');
    return {
        props: {
            categoryList: response.data
        }
    }
})