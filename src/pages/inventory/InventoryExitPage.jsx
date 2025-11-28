import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { getProducts, createExitMovement } from '../../api/inventoryService';
import { useAuth } from '../../context/AuthContext';
import { Box, TextField, Button, Paper, Typography, Alert, CircularProgress, Autocomplete } from '@mui/material';

const InventoryExitPage = () => {
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
                const rawMaterials = response.data.data.products.filter(p => p.type === 'RAW_MATERIAL');
                setProducts(rawMaterials);
            } catch (err) {
                setError('No se pudieron cargar las materias primas.');
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
            await createExitMovement(movementData);
            setSuccess(`Salida de ${data.quantity} unidad(es) del producto registrada correctamente.`);
            // Funcionalidad de reseteo: Se limpian los campos
            reset(); 
        } catch (err) {
            setError(err.response?.data?.message || 'Ocurrió un error al registrar la salida.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Registrar Salida a Producción
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
                
                {/* Layout con Flexbox para campos anchos */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-start', mt: 2 }}>
                    <Box sx={{ flex: 1.5 }}>
                        <Controller
                            name="product_id"
                            control={control}
                            rules={{ required: 'Debe seleccionar una materia prima' }}
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
                                                    Stock Disponible: {option.current_stock} {option.unit}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Materia Prima *" error={!!errors.product_id} helperText={errors.product_id?.message}/>
                                    )}
                                />
                            )}
                        />
                    </Box>
                     <Box sx={{ flex: 1 }}>
                        <Controller name="quantity" control={control} rules={{ required: 'La cantidad es obligatoria', valueAsNumber: true, min: { value: 1, message: 'La cantidad debe ser al menos 1' } }} render={({ field }) => (<TextField {...field} fullWidth type="number" label="Cantidad a Consumir *" error={!!errors.quantity} helperText={errors.quantity?.message}/>)}/>
                    </Box>
                     <Box sx={{ flex: 1 }}>
                         <Controller name="reference_document" control={control} rules={{ required: 'La Orden de Producción es obligatoria' }} render={({ field }) => (<TextField {...field} fullWidth label="Orden de Producción *" error={!!errors.reference_document} helperText={errors.reference_document?.message}/>)}/>
                    </Box>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                     <Controller name="notes" control={control} render={({ field }) => (<TextField {...field} fullWidth multiline rows={3} label="Notas Adicionales" />)}/>
                </Box>

                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                    <Button type="submit" variant="contained" disabled={loading}>{loading ? <CircularProgress size={24} /> : 'Registrar Salida'}</Button>
                    <Button variant="outlined" onClick={() => navigate('/inventory/products')}>Cancelar</Button>
                </Box>
            </form>
        </Paper>
    );
};

export default InventoryExitPage;