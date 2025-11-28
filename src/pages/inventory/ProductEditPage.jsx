import React from 'react';
import { useParams } from 'react-router-dom';
import ProductForm from '../../components/inventory/ProductForm';

const ProductEditPage = () => {
    const { productId } = useParams();
    return <ProductForm productId={productId} />;
};

export default ProductEditPage;