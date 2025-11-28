import React from 'react';
import { useParams } from 'react-router-dom';
import UserForm from '../../components/hhrr/UserForm';

const UserEditPage = () => {
    const { userId } = useParams();
    return <UserForm userId={userId} />;
};

export default UserEditPage;