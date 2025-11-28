import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createUser, updateUser, getUserById, getEmployees } from '../../api/hhrrService';
import { 
    Box, TextField, Button, Grid, Paper, Typography, MenuItem, Alert, 
    CircularProgress, Autocomplete, Switch, FormControlLabel 
} from '@mui/material';

const UserForm = ({ userId }) => {
    const { register, handleSubmit, control, formState: { errors }, setValue, watch } = useForm({
        defaultValues: {
            username: '',
            email: '',
            role: '',
            employee_id: null,
            password: '',
            is_active: true
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [employees, setEmployees] = useState([]);
    const navigate = useNavigate();
    const isEditMode = !!userId;

    // Cargar empleados para el selector
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                // Obtenemos todos los empleados (o al menos los que no tienen usuario)
                const response = await getEmployees({ limit: 1000 }); 
                setEmployees(response.data.data.items);
            } catch (err) {
                console.error("Error al cargar empleados", err);
            }
        };
        fetchEmployees();
    }, []);

    // Cargar datos del usuario si estamos en modo edición
    useEffect(() => {
        if (isEditMode) {
            const fetchUser = async () => {
                setLoading(true);
                try {
                    const response = await getUserById(userId);
                    const user = response.data.data;
                    // Llenar formulario
                    setValue('username', user.username);
                    setValue('email', user.email);
                    setValue('role', user.role);
                    setValue('is_active', user.is_active);
                    // Encontrar y setear el objeto completo del empleado
                    if (user.employee_id && employees.length > 0) {
                        const assignedEmployee = employees.find(e => e.id === user.employee_id);
                        if (assignedEmployee) {
                            setValue('employee_id', assignedEmployee);
                        }
                    }
                } catch (err) {
                    setError('Error al cargar los datos del usuario.');
                } finally {
                    setLoading(false);
                }
            };
            if (employees.length > 0) { // Esperar a que los empleados carguen primero
                fetchUser();
            }
        }
    }, [userId, isEditMode, setValue, employees]);
    
    // Recargar datos del usuario si los empleados cargan *después*
    useEffect(() => {
         if (isEditMode && employees.length > 0 && !watch('employee_id')) {
             // ... (lógica similar para recargar el empleado si es necesario)
         }
    }, [employees, isEditMode, watch]);


    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        try {
            // Preparamos el payload
            const payload = {
                ...data,
                employee_id: data.employee_id ? data.employee_id.id : null,
            };
            
            // Si no se escribió una nueva contraseña en modo edición, no la enviamos
            if (isEditMode && (!payload.password || payload.password === '')) {
                delete payload.password;
            }

            if (isEditMode) {
                await updateUser(userId, payload);
            } else {
                await createUser(payload);
            }
            navigate('/hhrr/users');
        } catch (err) {
            setError(err.response?.data?.message || 'Ocurrió un error al guardar el usuario.');
            setLoading(false);
        }
    };
    
    // Roles del sistema (deberían venir de una config o API idealmente)
    const systemRoles = ['Gerente General', 'Jefe de Producción', 'Encargado de Almacén', 'Ejecutiva de Ventas', 'Analista Financiero'];

    if (loading && isEditMode) {
        return <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
    }

    return (
        <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                {isEditMode ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <Controller
                            name="employee_id"
                            control={control}
                            rules={{ required: 'Debe asignar un empleado' }}
                            render={({ field }) => (
                                <Autocomplete
                                    {...field}
                                    options={employees}
                                    getOptionLabel={(option) => option.name || ""}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    onChange={(e, newValue) => field.onChange(newValue)}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Empleado Asignado *" error={!!errors.employee_id} helperText={errors.employee_id?.message} />
                                    )}
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Rol del Sistema *" {...register('role', { required: 'El rol es obligatorio' })} select error={!!errors.role} helperText={errors.role?.message} defaultValue="">
                             {systemRoles.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Nombre de Usuario *" {...register('username', { required: 'El nombre de usuario es obligatorio' })} error={!!errors.username} helperText={errors.username?.message} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Email" type="email" {...register('email')} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            fullWidth 
                            type="password" 
                            label={isEditMode ? "Nueva Contraseña (Opcional)" : "Contraseña *"}
                            {...register('password', { required: !isEditMode })} // Solo requerida si es modo creación
                            error={!!errors.password} 
                            helperText={errors.password?.message} 
                        />
                    </Grid>
                    {isEditMode && (
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel 
                                control={<Controller name="is_active" control={control} render={({ field }) => <Switch {...field} checked={field.value} />} />} 
                                label="Usuario Activo" 
                            />
                        </Grid>
                    )}
                </Grid>
                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                    <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
                    <Button variant="outlined" onClick={() => navigate('/hhrr/users')}>Cancelar</Button>
                </Box>
            </form>
        </Paper>
    );
};

export default UserForm;