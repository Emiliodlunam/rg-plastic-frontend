import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { getProducts, createEntryMovement } from '../../api/inventoryService';
import { useAuth } from '../../context/AuthContext';
import { Box, TextField, Button, Paper, Typography, Alert, CircularProgress, Autocomplete } from '@mui/material';

const InventoryEntryPage = () => {
    // Funcionalidad de reseteo: Se definen los valores por defecto
    const { handleSubmit, control, formState: { errors }, reset } = useForm({
        defaultValues: {
            product_id: null,
            quantity: '',
            reference_document: '',
            notes: ''
        }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [products, setProducts] = useState([]);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getProducts({ limit: 1000 }); 
                setProducts(response.data.data.products);
            } catch (err) {
                setError('No se pudieron cargar los productos.');
            }
        };
        fetchProducts();
    }, []);

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const movementData = { ...data, user_id: user.id };
            await createEntryMovement(movementData);
            setSuccess(`Entrada de ${data.quantity} unidad(es) del producto registrada correctamente.`);
            // Funcionalidad de reseteo: Se limpian los campos
            reset(); 
        } catch (err) {
            setError(err.response?.data?.message || 'Ocurrió un error al registrar la entrada.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Registrar Entrada de Inventario
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
                
                {/* Layout con Flexbox para campos anchos */}
                <Box sx={{ mb: 3, mt: 2 }}>
                     <Controller
                        name="product_id"
                        control={control}
                        rules={{ required: 'Debe seleccionar un producto' }}
                        render={({ field }) => (
                            <Autocomplete
                                // Funcionalidad de reseteo: Se controla el valor del Autocomplete
                                value={products.find(p => p.id === field.value) || null}
                                options={products}
                                getOptionLabel={(option) => `(${option.sku}) ${option.description}`}
                                onChange={(e, newValue) => field.onChange(newValue ? newValue.id : null)}
                                renderOption={(props, option) => (
                                    <Box component="li" {...props} key={option.id}>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="body1">{`(${option.sku}) ${option.description}`}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Stock Actual: {option.current_stock} {option.unit}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                                renderInput={(params) => (
                                    <TextField {...params} label="Producto *" error={!!errors.product_id} helperText={errors.product_id?.message}/>
                                )}
                            />
                        )}
                    />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Box sx={{ flex: 1 }}>
                        <Controller name="quantity" control={control} rules={{ required: 'La cantidad es obligatoria', valueAsNumber: true, min: { value: 1, message: 'La cantidad debe ser al menos 1' } }} render={({ field }) => (<TextField {...field} fullWidth type="number" label="Cantidad *" error={!!errors.quantity} helperText={errors.quantity?.message}/>)}/>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                         <Controller name="reference_document" control={control} render={({ field }) => (<TextField {...field} fullWidth label="Documento de Referencia" />)}/>
                    </Box>
                </Box>
                <Box>
                    <Controller name="notes" control={control} render={({ field }) => (<TextField {...field} fullWidth multiline rows={3} label="Notas Adicionales" />)}/>
                </Box>

                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                    <Button type="submit" variant="contained" disabled={loading}>{loading ? <CircularProgress size={24} /> : 'Registrar Entrada'}</Button>
                    <Button variant="outlined" onClick={() => navigate('/inventory/products')}>Volver al Inventario</Button>
                </Box>
            </form>
        </Paper>
    );
};

export default InventoryEntryPage;