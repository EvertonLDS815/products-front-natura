import Modal from 'react-modal';
import styles from './styles.module.scss';
import {ItemProps} from '../../pages/orders';
import {FiX} from 'react-icons/fi';
import Link from 'next/link';
import { setUpAPIClient } from '@/services/api';
import formatCurrency from '@/utils/formatCurrency';
import { useContext, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { FaTrash } from "react-icons/fa";
import { useRouter } from 'next/router';


interface ModalOrderProps {
    isOpen: boolean;
    onRequestClose: () => void;
    order: ItemProps[];
    onDeleteOrder: (id: string) => void
}
export function ModalOrder({isOpen, onRequestClose, order, onDeleteOrder}: ModalOrderProps) {
    if (order.length === 0) {
        return
    }
    
    const [orderList, setOrderList] = useState(order || []);

    const {user} = useContext(AuthContext);

    const router = useRouter();
    const param = router.pathname;

    const customStyles = {
        content: {
            top: '50%',
            bottom: 'auto',
            left: '50%',
            right: 'auto',
            padding: '10px 15px',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#2d232a',
            borderRadius: '0.7rem',
            color: '#fff'
        }
    }
    const baseURL = "http://localhost:2222/files/";

    const total = orderList.reduce((acc, {product, amount}) => {
        return acc + (parseFloat(product.price) * amount)
    }, 0);

    async function handleDeleteItem(id: string) {
        const api = setUpAPIClient();

        await api.delete('/order/remove', {
            params: {
                item_id: id
            }
        });
        

        setOrderList((prevState) => prevState.filter((order) => order.id !== id));

    }
    
    if (orderList.length === 0) {
        onRequestClose();
    }

    return (
        <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        style={customStyles}
        >
            <button
            type="button"
            onClick={onRequestClose}
            className="react-modal-close"
            style={{background: 'transparent', border: 0, float: 'right', paddingTop: '9px'}}
            >
                <FiX size={32} color="#fc4747" />

            </button>

                <div className={styles.container}>

                    <h2>Detalhes do pedido</h2>

                    <div className={styles.headModal}>
                        <h3 className={styles.name}>
                            {user?.name}
                        </h3>
                        <span>{orderList.length} {orderList.length > 1 ? 'itens' : 'item'}</span>
                    </div>
                    <div className={styles.headModal}>
                        <span>
                        {orderList[0]?.order.neighborhood}
                        </span>
                        <span>Nº {orderList[0]?.order.house_number}</span>
                    </div>
                    <div className={orderList.length >= 4 ? styles.scrollY : styles.top}>
                        {orderList.map(item => (
                            <section key={item.id} className={styles.containerItem}>
                                <div className={styles.flexItem}>
                                    <Link title={item.product.name} href={`${baseURL}${item.product.banner}`} target="_blank">
                                        <img src={`${baseURL}${item.product.banner}`} alt={item.product.name} />
                                    </Link>
                                    <span className={styles.desProduct}>{item.amount} x <strong>{item.product.name}</strong></span>
                                    <span>{formatCurrency(Number(item.product.price))}</span>
                                    {item.order.draft && (
                                        <button className={styles.buttonRemove} onClick={() => handleDeleteItem(item.id)}>
                                            <FaTrash size={18} color="#ef4646" />
                                        </button>
                                    )}
                                </div>
                            </section>
                        ))}
                    </div>
                    <div className={styles.footerModal} style={param === '/orders'? {justifyContent: 'flex-end'} : {}}>
                            <button
                                className={styles.buttonOrder}
                                onClick={() => onDeleteOrder(order[0].order_id)}
                                style={param === '/orders'? {display: 'none'} : {}} 
                            >
                                Deletar Pedido
                            </button>
                            <h2>Total: {formatCurrency(total)}</h2>
                    </div>
                </div>
        </Modal>
    )
}