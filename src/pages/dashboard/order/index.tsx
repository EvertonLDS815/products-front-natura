import { canSSRAuth } from '@/utils/canSSRAuth';
import Head from 'next/head';
import {Header} from '@/components/Header/index';
import styles from './styles.module.scss';
import {FiRefreshCcw} from 'react-icons/fi';
import { setUpAPIClient } from '@/services/api';
import { FormEvent, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import formatCurrency from '@/utils/formatCurrency';
import {Loading} from '../../../components/loading';
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
            Router.push('/dashboard');
            return toast.info("Crie seu pedido primeiro!");
        }
        const {data: res} = await api.post('/order/add', {
            order_id: lastOrder.id,
            product_id: id,
            amount
        });

        setAmount(1)

        console.log(res);
    }

    async function handleCreateOrder(event: FormEvent) {
        event.preventDefault();

        if (neigh === '' || adress === '' || number === '') {
            toast.error("Digite todos os campos");
            return;
        }

        toast.info("Adicione Itens");
        const api = setUpAPIClient();

        await api.post('/order', {
            neighborhood: neigh,
            adress,
            house_number: number
        });

        Router.push('/dashboard/order');
    }

    async function handleSendOrder() {
        const api = setUpAPIClient();

        
        const {data} = await api.get(('/order/item'));


        await api.patch('/order/send', {
            order_id: data.id
        })

        toast.success("Pedido Enviado!");
    }
    return (
        <>
            <Head>
                <title>Painel - Pedidos</title>
            </Head>
            <Header />
            <main className={styles.container}>
                
            <h1>Produtos</h1>

            <select className={styles.select} value={categorySelected} onChange={handleChangeCategory}>
                {categories.map((item, index) => (
                    <option key={item.id} value={index}>
                        {item.name}
                    </option>
                ))}
            </select>
            {loading === true ? <Loading /> :
            <section className={styles.productContainer}>
                {loading === false && products.map((product: ProductItemProps, index) => (
                    <div className={styles.content} key={product.id}>
                        <Link href={`http://localhost:2222/files/${product.banner}`} title={product.name} target="_blank">
                            <img 
                            src={`http://localhost:2222/files/${product.banner}`}
                            alt={product.name}
                            />
                        </Link>
                        <div className={styles.descriptionProduct}>
                            <h2>{product.name}</h2>
                            <p>{formatCurrency(parseFloat(product.price))}</p>
                            <form onSubmit={(event) => handleAdd(event, product.id)}>
                                <input
                                type="number"
                                min={1}
                                id={product.id}
                                onChange={(event) => setAmount(Number(event.target.value))}
                                />
                                <button type="submit">+</button>
                            </form>
                        </div>
                    </div>
                ))}

            </section>}
                <span onClick={() => handleSendOrder()}>Enviar</span>
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