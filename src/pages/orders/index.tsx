import { Header } from "@/components/Header"
import styles from './styles.module.scss';
import { useContext, useEffect, useState } from "react";
import { canSSRAuth } from "@/utils/canSSRAuth";
import { setUpAPIClient } from "@/services/api";
import { AuthContext } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import Modal from 'react-modal';
import {ModalOrder} from '@/components/ModalOrder';
import Router from "next/router";

export type OrderProps = {
    id: string;
    neighborhood: string;
    adress: string;
    house_number: string;
    status: boolean;
    draft: boolean;
    client: {
        id: string;
        name: string;
        login: string;
        password: string;
    }
}
export type ItemProps = {
    id: string;
	amount: 8;
	order_id: string;
	product_id: string;
	order: {
		id: string;
		neighborhood: string;
		adress: string;
		house_number: string;
		status: boolean;
		draft: boolean;
		client_id: string;
        client: {
            id: string;
            name: string;
            login: string;
            password: string;
        }
    },
    product: {
        id: string;
        name: string;
        price: string,
        description: string,
        banner: string,
    }
}
interface HomeProps {
    orders: OrderProps[],
    items: ItemProps[]
}
export default function Order({orders, items}: HomeProps) {
    const [orderList, setOrderList] = useState(orders || []);

    const [modalItem, setModalItem] = useState<ItemProps[]>([]);
    const [modalVisible, setModalVisible] = useState(false);

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

    function handleCloseModal() {
        setModalVisible(false);
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
    return (
        <>
            <Header />
            <main className={styles.container}>
                <h1>Pedidos</h1>

                <article className={styles.listOrders}>
                        {orderList.length === 0 && (
                            <span className={styles.message}>Não existem pedidos...</span>
                        )}
                        {orderList.map((order) => (
                            <section className={styles.orderItem} key={order.id}>
                                <button  onClick={() => handleOpenModalView(order.id)}>
                                    <div className={styles.tag}></div>
                                    <p>{order.client.name} - <span>{order.neighborhood}</span></p>
                                    <div className={styles.orderPatch}>
                                    </div>
                                </button>
                            </section>
                        ))}

                    </article>
            </main>
            { modalVisible && (
                <ModalOrder
                isOpen={modalVisible}
                onRequestClose={handleCloseModal}
                order={modalItem}
                onDeleteOrder={handleDelete}
                />
            )}
        </>
    )
}

export const getServerSideProps = canSSRAuth(async (ctx: any) => {
    const apiClient = setUpAPIClient(ctx);
        
        const {data: detail} = await apiClient.get('/me/client');
        const {data: order} = await apiClient.post('/order/client', {
            client_id: detail.id
        });
        
        console.log(order.id)
        
        const {data: lastOrder} = await apiClient.get('/order/item');

    return {
        props: {
            orders: order,
            items: lastOrder ? lastOrder : []
        }
    }
})