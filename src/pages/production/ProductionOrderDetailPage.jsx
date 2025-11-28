import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductionOrderById, updateProductionOrderStatus, registerProductionConsumption, registerProductionBatch, registerWaste } from '../../api/productionService';
import { getProducts } from '../../api/inventoryService';
import { useForm, Controller } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import {
  Box, Paper, Typography, CircularProgress, Alert, Grid,
  Button, Chip, Stack, Select, MenuItem, FormControl, InputLabel,
  Divider, TextField, Autocomplete, Snackbar, Fade, Card, CardContent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Helpers
const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('es-ES') : 'N/A';
const formatNumber = (num) => num !== null && num !== undefined ? num : 'N/A';

// Mapeo de estados y prioridades
const statusColors = { PENDING: 'warning', IN_PROGRESS: 'info', COMPLETED: 'success', CANCELLED: 'error' };
const priorityColors = { LOW: 'success', MEDIUM: 'info', HIGH: 'warning', URGENT: 'error' };
const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const processOptions = ['EXTRUSION', 'PRINTING', 'CUTTING', 'SEALING', 'PACKAGING'];

const ProductionOrderDetailPage = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [consumptionError, setConsumptionError] = useState('');
  const [consumptionSuccess, setConsumptionSuccess] = useState('');
  const [batchError, setBatchError] = useState('');
  const [batchSuccess, setBatchSuccess] = useState('');
  const [wasteError, setWasteError] = useState('');
  const [wasteSuccess, setWasteSuccess] = useState('');
  const [rawMaterials, setRawMaterials] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Hook Form para el formulario de consumo
  const { handleSubmit: handleConsumptionSubmit, control: consumptionControl, formState: { errors: consumptionErrors }, reset: resetConsumptionForm } = useForm({
    defaultValues: {
      material_id: null,
      consumed_quantity: ''
    }
  });

  // Hook Form para el formulario de registro de lote
  const { register: registerBatch, handleSubmit: handleBatchSubmit, control: batchControl, formState: { errors: batchErrors }, reset: resetBatchForm } = useForm({
    defaultValues: {
      batch_number: '',
      quantity_produced: '',
      production_date: dayjs(),
      quality: 'RELEASED'
    }
  });

  // Hook Form para el formulario de registro de merma
  const { register: registerWasteForm, handleSubmit: handleWasteSubmit, control: wasteControl, formState: { errors: wasteErrors }, reset: resetWasteForm } = useForm({
    defaultValues: {
      process: '',
      quantity: '',
      reason: ''
    }
  });

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getProductionOrderById(orderId);
      setOrder(response.data.data);
    } catch (err) {
      setError('Error al cargar los detalles de la orden. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();

    const fetchRawMaterials = async () => {
      try {
        const response = await getProducts({ limit: 1000, type: 'RAW_MATERIAL' });
        setRawMaterials(response.data.data.products);
      } catch (err) {
        console.error("Error al cargar materias primas", err);
      }
    };
    fetchRawMaterials();
  }, [fetchOrderDetails]);

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;
    if (!newStatus || newStatus === order.status) return;

    setActionLoading(true);
    setError('');
    try {
      await updateProductionOrderStatus(orderId, newStatus);
      await fetchOrderDetails();
      setSnackbar({ open: true, message: '¡Estado actualizado correctamente!', severity: 'success' });
    } catch (err) {
      setError('Error al actualizar el estado. ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const onConsumptionSubmit = async (data) => {
    setActionLoading(true);
    setConsumptionError('');
    setConsumptionSuccess('');
    try {
      const payload = {
        material_id: data.material_id ? data.material_id.id : null,
        consumed_quantity: data.consumed_quantity
      };
      await registerProductionConsumption(orderId, payload);
      const successMsg = `¡Consumo registrado exitosamente! ${data.consumed_quantity} unidades de ${data.material_id.description}`;
      setConsumptionSuccess(successMsg);
      setSnackbar({ open: true, message: successMsg, severity: 'success' });
      resetConsumptionForm();
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setConsumptionSuccess(''), 5000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al registrar el consumo.';
      setConsumptionError(errorMsg);
      setTimeout(() => setConsumptionError(''), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  const onBatchSubmit = async (data) => {
    setActionLoading(true);
    setBatchError('');
    setBatchSuccess('');
    try {
      const payload = {
        ...data,
        production_date: data.production_date ? dayjs(data.production_date).format('YYYY-MM-DD') : null,
      };
      await registerProductionBatch(orderId, payload);
      const successMsg = `¡Lote ${data.batch_number} registrado exitosamente! Cantidad producida: ${data.quantity_produced}`;
      setBatchSuccess(successMsg);
      setSnackbar({ open: true, message: successMsg, severity: 'success' });
      resetBatchForm({
        batch_number: '',
        quantity_produced: '',
        production_date: dayjs(),
        quality: 'RELEASED'
      });
      
      setTimeout(() => setBatchSuccess(''), 5000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al registrar el lote.';
      setBatchError(errorMsg);
      setTimeout(() => setBatchError(''), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  const onWasteSubmit = async (data) => {
    setActionLoading(true);
    setWasteError('');
    setWasteSuccess('');
    try {
      await registerWaste(orderId, data);
      const successMsg = `¡Merma registrada correctamente! Cantidad: ${data.quantity} en proceso ${data.process}`;
      setWasteSuccess(successMsg);
      setSnackbar({ open: true, message: successMsg, severity: 'warning' });
      resetWasteForm();
      
      setTimeout(() => setWasteSuccess(''), 5000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al registrar la merma.';
      setWasteError(errorMsg);
      setTimeout(() => setWasteError(''), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error && !actionLoading) {
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }

  if (!order) {
    return <Typography sx={{ m: 3 }}>No se encontró la orden de producción.</Typography>;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: 3 }}>
        {/* Cabecera */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Orden: {order.order_number}
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/production/orders')}
            sx={{ borderRadius: 2 }}
          >
            Volver a la lista
          </Button>
        </Box>

        <Stack direction="row" spacing={2} sx={{ mb: 4, flexWrap: 'wrap' }}>
          <Chip 
            label={`Prioridad: ${order.priority}`} 
            color={priorityColors[order.priority] || 'default'} 
            sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
          />
          <Chip 
            label={`Estado: ${order.status}`} 
            color={statusColors[order.status] || 'default'} 
            sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
          />
        </Stack>

        {error && actionLoading && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Panel de Actualizar Estado */}
        <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
              Actualizar Estado
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Nuevo Estado</InputLabel>
                <Select
                  value={order.status}
                  label="Nuevo Estado"
                  onChange={handleStatusChange}
                  disabled={actionLoading || order.status === 'COMPLETED' || order.status === 'CANCELLED'}
                >
                  {validStatuses.map(statusOption => (
                    <MenuItem key={statusOption} value={statusOption}>{statusOption}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {actionLoading && <CircularProgress size={24} />}
            </Box>
          </CardContent>
        </Card>

        {/* Información Principal */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
                  Información del Producto
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}><strong>SKU:</strong> {order.product_sku}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}><strong>Descripción:</strong> {order.product_description}</Typography>
                <Typography variant="body1"><strong>Cantidad a Producir:</strong> {order.quantity}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
                  Planificación
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}><strong>Inicio Planificado:</strong> {formatDate(order.planned_start_date)}</Typography>
                <Typography variant="body1"><strong>Fin Planificado:</strong> {formatDate(order.planned_end_date)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* REGISTRAR CONSUMO */}
        <Divider sx={{ my: 4 }} />
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary', mb: 3 }}>
          Registrar Consumo de Materia Prima
        </Typography>
        <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <form onSubmit={handleConsumptionSubmit(onConsumptionSubmit)}>
              <Fade in={!!consumptionError}>
                <Box>
                  {consumptionError && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setConsumptionError('')}>
                      {consumptionError}
                    </Alert>
                  )}
                </Box>
              </Fade>
              <Fade in={!!consumptionSuccess}>
                <Box>
                  {consumptionSuccess && (
                    <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircleIcon />} onClose={() => setConsumptionSuccess('')}>
                      {consumptionSuccess}
                    </Alert>
                  )}
                </Box>
              </Fade>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={7}>
                  <Controller
                    name="material_id"
                    control={consumptionControl}
                    rules={{ required: 'Seleccione la materia prima' }}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        options={rawMaterials}
                        getOptionLabel={(option) => option.sku ? `(${option.sku}) ${option.description}` : ""}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        onChange={(e, newValue) => field.onChange(newValue)}
                        renderOption={(props, option) => (
                          <Box component="li" {...props} key={option.id}>
                            <Box>
                              <Typography variant="body2">{`(${option.sku}) ${option.description}`}</Typography>
                              <Typography variant="caption" color="text.secondary">Stock: {option.current_stock}</Typography>
                            </Box>
                          </Box>
                        )}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            label="Materia Prima *" 
                            size="small" 
                            error={!!consumptionErrors.material_id} 
                            helperText={consumptionErrors.material_id?.message}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Controller
                    name="consumed_quantity"
                    control={consumptionControl}
                    rules={{ required: 'Ingrese cantidad', valueAsNumber: true, min: { value: 0.01, message: 'Debe ser > 0' } }}
                    render={({ field }) => (
                      <TextField 
                        {...field} 
                        fullWidth 
                        type="number" 
                        label="Cantidad Consumida *" 
                        size="small" 
                        InputProps={{ inputProps: { step: "0.01", min: "0.01" } }} 
                        error={!!consumptionErrors.consumed_quantity} 
                        helperText={consumptionErrors.consumed_quantity?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    startIcon={<AddShoppingCartIcon />} 
                    disabled={actionLoading}
                    fullWidth
                    sx={{ height: 40, borderRadius: 2 }}
                  >
                    {actionLoading ? <CircularProgress size={20} color="inherit"/> : 'Registrar'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        {/* REGISTRAR LOTE */}
        <Divider sx={{ my: 4 }} />
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary', mb: 3 }}>
          Registrar Lote de Producción Terminado
        </Typography>
        <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <form onSubmit={handleBatchSubmit(onBatchSubmit)}>
              <Fade in={!!batchError}>
                <Box>
                  {batchError && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setBatchError('')}>
                      {batchError}
                    </Alert>
                  )}
                </Box>
              </Fade>
              <Fade in={!!batchSuccess}>
                <Box>
                  {batchSuccess && (
                    <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircleIcon />} onClose={() => setBatchSuccess('')}>
                      {batchSuccess}
                    </Alert>
                  )}
                </Box>
              </Fade>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField 
                    label="Número de Lote *" 
                    {...registerBatch('batch_number', { required: 'El número de lote es obligatorio' })}
                    error={!!batchErrors.batch_number}
                    helperText={batchErrors.batch_number?.message}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField 
                    type="number"
                    label="Cantidad Producida *" 
                    {...registerBatch('quantity_produced', { required: 'Cantidad obligatoria', valueAsNumber: true, min: { value: 0.01, message: 'Debe ser > 0' } })}
                    error={!!batchErrors.quantity_produced}
                    helperText={batchErrors.quantity_produced?.message}
                    InputProps={{ inputProps: { step: "0.01", min: "0.01" } }} 
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Controller
                    name="production_date"
                    control={batchControl}
                    render={({ field }) => (
                      <DatePicker 
                        label="Fecha Producción" 
                        value={field.value} 
                        onChange={(date) => field.onChange(date)} 
                        renderInput={(params) => (<TextField {...params} fullWidth size="small" />)}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    startIcon={<CheckBoxIcon />} 
                    disabled={actionLoading}
                    fullWidth
                    sx={{ height: 40, borderRadius: 2 }}
                  >
                    {actionLoading ? <CircularProgress size={20} color="inherit"/> : 'Registrar'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        {/* REGISTRAR MERMA */}
        <Divider sx={{ my: 4 }} />
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary', mb: 3 }}>
          Registrar Merma
        </Typography>
        <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <form onSubmit={handleWasteSubmit(onWasteSubmit)}>
              <Fade in={!!wasteError}>
                <Box>
                  {wasteError && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setWasteError('')}>
                      {wasteError}
                    </Alert>
                  )}
                </Box>
              </Fade>
              <Fade in={!!wasteSuccess}>
                <Box>
                  {wasteSuccess && (
                    <Alert severity="warning" sx={{ mb: 2 }} icon={<CheckCircleIcon />} onClose={() => setWasteSuccess('')}>
                      {wasteSuccess}
                    </Alert>
                  )}
                </Box>
              </Fade>
              <Grid container spacing={2} alignItems="flex-start">
                <Grid item xs={12} md={4}>
                  <Controller
                    name="process"
                    control={wasteControl}
                    rules={{ required: 'Seleccione el proceso' }}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField 
                        select 
                        fullWidth 
                        label="Proceso *" 
                        {...field} 
                        size="small" 
                        error={!!wasteErrors.process} 
                        helperText={wasteErrors.process?.message}
                      >
                        {processOptions.map(option => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    type="number"
                    label="Cantidad Merma *"
                    {...registerWasteForm('quantity', { required: 'Cantidad obligatoria', valueAsNumber: true, min: { value: 0.01, message: 'Debe ser > 0' } })}
                    error={!!wasteErrors.quantity}
                    helperText={wasteErrors.quantity?.message}
                    InputProps={{ inputProps: { step: "0.01", min: "0.01" } }}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Razón (Opcional)"
                    {...registerWasteForm('reason')}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="warning"
                    startIcon={<ReportProblemIcon />}
                    disabled={actionLoading}
                    fullWidth
                    sx={{ height: 40, borderRadius: 2 }}
                  >
                    {actionLoading ? <CircularProgress size={20} color="inherit"/> : 'Registrar'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        {/* Detalles Técnicos y Notas */}
        <Divider sx={{ my: 4 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
                  Detalles Técnicos
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}><strong>Calibre:</strong> {formatNumber(order.gauge)} micras</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}><strong>Medidas:</strong> {order.measures || 'N/A'}</Typography>
                <Typography variant="body1"><strong>Máquina:</strong> {order.machine || 'N/A'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
                  Notas
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {order.notes || 'Sin notas'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%', borderRadius: 2 }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductionOrderDetailPage;