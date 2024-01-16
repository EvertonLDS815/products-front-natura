import { setUpAPIClient } from '@/services/api';
import Router from 'next/router';
import { FormEvent, useState } from 'react';
import { FiX } from 'react-icons/fi';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import styles from './styles.module.scss';
import { OrderProps } from '@/pages/orders';
import { ModalOrder } from '../ModalOrder';

type OrderDashProps = {
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
    };
}
interface ModalFormProps {
    isOpen: boolean;
    onRequestClose: () => void;
    modalItem: OrderProps[];
    onModalItem: (credentials: OrderProps[]) => void;
    modalId: string
}
export function ModalForm({isOpen, onRequestClose, modalItem, onModalItem, modalId}: ModalFormProps) {
    const [neigh, setNeigh] = useState('');
    const [adress, setAdress] = useState('');
    const [number, setNumber] = useState('');
    const [typePage, setTypePage] = useState('À Vista');

    async function handleSend(event: FormEvent, id: string) {
        event.preventDefault();

        try {
            const api = setUpAPIClient();
            const {data: orderDetail} = await api.get('/order/detail', {
                params: {
                    order_id: id
                }
            });

            if (neigh === '' || adress === '' || number === '' || typePage === '') {
                toast.error('Preencha todos os campos!')
                return;
            }
            
            const {data} = await api.patch('/order/send', {
                    neighborhood: neigh,
                    adress,
                    house_number: number,
                    type_page: typePage,
                    order_id: id
            });

            onRequestClose();
            
            if (data.length === 0) {
                toast.info('Adicione um item ao carrinho!')
                return
            }
            toast.success('Pedido Enviado!')
            onModalItem([])

        } catch (err: any) {
            console.log(err)
            toast.error('Deu erro')
        }
        
        
    }

    
    const customStyles = {
        content: {
            top: '50%',
            bottom: 'auto',
            left: '50%',
            right: 'auto',
            padding: '15px 15px 25px',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#2d232a',
            borderRadius: '0.7rem',
            color: '#fff'
        }
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
            <form className={styles.formOrder} onSubmit={(event) => handleSend(event, modalId)}>
                    <h1>Cadastro do pedido</h1>
                    <label>Pagamento:</label>
                    <select value={typePage} onChange={(event) => setTypePage(event.target.value)}>
                        <option>À Vista</option>
                        <option>No Cartão</option>
                    </select>
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
                                placeholder="Manoel Gonçalves" />
                            
                        </div>
                        <div>
                            <label>Número:</label>
                            <input
                                value={number}
                                onChange={(event) => setNumber(event.target.value)}
                                type="number"
                                min="1"
                                placeholder="22" />
                        </div>
                    </section>
                    <button type="submit">Enviar pedido</button>
                </form>
        </Modal>
    )
}