import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createProductionOrder } from '../../api/productionService';
import { getProducts } from '../../api/inventoryService';
import {
  Box, TextField, Button, Paper, Typography, Divider, MenuItem, Alert,
  CircularProgress, Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const ProductionOrderForm = () => {
    const { register, handleSubmit, control, formState: { errors }, reset } = useForm({
        defaultValues: {
            product_id: null,
            quantity: '',
            planned_start_date: null,
            planned_end_date: null,
            priority: 'MEDIUM',
            notes: '',
            gauge: '',
            measures: '',
            machine: ''
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getProducts({ limit: 1000 });
                const finishedProducts = response.data.data.products.filter(p => p.type === 'FINISHED_PRODUCT');
                setProducts(finishedProducts);
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
            const payload = {
                ...data,
                product_id: data.product_id ? data.product_id.id : null,
                planned_start_date: data.planned_start_date ? dayjs(data.planned_start_date).format('YYYY-MM-DD') : null,
                planned_end_date: data.planned_end_date ? dayjs(data.planned_end_date).format('YYYY-MM-DD') : null,
                gauge: data.gauge === '' ? null : data.gauge,
            };
            await createProductionOrder(payload);
            setSuccess('Orden de producción creada exitosamente.');
            reset();
        } catch (err) {
            setError(err.response?.data?.message || 'Ocurrió un error al crear la orden.');
        } finally {
            setLoading(false);
        }
    };

    const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

    return (
        <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Crear Nueva Orden de Producción
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

                {/* Producto a Fabricar - Campo ancho */}
                <Box sx={{ mb: 3, mt: 2 }}>
                    <Controller
                        name="product_id"
                        control={control}
                        rules={{ required: 'Debe seleccionar un producto a fabricar' }}
                        render={({ field }) => (
                            <Autocomplete
                                {...field}
                                options={products}
                                getOptionLabel={(option) => option.sku ? `(${option.sku}) ${option.description}` : ""}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                onChange={(e, newValue) => field.onChange(newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} label="Producto a Fabricar *" error={!!errors.product_id} helperText={errors.product_id?.message}/>
                                )}
                            />
                        )}
                    />
                </Box>

                {/* Cantidad y Prioridad en una fila */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Box sx={{ flex: 1 }}>
                        <TextField fullWidth type="number" label="Cantidad a Producir *" {...register('quantity', { required: 'La cantidad es obligatoria', valueAsNumber: true, min: { value: 1, message: 'Debe ser mayor a 0' } })} error={!!errors.quantity} helperText={errors.quantity?.message} InputProps={{ inputProps: { min: 1 } }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Controller
                            name="priority"
                            control={control}
                            defaultValue="MEDIUM"
                            render={({ field }) => (
                                <TextField select fullWidth label="Prioridad" {...field}>
                                    {priorities.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                                </TextField>
                            )}
                        />
                    </Box>
                </Box>

                {/* Fechas en una fila */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Box sx={{ flex: 1 }}>
                        <Controller
                            name="planned_start_date"
                            control={control}
                            rules={{ required: 'La fecha de inicio es obligatoria' }}
                            render={({ field }) => (
                                <DatePicker label="Fecha Inicio Planificada *" value={field.value ? dayjs(field.value) : null} onChange={(date) => field.onChange(date)} renderInput={(params) => (<TextField {...params} fullWidth error={!!errors.planned_start_date} helperText={errors.planned_start_date?.message}/> )}/>
                            )}
                        />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Controller
                            name="planned_end_date"
                            control={control}
                            render={({ field }) => (
                                <DatePicker label="Fecha Fin Planificada" value={field.value ? dayjs(field.value) : null} onChange={(date) => field.onChange(date)} renderInput={(params) => (<TextField {...params} fullWidth /> )}/>
                            )}
                        />
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }}><Typography variant="overline">Detalles Técnicos (Opcional)</Typography></Divider>

                {/* Detalles técnicos en una fila */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Box sx={{ flex: 1 }}>
                        <TextField fullWidth type="number" label="Calibre (micras)" {...register('gauge', { valueAsNumber: true })} InputProps={{ inputProps: { step: "0.01", min: 0 } }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <TextField fullWidth label="Medidas (Ej: 30x40cm)" {...register('measures')} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <TextField fullWidth label="Máquina Asignada" {...register('machine')} />
                    </Box>
                </Box>

                {/* Notas */}
                <Box sx={{ mb: 3 }}>
                    <TextField label="Notas Adicionales" multiline rows={3} {...register('notes')} fullWidth />
                </Box>

                {/* Botones */}
                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                    <Button type="submit" variant="contained" disabled={loading}>{loading ? <CircularProgress size={24} /> : 'Crear Orden'}</Button>
                    <Button variant="outlined" onClick={() => navigate('/production/orders')}>Cancelar</Button>
                </Box>
            </form>
        </Paper>
    );
};

export default ProductionOrderForm;