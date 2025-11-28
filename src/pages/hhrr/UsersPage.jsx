import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, deleteUser } from '../../api/hhrrService';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Box, Typography, CircularProgress, Alert, 
  IconButton, Pagination, Stack, Chip
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString('es-ES') : 'N/A';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getUsers({ page, limit: 10 });
      setUsers(response.data.data.items);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      setError('Error al cargar los usuarios. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('¿Estás seguro de desactivar a este usuario?')) {
      try {
        await deleteUser(userId);
        fetchUsers();
      } catch (err) {
        setError('Error al desactivar el usuario. ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <Paper sx={{ p: 3, width: '100%', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          Gestión de Usuarios del Sistema
        </Typography>
        <Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/hhrr/users/new')}>
            Nuevo Usuario
          </Button>
        </Box>
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
                <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Empleado Asignado</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Rol</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Último Login</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.employee_name || '-'}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{formatDate(user.last_login)}</TableCell>
                  <TableCell>
                    <Chip label={user.is_active ? 'Activo' : 'Inactivo'} color={user.is_active ? 'success' : 'error'} size="small" />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <IconButton color="primary" size="small" onClick={() => navigate(`/hhrr/users/edit/${user.id}`)}>
                      <Edit />
                    </IconButton>
                    {user.is_active && ( // Solo mostrar botón de desactivar si está activo
                      <IconButton color="error" size="small" onClick={() => handleDelete(user.id)}>
                        <Delete />
                      </IconButton>
                    )}
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

export default UsersPage;