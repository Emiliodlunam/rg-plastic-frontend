import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { getCostingHistoryForProduct, createCosting } from '../../api/financeService';
import { getProducts } from '../../api/inventoryService';
import { getProductionOrders, getProductionOrderCostAnalysis } from '../../api/productionService';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Typography, CircularProgress, Alert, TextField,
  Grid, Autocomplete, 
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Add, Calculate } from '@mui/icons-material';
import dayjs from 'dayjs';

const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('es-ES') : 'N/A';
const formatCurrency = (amount) => amount != null ? `$${parseFloat(amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00';

const ProductCostingPage = () => {
  const [costingHistory, setCostingHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [completedOPs, setCompletedOPs] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [calcLoading, setCalcLoading] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const { handleSubmit, control, formState: { errors }, reset, setValue } = useForm({
    defaultValues: {
      material_cost: '',
      labor_cost: '',
      waste_cost: '',
      calculation_date: dayjs()
    }
  });

  // Cargar productos para el selector
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts({ limit: 1000 });
        setProducts(response.data.data.products);
      } catch (err) { setError('Error al cargar la lista de productos.'); }
    };
    fetchProducts();
  }, []);

  // Cargar historial de costeo
  const fetchCostingHistory = useCallback(async (productId) => {
    try {
      setLoadingHistory(true);
      const response = await getCostingHistoryForProduct(productId);
      setCostingHistory(response.data.data);
    } catch (err) { setError('Error al cargar el historial de costeos.'); } 
    finally { setLoadingHistory(false); }
  }, []);

  // Cargar OPs completadas
  const fetchCompletedOPs = useCallback(async (productId) => {
      try {
        const response = await getProductionOrders({ product_id: productId, status: 'COMPLETED', limit: 50 });
        setCompletedOPs(response.data.data.items);
      } catch (err) { setError('Error al cargar las OPs completadas.'); }
  }, []);

  const handleProductChange = (event, newValue) => {
    setSelectedProduct(newValue);
    if (newValue) {
      fetchCostingHistory(newValue.id);
      fetchCompletedOPs(newValue.id);
      setValue('product_id', newValue.id);
    } else {
      setCostingHistory([]);
      setCompletedOPs([]);
      setValue('product_id', null);
    }
  };

  const handleCalculateCosts = async (orderId) => {
    setCalcLoading(true);
    setFormError('');
    try {
      const response = await getProductionOrderCostAnalysis(orderId);
      const data = response.data.data;
      
      setValue('material_cost', data.material_cost);
      setValue('waste_cost', data.waste_cost);
      setValue('labor_cost', ''); // Dejar la mano de obra para ingreso manual
      setValue('calculation_date', dayjs());
      
    } catch (err) {
        setFormError(err.response?.data?.message || 'Error al calcular costos.');
    } finally {
        setCalcLoading(false);
    }
  };

  const onSubmit = async (data) => {
      setFormLoading(true);
      setFormError('');
      setFormSuccess('');
      try {
          const payload = { 
              ...data, 
              product_id: selectedProduct.id,
              calculation_date: dayjs(data.calculation_date).format('YYYY-MM-DD')
            };
          await createCosting(payload);
          setFormSuccess('Nuevo costeo registrado exitosamente.');
          reset({ material_cost: '', labor_cost: '', waste_cost: '', calculation_date: dayjs() });
          fetchCostingHistory(selectedProduct.id);
      } catch(err) {
          setFormError(err.response?.data?.message || 'Error al registrar el costeo.');
      } finally {
          setFormLoading(false);
      }
  };

  return (
    <Paper sx={{ p: 3, width: '100%', borderRadius: 2 }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
        Gestión de Costos por Producto
      </Typography>

      <Autocomplete
        options={products}
        getOptionLabel={(option) => `(${option.sku}) ${option.description}`}
        value={selectedProduct}
        onChange={handleProductChange}
        renderInput={(params) => <TextField {...params} label="Seleccionar Producto" />}
        sx={{ mb: 3 }}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {selectedProduct && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>1. OPs Pendientes de Costeo</Typography>
            <Paper variant="outlined" sx={{ height: 400, overflow: 'auto' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>N° Orden</TableCell>
                                <TableCell>Cantidad</TableCell>
                                <TableCell>Acción</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {completedOPs.map((op) => (
                                <TableRow key={op.id}>
                                    <TableCell>{op.order_number}</TableCell>
                                    <TableCell>{op.quantity}</TableCell>
                                    <TableCell>
                                        <Button
                                            size="small"
                                            startIcon={<Calculate />}
                                            onClick={() => handleCalculateCosts(op.id)}
                                            disabled={calcLoading}
                                        >
                                            Calcular
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {completedOPs.length === 0 && (
                        <Typography sx={{ textAlign: 'center', p: 2, color: 'text.secondary' }}>
                            No hay OPs completadas.
                        </Typography>
                    )}
                </TableContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>2. Registrar Nuevo Costeo</Typography>
                {calcLoading && <CircularProgress size={24} sx={{mb: 2}} />}
                <form onSubmit={handleSubmit(onSubmit)}>
                    {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
                    {formSuccess && <Alert severity="success" sx={{ mb: 2 }}>{formSuccess}</Alert>}
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Controller name="calculation_date" control={control} rules={{ required: 'Fecha requerida' }} render={({ field }) => (
                                // --- CORRECCIÓN DEL ERROR DE MUI ---
                                // Se añade la prop 'enableAccessibleFieldDOMStructure={false}'
                                <DatePicker 
                                    enableAccessibleFieldDOMStructure={false}
                                    label="Fecha del Cálculo *" 
                                    value={field.value} 
                                    onChange={(date) => field.onChange(date)} 
                                    slots={{ textField: (params) => <TextField {...params} fullWidth size="small" error={!!errors.calculation_date} helperText={errors.calculation_date?.message}/> }}
                                />
                            )}/>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Controller name="material_cost" control={control} render={({ field }) => (
                                <TextField {...field} fullWidth label="Costo Material (Calculado)" type="number" size="small" InputProps={{ inputProps: { step: "0.01" } }} />
                            )}/>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Controller name="waste_cost" control={control} render={({ field }) => (
                                <TextField {...field} fullWidth label="Costo Merma (Calculado)" type="number" size="small" InputProps={{ inputProps: { step: "0.01" } }} />
                            )}/>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Controller name="labor_cost" control={control} render={({ field }) => (
                                <TextField {...field} fullWidth label="Mano de Obra (Manual) *" type="number" size="small" InputProps={{ inputProps: { step: "0.01" } }} />
                            )}/>
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" startIcon={<Add />} disabled={formLoading}>
                                {formLoading ? 'Guardando...' : 'Guardar Costeo'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>3. Historial de Costeos</Typography>
                {loadingHistory ? <CircularProgress /> : (
                    <TableContainer component={Paper} variant="outlined" sx={{ height: 300, overflow: 'auto' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'grey.100' }}>
                                    <TableCell>Fecha Cálculo</TableCell>
                                    <TableCell align="right">Material</TableCell>
                                    <TableCell align="right">M. Obra</TableCell>
                                    <TableCell align="right">Merma</TableCell>
                                    <TableCell align="right">Costo Total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {costingHistory.map((cost) => (
                                    <TableRow key={cost.id} hover>
                                        <TableCell>{formatDate(cost.calculation_date)}</TableCell>
                                        <TableCell align="right">{formatCurrency(cost.material_cost)}</TableCell>
                                        <TableCell align="right">{formatCurrency(cost.labor_cost)}</TableCell>
                                        <TableCell align="right">{formatCurrency(cost.waste_cost)}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(cost.total)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {costingHistory.length === 0 && (
                            <Typography sx={{ textAlign: 'center', p: 3, color: 'text.secondary' }}>
                                No hay registros de costeo.
                            </Typography>
                        )}
                    </TableContainer>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

export default ProductCostingPage;