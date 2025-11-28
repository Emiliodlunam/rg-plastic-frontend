import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createEmployee, updateEmployee, getEmployeeById } from '../../api/employeeService';
import { Box, TextField, Button, Grid, Paper, Typography, MenuItem, Alert, CircularProgress } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const EmployeeForm = ({ employeeId }) => {
    const { register, handleSubmit, control, formState: { errors }, setValue } = useForm({
        defaultValues: {
            name: '',
            position: '',
            salary: '',
            hire_date: null,
            shift: 'MORNING'
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const isEditMode = !!employeeId;

    useEffect(() => {
        if (isEditMode) {
            const fetchEmployee = async () => {
                setLoading(true);
                try {
                    const response = await getEmployeeById(employeeId);
                    const employee = response.data.data;
                    // Llenar el formulario con los datos del empleado
                    Object.keys(employee).forEach(key => {
                        if (key === 'hire_date') {
                            setValue(key, employee[key] ? dayjs(employee[key]) : null);
                        } else {
                            setValue(key, employee[key] || '');
                        }
                    });
                } catch (err) {
                    setError('Error al cargar los datos del empleado.');
                } finally {
                    setLoading(false);
                }
            };
            fetchEmployee();
        }
    }, [employeeId, isEditMode, setValue]);

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        try {
            const payload = {
                ...data,
                hire_date: data.hire_date ? dayjs(data.hire_date).format('YYYY-MM-DD') : null,
            };
            
            if (isEditMode) {
                await updateEmployee(employeeId, payload);
            } else {
                await createEmployee(payload);
            }
            navigate('/hhrr/employees'); // Redirige a la lista después de guardar
        } catch (err) {
            setError(err.response?.data?.message || 'Ocurrió un error al guardar el empleado.');
            setLoading(false);
        }
    };

    const shiftOptions = ['MORNING', 'AFTERNOON', 'NIGHT'];

    if (loading && isEditMode) {
        return <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
    }

    return (
        <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                {isEditMode ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Nombre Completo *" {...register('name', { required: 'El nombre es obligatorio' })} error={!!errors.name} helperText={errors.name?.message} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Cargo / Posición *" {...register('position', { required: 'El cargo es obligatorio' })} error={!!errors.position} helperText={errors.position?.message} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Controller
                            name="hire_date"
                            control={control}
                            rules={{ required: 'La fecha es obligatoria' }}
                            render={({ field }) => (
                                <DatePicker label="Fecha de Contratación *" value={field.value} onChange={(date) => field.onChange(date)} renderInput={(params) => (<TextField {...params} fullWidth error={!!errors.hire_date} helperText={errors.hire_date?.message} /> )}/>
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                         <TextField select fullWidth label="Turno" {...register('shift')} defaultValue="MORNING">
                             {shiftOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth type="number" label="Salario (Opcional)" {...register('salary', { valueAsNumber: true, min: { value: 0, message: 'El valor debe ser positivo' } })} InputProps={{ inputProps: { step: "0.01" } }} error={!!errors.salary} helperText={errors.salary?.message} />
                    </Grid>
                </Grid>
                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                    <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
                    <Button variant="outlined" onClick={() => navigate('/hhrr/employees')}>Cancelar</Button>
                </Box>
            </form>
        </Paper>
    );
};

export default EmployeeForm;