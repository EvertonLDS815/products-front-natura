import { canSSRAuth } from '@/utils/canSSRAuth';
import Head from 'next/head';
import {Header} from '@/components/Header/index';
import styles from './styles.module.scss';
import { setUpAPIClient } from '@/services/api';
import { FormEvent, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import formatCurrency from '@/utils/formatCurrency';
import {Loading} from '../../components/loading';
import { toast } from 'react-toastify';
import Router from 'next/router';
import {ItemProps, OrderProps} from '../orders/index';
import Modal from 'react-modal';
import { ModalOrder } from '@/components/ModalOrder';
import {ModalForm} from "@/components/ModalForm";
import { IoMdSend } from "react-icons/io";
import { FaTrash } from 'react-icons/fa';


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
    categoryList: CategoryItemProps[],
    orders: OrderProps[]
}

export default function Dashboard({categoryList, orders}: CategoryProps) {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState(categoryList || []);
    const [categorySelected, setCategorySelected] = useState(0);
    const [loading, setLoading] = useState(true);

    const [neigh, setNeigh] = useState('');
    const [adress, setAdress] = useState('');
    const [number, setNumber] = useState('');
    const [amount, setAmount] = useState(1);
    
    const [orderList, setOrderList] = useState(orders || []);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalItem, setModalItem] = useState<ItemProps[]>([]);
    const [modalFormVisible, setModalFormVisible] = useState(false);
    
    
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
    }

    async function handleDecrement(event: FormEvent, id: string) {
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
            amount: amount - 1
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

    // separator

    async function handleDelete(id: string) {
        const api = setUpAPIClient();

        await api.delete('/order',{
            params: {
                order_id: id
            }
        });

        setOrderList((prevState) => prevState.filter((order) => order.id !== id));
        toast.success('Pedido deletado!')

        setModalVisible(false);
    }

    async function handleContinue(order_id: string) {
        const api = setUpAPIClient();

        const order = await api.post('/get/order', {
            id: order_id
        });

        Router.push('/dashboard/order');

        return order
    }

    async function handleSend(id: string) {
        const api = setUpAPIClient();
        
        await api.patch('/order/send',{
                order_id: id
        });
        
        handleCloseModal();
        setOrderList((prevState) => prevState.filter((order) => order.id !== id));
        toast.success('Pedido Enviado!')
    }

    async function handleOpenModalView(id: string) {
        const apiClient = setUpAPIClient();
        
        const {data} = await apiClient.get('/order/detail', {
            params: {
                order_id: id
            }
        });

        setModalItem(data);
        setModalVisible(true);

    }

    
    Modal.setAppElement('#__next');

    async function handleOpenModalFormView(event: FormEvent) {
        event.preventDefault();
        setModalFormVisible(true);
    }

    function handleCloseModal() {
        setModalVisible(false);
        setModalFormVisible(false);
    }

    Modal.setAppElement('#__next');
    return (
        <>
            <Head>
                <title>Painel - Pedidos</title>
            </Head>
            <Header />
            <main className={styles.container}>
                
            <h1>Produtos</h1>

            <div>
                <article className={styles.listOrders}>
                        {orderList.length === 0 && (
                            <span className={styles.message}>Não existem pedidos...</span>
                        )}
                        {orderList.map((order) => (
                            <section className={styles.orderItem} key={order.id}>
                                <button onClick={() => handleOpenModalView(order.id)}>
                                    <div className={styles.tag}></div>
                                    <p>{order.client.name} - <span>{order.neighborhood}</span></p>
                                    <div className={styles.orderPatch}>
                                    </div>
                                </button>
                                <div className={styles.orderIcons}>
                                    <span onClick={() => handleDelete(order.id)}><FaTrash color="#fc4747" size={22} /></span>
                                    <span onClick={() => handleSend(order.id)}><IoMdSend size={26} color="#02a953" /></span>
                                </div>
                            </section>
                        ))}

                        { modalVisible && (
                            <ModalOrder
                            isOpen={modalVisible}
                            onRequestClose={handleCloseModal}
                            order={modalItem}
                            onDeleteOrder={handleDelete}
                            />
                        )}
                        { modalFormVisible && (
                            <ModalForm
                            isOpen={modalFormVisible}
                            setOpen={setModalFormVisible}
                            onRequestClose={handleCloseModal}
                            />
                        )}
                    </article>
                </div>

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
                            <form>
                                {/* <input
                                type="number"
                                min={1}
                                id={product.id}
                                onChange={(event) => setAmount(Number(event.target.value))}
                                /> */}
                                {/* <button type="submit" onClick={orderList.length === 0 ? (event) => handleOpenModalFormView(event) : (event) => handleDecrement(event, product.id)}>-</button> */}
                                <button type="submit" onClick={orderList.length === 0 ? (event) => handleOpenModalFormView(event) : (event) => handleAdd(event, product.id)}>+</button>
                            </form>
                        </div>
                    </div>
                ))}

            </section>}
            </main>
        </>
    )
}

export const getServerSideProps = canSSRAuth(async (ctx: any) => {
    const apiClient = setUpAPIClient(ctx);
    const response = await apiClient.get('/category');

    // separator
    const {data: detail} = await apiClient.get('/me/client');
        const {data: order} = await apiClient.post('/order/client', {
            client_id: detail.id
        });
        
        console.log(order.id)
        
        const {data: lastOrder} = await apiClient.get('/order/item');

    return {
        props: {
            categoryList: response.data,
            orders: order,
            items: lastOrder ? lastOrder : []
        }
    }
})