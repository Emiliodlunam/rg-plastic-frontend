import React from 'react';
import { useParams } from 'react-router-dom';
import ClientForm from '../../components/sales/ClientForm';

const ClientEditPage = () => {
    const { clientId } = useParams();
    return <ClientForm clientId={clientId} />;
};

export default ClientEditPage;