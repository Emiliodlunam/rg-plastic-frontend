import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct } from '../../api/inventoryService';
import ProductRow from '../../components/inventory/ProductRow';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, Box, Typography, CircularProgress, Alert, TextField,
  InputAdornment, IconButton, Pagination, Stack
} from '@mui/material';
import { Add, Search, Refresh, FileDownload } from '@mui/icons-material';
import { CSVLink } from 'react-csv';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Estados para la exportación
  const [exportData, setExportData] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const csvLinkRef = useRef(null);

  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getProducts({ search: searchTerm, page, limit: 10 });
      setProducts(response.data.data.products);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      setError('Error al cargar los productos. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Lógica de exportación
  const handleExport = async () => {
    setExportLoading(true);
    setError('');
    try {
      // Obtener TODOS los productos (sin paginación)
      const response = await getProducts({ search: searchTerm, limit: 9999, page: 1 });
      const allProducts = response.data.data.products;
      
      // Formatear los datos para el CSV
      const formattedData = allProducts.map(p => ({
        SKU: p.sku,
        Descripcion: p.description,
        Tipo: p.type,
        Unidad: p.unit,
        Stock_Actual: p.current_stock,
        Stock_Minimo: p.min_stock,
        Costo: p.cost_price,
        Proveedor: p.supplier_name || 'N/A',
        Ancho: p.width,
        Alto: p.height,
        Calibre: p.gauge,
        Fuelle: p.gusset,
        Peso: p.weight,
        Color: p.color
      }));
      
      setExportData(formattedData);
      
    } catch (err) {
      setError('Error al preparar la exportación: ' + (err.response?.data?.message || err.message));
    } finally {
      setExportLoading(false);
    }
  };
  
  // Cuando los datos de exportación estén listos, disparar la descarga
  useEffect(() => {
    if (exportData && csvLinkRef.current) {
      csvLinkRef.current.link.click();
      setExportData(null);
    }
  }, [exportData]);
  
  // Definir las cabeceras para el archivo CSV
  const csvHeaders = [
    { label: "SKU", key: "SKU" },
    { label: "Descripcion", key: "Descripcion" },
    { label: "Tipo", key: "Tipo" },
    { label: "Unidad", key: "Unidad" },
    { label: "Stock Actual", key: "Stock_Actual" },
    { label: "Stock Minimo", key: "Stock_Minimo" },
    { label: "Costo", key: "Costo" },
    { label: "Proveedor", key: "Proveedor" },
    { label: "Ancho (cm)", key: "Ancho" },
    { label: "Alto (cm)", key: "Alto" },
    { label: "Calibre (mic)", key: "Calibre" },
    { label: "Fuelle (cm)", key: "Fuelle" },
    { label: "Peso (kg)", key: "Peso" },
    { label: "Color", key: "Color" }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await deleteProduct(productId);
        fetchProducts();
      } catch (err) {
        setError('Error al eliminar el producto. ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <Paper sx={{ p: 3, width: '100%', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>Inventario</Typography>
        <Box>
          <IconButton onClick={fetchProducts} color="primary" sx={{ mr: 1 }}>
            <Refresh />
          </IconButton>
          <Button 
            variant="outlined" 
            startIcon={exportLoading ? <CircularProgress size={20} /> : <FileDownload />} 
            sx={{ mr: 2 }}
            onClick={handleExport}
            disabled={exportLoading}
          >
            {exportLoading ? 'Preparando...' : 'Exportar a CSV'}
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/inventory/products/new')}>
            Nuevo Producto
          </Button>
          
          {/* Enlace oculto para la descarga del CSV */}
          {exportData && (
            <CSVLink
              data={exportData}
              headers={csvHeaders}
              filename={`reporte_inventario_${new Date().toISOString().slice(0,10)}.csv`}
              ref={csvLinkRef}
              style={{ display: 'none' }}
            />
          )}
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField 
          fullWidth 
          size="small" 
          variant="outlined" 
          placeholder="Buscar por código o descripción..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ 
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ) 
          }}
        />
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table aria-label="collapsible table">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell />
                  <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Estado Stock</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Proveedor</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <ProductRow key={product.id} product={product} handleDelete={handleDelete} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack spacing={2} sx={{ mt: 3, alignItems: 'center' }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
            />
          </Stack>
        </>
      )}
    </Paper>
  );
};

export default ProductsPage;