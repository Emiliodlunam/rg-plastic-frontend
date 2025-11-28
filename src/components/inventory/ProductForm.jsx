import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createProduct, updateProduct, getProductById } from '../../api/inventoryService';
import { getSuppliers } from '../../api/supplierService';
import { Box, TextField, Button, Grid, Paper, Typography, MenuItem, Alert, CircularProgress, Divider } from '@mui/material';

const ProductForm = ({ productId }) => {
    const { register, handleSubmit, control, formState: { errors }, setValue, watch } = useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [suppliers, setSuppliers] = useState([]);
    const navigate = useNavigate();
    const isEditMode = !!productId;

    // Observamos el valor del campo 'type' para mostrar/ocultar campos
    const productType = watch('type');

    useEffect(() => {
        // Cargar proveedores para el dropdown
        const fetchSuppliers = async () => {
            try {
                const response = await getSuppliers();
                setSuppliers(response.data.data);
            } catch (err) {
                console.error("Error al cargar proveedores", err);
            }
        };

        fetchSuppliers();

        if (isEditMode) {
            const fetchProduct = async () => {
                setLoading(true);
                try {
                    const response = await getProductById(productId);
                    const product = response.data.data;
                    Object.keys(product).forEach(key => {
                        setValue(key, product[key] || ''); // Usar string vacío para campos null
                    });
                } catch (err) {
                    setError('Error al cargar los datos del producto.');
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [productId, isEditMode, setValue]);

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        try {
            // Convertir strings vacíos a null para campos numéricos opcionales
            const numericFields = ['width', 'height', 'gauge', 'gusset', 'weight'];
            numericFields.forEach(field => {
                if (data[field] === '') data[field] = null;
            });

            if (isEditMode) {
                await updateProduct(productId, data);
            } else {
                await createProduct(data);
            }
            navigate('/inventory/products');
        } catch (err) {
            setError(err.response?.data?.message || 'Ocurrió un error al guardar.');
            setLoading(false);
        }
    };
    
    const productTypes = ['RAW_MATERIAL', 'FINISHED_PRODUCT', 'INDIRECT_SUPPLY'];
    const units = ['kg', 'units', 'rolls', 'liters'];

    if (loading && isEditMode) {
        return <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
    }

    return (
        <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                {isEditMode ? 'Editar Producto' : 'Nuevo Producto'}
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                
                <Typography variant="h6" sx={{ mb: 2 }}>Información General</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Código (SKU) *" {...register('sku', { required: 'El código es obligatorio' })} error={!!errors.sku} helperText={errors.sku?.message} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Descripción *" {...register('description', { required: 'La descripción es obligatoria' })} error={!!errors.description} helperText={errors.description?.message} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Controller
                            name="type"
                            control={control}
                            defaultValue="FINISHED_PRODUCT"
                            render={({ field }) => (
                                <TextField select fullWidth label="Tipo" {...field}>
                                    {productTypes.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                                </TextField>
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField select fullWidth label="Unidad de Medida *" defaultValue="units" {...register('unit', { required: 'La unidad es obligatoria' })}>
                             {units.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth type="number" label="Precio Costo *" {...register('cost_price', { required: 'El costo es obligatorio', valueAsNumber: true, min: { value: 0, message: 'El valor debe ser positivo' } })} InputProps={{ inputProps: { step: "0.01" } }} error={!!errors.cost_price} helperText={errors.cost_price?.message} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth type="number" label="Stock Mínimo *" {...register('min_stock', { required: 'El stock mínimo es obligatorio', valueAsNumber: true, min: { value: 0, message: 'El valor debe ser positivo' } })} error={!!errors.min_stock} helperText={errors.min_stock?.message} />
                    </Grid>
                     <Grid item xs={12} sm={6}>
                        <TextField select fullWidth label="Proveedor Principal" defaultValue="" {...register('supplier_id')}>
                            <MenuItem value=""><em>Ninguno</em></MenuItem>
                            {suppliers.map(supplier => <MenuItem key={supplier.id} value={supplier.id}>{supplier.name}</MenuItem>)}
                        </TextField>
                    </Grid>
                </Grid>

                {/* Sección condicional para Ficha Técnica */}
                {productType === 'FINISHED_PRODUCT' && (
                    <>
                        <Divider sx={{ my: 4 }} />
                        <Typography variant="h6" sx={{ mb: 2 }}>Especificaciones Técnicas (Producto Terminado)</Typography>
                        <Grid container spacing={3}>
                             <Grid item xs={12} sm={6} md={3}>
                                <TextField fullWidth type="number" label="Ancho (cm)" {...register('width', { valueAsNumber: true })} InputProps={{ inputProps: { step: "0.01" } }} />
                            </Grid>
                             <Grid item xs={12} sm={6} md={3}>
                                <TextField fullWidth type="number" label="Alto (cm)" {...register('height', { valueAsNumber: true })} InputProps={{ inputProps: { step: "0.01" } }} />
                            </Grid>
                             <Grid item xs={12} sm={6} md={3}>
                                <TextField fullWidth type="number" label="Calibre (micras)" {...register('gauge', { valueAsNumber: true })} InputProps={{ inputProps: { step: "0.01" } }} />
                            </Grid>
                             <Grid item xs={12} sm={6} md={3}>
                                <TextField fullWidth type="number" label="Fuelle (cm)" {...register('gusset', { valueAsNumber: true })} InputProps={{ inputProps: { step: "0.01" } }} />
                            </Grid>
                             <Grid item xs={12} sm={6} md={3}>
                                <TextField fullWidth type="number" label="Peso (kg)" {...register('weight', { valueAsNumber: true })} InputProps={{ inputProps: { step: "0.01" } }} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField fullWidth label="Color" {...register('color')} />
                            </Grid>
                        </Grid>
                    </>
                )}

                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                    <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
                    <Button variant="outlined" onClick={() => navigate('/inventory/products')}>Cancelar</Button>
                </Box>
            </form>
        </Paper>
    );
};

export default ProductForm;