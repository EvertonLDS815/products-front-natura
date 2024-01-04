import { setUpAPIClient } from '@/services/api';
import Router from 'next/router';
import { FormEvent, useState } from 'react';
import { FiX } from 'react-icons/fi';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import styles from './styles.module.scss';

interface ModalFormProps {
    isOpen: boolean;
    setOpen: (c: boolean) => void;
    onRequestClose: () => void;
}
export function ModalForm({isOpen, setOpen, onRequestClose}: ModalFormProps) {
    const [neigh, setNeigh] = useState('');
    const [adress, setAdress] = useState('');
    const [number, setNumber] = useState('');

    async function handleCreateOrder(event: FormEvent) {
        event.preventDefault();

        if (neigh === '' || adress === '' || number === '') {
            toast.error("Digite todos os campos!");
            return;
        }
        
        const api = setUpAPIClient();

        await api.post('/order', {
            neighborhood: neigh,
            adress,
            house_number: number
        });

        setOpen(false)

        location.reload();
        
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
                                type="number"
                                min="1"
                                placeholder="22" />
                        </div>
                    </section>
                    <button type="submit">Criar pedido</button>
                </form>
        </Modal>
    )
}