import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { getEmployees } from '../../api/hhrrService';
import {
  TextField, Button, Alert,
  CircularProgress, Autocomplete, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const ShiftFormModal = ({ open, onClose, onSave, existingShift }) => {
    const { register, handleSubmit, control, formState: { errors }, reset, setValue } = useForm({
        defaultValues: {
            employee_id: null,
            date: dayjs(),
            machine: '',
            duration: 8
        }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await getEmployees({ limit: 1000 });
                setEmployees(response.data.data.items);
            } catch (err) {
                console.error("Error al cargar empleados", err);
                setError("No se pudieron cargar los empleados.");
            }
        };
        fetchEmployees();
    }, []);

    useEffect(() => {
        // Rellenar el formulario cuando se abre en modo edición
        if (open && existingShift && employees.length > 0) {
            const employee = employees.find(e => e.id === existingShift.employee_id);
            setValue('employee_id', employee || null);
            setValue('date', dayjs(existingShift.date));
            setValue('machine', existingShift.machine || '');
            setValue('duration', existingShift.duration || 8);
        } 
        // Limpiar el formulario cuando se abre en modo creación
        else if (open && !existingShift) {
            reset({
                employee_id: null,
                date: dayjs(),
                machine: '',
                duration: 8
            });
        }
    }, [existingShift, open, employees, setValue, reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        try {
            const payload = {
                ...data,
                employee_id: data.employee_id ? data.employee_id.id : null,
                date: dayjs(data.date).format('YYYY-MM-DD'),
            };
            await onSave(payload); // onSave es (createShift) o (updateShift)
            onClose(); // Cierra el modal al guardar
        } catch (err) {
            setError(err.response?.data?.message || 'Ocurrió un error al guardar el turno.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>
                {existingShift ? 'Editar Turno' : 'Asignar Nuevo Turno'}
            </DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)} id="shift-form">
                    {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
                    <Grid container spacing={3} sx={{ pt: 2 }}>
                        {/* Se usa 'item' prop para compatibilidad con MUI v5 Grid */}
                        <Grid item xs={12}>
                             <Controller
                                name="employee_id"
                                control={control}
                                rules={{ required: 'Debe seleccionar un empleado' }}
                                render={({ field }) => (
                                    <Autocomplete
                                        {...field}
                                        options={employees}
                                        getOptionLabel={(option) => option.name || ""}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        onChange={(e, newValue) => field.onChange(newValue)}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Empleado *" error={!!errors.employee_id} helperText={errors.employee_id?.message} />
                                        )}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="date"
                                control={control}
                                rules={{ required: 'La fecha es obligatoria' }}
                                render={({ field }) => (
                                    // --- CORRECCIÓN DEL ERROR DE MUI ---
                                    // Se añade la prop 'enableAccessibleFieldDOMStructure={false}'
                                    <DatePicker 
                                        enableAccessibleFieldDOMStructure={false}
                                        label="Fecha del Turno *" 
                                        value={field.value} 
                                        onChange={(date) => field.onChange(date)}
                                        slots={{
                                            textField: (params) => (
                                                <TextField 
                                                    {...params} 
                                                    fullWidth 
                                                    error={!!errors.date} 
                                                    helperText={errors.date?.message} 
                                                />
                                            )
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                         <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="number" label="Duración (horas) *" {...register('duration', { required: true, valueAsNumber: true, min: 1 })} InputProps={{ inputProps: { step: "0.5", min: 1 } }} error={!!errors.duration} helperText={errors.duration?.message} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Máquina Asignada (Opcional)" {...register('machine')} />
                        </Grid>
                    </Grid>
                </form>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose}>Cancelar</Button>
                <Button type="submit" form="shift-form" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Guardar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ShiftFormModal;