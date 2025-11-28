import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createClient, updateClient, getClientById } from '../../api/salesService';
import { Box, TextField, Button, Grid, Paper, Typography, Alert, CircularProgress } from '@mui/material';

const ClientForm = ({ clientId }) => {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const isEditMode = !!clientId;

    useEffect(() => {
        if (isEditMode) {
            const fetchClient = async () => {
                setLoading(true);
                try {
                    const response = await getClientById(clientId);
                    const client = response.data.data;
                    // Llenar el formulario con los datos del cliente
                    Object.keys(client).forEach(key => {
                        setValue(key, client[key] || '');
                    });
                } catch (err) {
                    setError('Error al cargar los datos del cliente.');
                } finally {
                    setLoading(false);
                }
            };
            fetchClient();
        }
    }, [clientId, isEditMode, setValue]);

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        try {
            if (isEditMode) {
                await updateClient(clientId, data);
            } else {
                await createClient(data);
            }
            navigate('/sales/clients'); // Redirige a la lista después de guardar
        } catch (err) {
            setError(err.response?.data?.message || 'Ocurrió un error al guardar el cliente.');
            setLoading(false);
        }
    };

    if (loading && isEditMode) {
        return <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
    }

    return (
        <Paper sx={{ p: 4, borderRadius: 2, maxWidth: 'lg', mx: 'auto' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                {isEditMode ? 'Editar Cliente' : 'Nuevo Cliente'}
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Código *" {...register('code', { required: 'El código es obligatorio' })} error={!!errors.code} helperText={errors.code?.message} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Nombre del Cliente *" {...register('name', { required: 'El nombre es obligatorio' })} error={!!errors.name} helperText={errors.name?.message} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="RFC (Tax ID)" {...register('tax_id')} />
                    </Grid>
                     <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Nombre de Contacto *" {...register('contact', { required: 'El contacto es obligatorio' })} error={!!errors.contact} helperText={errors.contact?.message} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Teléfono" {...register('phone')} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Email" type="email" {...register('email')} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth label="Dirección" multiline rows={3} {...register('address')} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth type="number" label="Límite de Crédito" {...register('credit_limit', { valueAsNumber: true, min: { value: 0, message: 'El valor debe ser positivo' } })} InputProps={{ inputProps: { step: "0.01" } }} error={!!errors.credit_limit} helperText={errors.credit_limit?.message} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth type="number" label="Términos de Pago (Días)" {...register('payment_terms', { valueAsNumber: true, min: { value: 0, message: 'El valor debe ser positivo' } })} error={!!errors.payment_terms} helperText={errors.payment_terms?.message} />
                    </Grid>
                </Grid>
                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                    <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
                    <Button variant="outlined" onClick={() => navigate('/sales/clients')}>Cancelar</Button>
                </Box>
            </form>
        </Paper>
    );
};

export default ClientForm;