import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { getClients, createSalesOrder } from '../../api/salesService';
import { getProducts } from '../../api/inventoryService';
import {
  Box, TextField, Button, Paper, Typography, Alert,
  CircularProgress, Autocomplete, IconButton, Divider, Grid
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

const OrderCreatePage = () => {
  const defaultFormValues = {
    client_id: null,
    delivery_date: '',
    notes: '',
    products: [{ product_id: null, quantity: 1, price: '' }]
  };

  const { register, handleSubmit, control, formState: { errors }, reset, watch } = useForm({
    defaultValues: defaultFormValues
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'products' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [clients, setClients] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [clientsRes, productsRes] = await Promise.all([
          getClients({ limit: 1000 }),
          getProducts({ limit: 1000 })
        ]);
        setClients(clientsRes.data.data.items);
        setAvailableProducts(productsRes.data.data.products.filter(p => p.type === 'FINISHED_PRODUCT'));
      } catch (err) {
        setError('No se pudieron cargar los datos necesarios (clientes y productos).');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...data,
        client_id: data.client_id ? data.client_id.id : null,
        products: data.products.map(p => ({
          ...p,
          product_id: p.product_id ? p.product_id.id : null
        }))
      };
      await createSalesOrder(payload);
      setSuccess('Pedido creado exitosamente. Se ha actualizado el stock.');
      reset(defaultFormValues);
    } catch (err) {
      setError(err.response?.data?.message || 'Ocurrió un error al crear el pedido.');
    } finally {
      setLoading(false);
    }
  };
  
  const watchedProducts = watch('products');

  const calculateSubtotal = () => {
    if (!watchedProducts) return 0;
    return watchedProducts.reduce((acc, current) => {
        const qty = parseFloat(current.quantity) || 0;
        const price = parseFloat(current.price) || 0;
        return acc + (qty * price);
    }, 0);
  };
  const subtotal = calculateSubtotal();
  const taxes = subtotal * 0.16;
  const total = subtotal + taxes;

  return (
    <Paper sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Crear Nuevo Pedido de Venta
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
        
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }}><Typography variant="overline">1. Seleccionar Cliente y Fecha</Typography></Divider>
          
          {/* --- SECCIÓN CORREGIDA --- */}
          {/* Usamos Box para un control simple y directo. Cada campo está en su propia fila. */}
          
          {/* Fila 1: Cliente (ocupa 100% del ancho) */}
          <Box sx={{ mb: 3 }}>
              <Controller
                name="client_id"
                control={control}
                rules={{ required: 'Debe seleccionar un cliente' }}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={clients}
                    getOptionLabel={(option) => option.code ? `(${option.code}) ${option.name}` : ""}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    onChange={(e, newValue) => field.onChange(newValue)}
                    renderInput={(params) => (
                      <TextField {...params} label="Cliente *" error={!!errors.client_id} helperText={errors.client_id?.message}/>
                    )}
                  />
                )}
              />
          </Box>
          
          {/* Fila 2: Fecha de Entrega (ocupa 1/3 del ancho para estética) */}
          <Box sx={{ mb: 2, width: '33%' }}>
              <TextField
                fullWidth
                type="date"
                label="Fecha de Entrega *"
                {...register('delivery_date', { required: 'La fecha de entrega es obligatoria' })}
                error={!!errors.delivery_date}
                helperText={errors.delivery_date?.message}
                InputLabelProps={{ shrink: true }}
              />
          </Box>
          {/* ------------------------- */}
          
          <Divider sx={{ mt: 4, mb: 2 }}><Typography variant="overline">2. Añadir Productos</Typography></Divider>
          
          {fields.map((item, index) => (
            <Box key={item.id} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <Box sx={{ width: '60%' }}>
                    <Controller
                        name={`products.${index}.product_id`}
                        control={control}
                        rules={{ required: 'Seleccione un producto' }}
                        render={({ field }) => (
                            <Autocomplete
                                {...field}
                                options={availableProducts}
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
                                    <TextField {...params} label={`Producto ${index + 1} *`} error={!!errors.products?.[index]?.product_id} helperText={errors.products?.[index]?.product_id?.message} />
                                )}
                            />
                        )}
                    />
                </Box>
                <Box sx={{ width: '15%' }}>
                    <TextField type="number" label="Cantidad *" {...register(`products.${index}.quantity`, { required: true, valueAsNumber: true, min: 1 })} InputProps={{ inputProps: { min: 1 } }} error={!!errors.products?.[index]?.quantity} fullWidth/>
                </Box>
                <Box sx={{ width: '20%' }}>
                    <TextField type="number" label="Precio Unit. *" {...register(`products.${index}.price`, { required: true, valueAsNumber: true, min: 0 })} InputProps={{ inputProps: { step: "0.01", min: 0 } }} error={!!errors.products?.[index]?.price} fullWidth/>
                </Box>
                <Box sx={{ width: '5%' }}>
                    {fields.length > 1 && (
                    <IconButton onClick={() => remove(index)} color="error">
                        <Delete />
                    </IconButton>
                    )}
                </Box>
            </Box>
          ))}
          
          <Button startIcon={<Add />} onClick={() => append({ product_id: null, quantity: 1, price: '' })}>
              Añadir Otro Producto
          </Button>

          <Divider sx={{ mt: 4, mb: 2 }}><Typography variant="overline">3. Detalles Adicionales</Typography></Divider>
          <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <TextField label="Notas Adicionales" multiline rows={4} {...register('notes')} fullWidth />
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, height: '100%' }}>
                    <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal:</span><strong>${subtotal.toFixed(2)}</strong></Typography>
                    <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}><span>Impuestos (16%):</span><strong>${taxes.toFixed(2)}</strong></Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="h6" sx={{ display: 'flex', justifyContent: 'space-between' }}><span>Total:</span><strong>${total.toFixed(2)}</strong></Typography>
                </Box>
              </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button type="submit" variant="contained" disabled={loading}>{loading ? <CircularProgress size={24} /> : 'Crear Pedido'}</Button>
          <Button variant="outlined" onClick={() => navigate('/sales/clients')}>Cancelar</Button>
        </Box>
      </form>
    </Paper>
  );
};

export default OrderCreatePage;