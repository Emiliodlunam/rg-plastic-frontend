import React, { useState, useEffect, useCallback, useRef } from 'react'; // Importar useRef
import { useNavigate } from 'react-router-dom';
import { getClients, deleteClient } from '../../api/salesService';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Box, Typography, CircularProgress, Alert, TextField,
  InputAdornment, IconButton, Pagination, Stack
} from '@mui/material';
import { Add, Search, Edit, Delete, FileDownload } from '@mui/icons-material'; // Importar FileDownload
import { CSVLink } from 'react-csv'; // Importar la librería de CSV
import dayjs from 'dayjs'; // Para el nombre del archivo

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // --- Estados para la Exportación ---
  const [exportData, setExportData] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const csvLinkRef = useRef(null); // Referencia al enlace de descarga oculto

  const navigate = useNavigate();

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getClients({ search: searchTerm, page, limit: 10 });
      setClients(response.data.data.items);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      setError('Error al cargar los clientes. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // --- Lógica de Exportación ---
  const handleExport = async () => {
    setExportLoading(true);
    setError('');
    try {
      // 1. Obtener TODOS los clientes (sin paginación)
      const response = await getClients({ search: searchTerm, page: 1, limit: 5000 });
      const allClients = response.data.data.items;
      
      // 2. Formatear los datos para el CSV
      const formattedData = allClients.map(client => ({
        Codigo: client.code,
        Nombre: client.name,
        RFC: client.tax_id,
        Contacto: client.contact,
        Telefono: client.phone,
        Email: client.email,
        Direccion: client.address,
        Limite_Credito: client.credit_limit,
        Terminos_Pago_Dias: client.payment_terms
      }));
      
      setExportData(formattedData);
      
    } catch (err) {
      setError('Error al preparar la exportación: ' + (err.response?.data?.message || err.message));
    } finally {
      setExportLoading(false);
    }
  };

  // 3. Cuando los datos están listos, se dispara la descarga
  useEffect(() => {
    if (exportData && csvLinkRef.current) {
      csvLinkRef.current.link.click();
      setExportData(null); // Limpiar
    }
  }, [exportData]);

  // Definir las cabeceras para el archivo CSV
  const csvHeaders = [
    { label: "Código", key: "Codigo" },
    { label: "Nombre", key: "Nombre" },
    { label: "RFC", key: "RFC" },
    { label: "Contacto", key: "Contacto" },
    { label: "Teléfono", key: "Telefono" },
    { label: "Email", key: "Email" },
    { label: "Dirección", key: "Direccion" },
    { label: "Límite de Crédito", key: "Limite_Credito" },
    { label: "Términos (Días)", key: "Terminos_Pago_Dias" }
  ];
  // ---------------------------------

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchClients();
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleDelete = async (clientId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        await deleteClient(clientId);
        fetchClients();
      } catch (err) {
        setError('Error al eliminar el cliente. ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <Paper sx={{ p: 3, width: '100%', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          Gestión de Clientes
        </Typography>
        <Box>
          {/* --- BOTÓN DE EXPORTAR AÑADIDO --- */}
          <Button
            variant="outlined"
            startIcon={exportLoading ? <CircularProgress size={20} /> : <FileDownload />}
            sx={{ mr: 2 }}
            onClick={handleExport}
            disabled={exportLoading}
          >
            {exportLoading ? 'Preparando...' : 'Exportar a CSV'}
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/sales/clients/new')}>
            Nuevo Cliente
          </Button>

          {/* Enlace oculto para la descarga */}
          {exportData && (
              <CSVLink
                  data={exportData}
                  headers={csvHeaders}
                  filename={`reporte_clientes_${dayjs().format('YYYY-MM-DD')}.csv`}
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
          placeholder="Buscar por código o nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>),
          }}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Contacto</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Teléfono</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client) => (
                <TableRow 
                  key={client.id} 
                  hover 
                  sx={{ cursor: 'pointer' }} 
                  onClick={() => navigate(`/sales/clients/${client.id}`)}
                >
                  <TableCell>{client.code}</TableCell>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.contact}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <IconButton 
                      color="primary" 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/sales/clients/edit/${client.id}`);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(client.id);
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
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

export default ClientsPage;