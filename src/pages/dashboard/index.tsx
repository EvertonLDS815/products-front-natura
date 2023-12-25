import { canSSRAuth } from '@/utils/canSSRAuth';
import Head from 'next/head';
import {Header} from '@/components/Header/index';
import styles from './styles.module.scss';
import {FiRefreshCcw} from 'react-icons/fi';
import { setUpAPIClient } from '@/services/api';
import { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import formatCurrency from '@/utils/formatCurrency';
import {Loading} from '../../components/loading';
import { AuthContext } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

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
    

    async function handleAdd(id: string) {
        const api = setUpAPIClient();

        const {data: lastOrder} = await api.get('/order/item');
        const {data: res} = await api.post('/order/add', {
            order_id: lastOrder.id,
            product_id: id,
            amount: 2,
        });

        console.log(res);
    }

    async function handleCreateOrder() {
        toast.info("Crie seu Pedido");
        const api = setUpAPIClient();

        await api.post('/order', {
            neighborhood: "Vilinha",
            adress: "Rua Feitosa",
            house_number: "00"
        })
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
                    {loading === false && products.map((item: ProductItemProps) => (
                        <div key={item.id}>
                            <Link href={`http://localhost:2222/files/${item.banner}`} title={item.name} target="_blank">
                                <img 
                                src={`http://localhost:2222/files/${item.banner}`}
                                alt={item.name}
                                />
                            </Link>
                            <div className={styles.descriptionProduct}>
                                <h2>{item.name}</h2>
                                <p>{formatCurrency(parseFloat(item.price))}</p>
                                <button onClick={() => handleAdd(item.id)}>+</button>
                            </div>
                        </div>
                    ))}
                </section>}

                <button onClick={handleSendOrder}>Enviar</button>
                <button onClick={handleCreateOrder}>Criar pedido</button>
                
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