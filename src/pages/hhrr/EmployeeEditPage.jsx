import React from 'react';
import { useParams } from 'react-router-dom';
import EmployeeForm from '../../components/hhrr/EmployeeForm';

const EmployeeEditPage = () => {
    const { employeeId } = useParams();
    return <EmployeeForm employeeId={employeeId} />;
};

export default EmployeeEditPage;