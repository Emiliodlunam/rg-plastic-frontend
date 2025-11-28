import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Tooltip, Typography, Button, Box, IconButton, Badge, Popover, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // Importar Link
import { getNotificationsSummary } from '../../api/notificationService'; // Importar el nuevo servicio

// Iconos
import NotificationsIcon from '@mui/icons-material/Notifications';
import WarningIcon from '@mui/icons-material/Warning';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    // --- Lógica de Notificaciones ---
    const [notifications, setNotifications] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null); // Para controlar el popover

    // Cargar notificaciones al montar el componente
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await getNotificationsSummary();
                setNotifications(response.data.data);
            } catch (error) {
                console.error("Error al cargar notificaciones:", error);
            }
        };
        fetchNotifications();
    }, []);

    const handleNotificationClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleNotificationClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const totalNotifications = (notifications?.low_stock_count || 0) + (notifications?.pending_quotes_count || 0) + (notifications?.pending_production_count || 0);
    // --- Fin Lógica de Notificaciones ---

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar position="static" color="default" elevation={0} sx={{ bgcolor: 'white', borderRadius: 2 }}>
            <Toolbar>
                <Box sx={{ flexGrow: 1 }} />

                {/* --- NUEVO ICONO DE NOTIFICACIONES --- */}
                <Tooltip title="Notificaciones">
                    <IconButton
                        color="inherit"
                        onClick={handleNotificationClick}
                        sx={{ mr: 2 }}
                    >
                        <Badge badgeContent={totalNotifications} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                </Tooltip>
                {/* ------------------------------------- */}
                
                <Typography sx={{ mr: 2 }}>
                    Bienvenido, {user?.username || 'Usuario'}
                </Typography>
                <Button variant="outlined" color="primary" onClick={handleLogout}>
                    Cerrar Sesión
                </Button>

                {/* --- NUEVO POPOVER (MENÚ) DE NOTIFICACIONES --- */}
                <Popover
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleNotificationClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <Box sx={{ p: 2, minWidth: 300 }}>
                        <Typography variant="h6" gutterBottom>Notificaciones</Typography>
                        <Divider sx={{ mb: 1 }} />
                        {totalNotifications === 0 ? (
                            <Typography sx={{ p: 2, color: 'text.secondary', textAlign: 'center' }}>No hay notificaciones nuevas.</Typography>
                        ) : (
                            <List dense>
                                {notifications?.low_stock_count > 0 && (
                                    <ListItem 
                                        button 
                                        component={RouterLink} 
                                        to="/inventory/products" // Enlace a la página de inventario
                                        onClick={handleNotificationClose}
                                    >
                                        <ListItemIcon>
                                            <WarningIcon color="error" />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary="Alertas de Stock" 
                                            secondary={`${notifications.low_stock_count} producto(s) con bajo stock`} 
                                        />
                                    </ListItem>
                                )}
                                {notifications?.pending_quotes_count > 0 && (
                                    <ListItem 
                                        button 
                                        component={RouterLink} 
                                        to="/sales/orders" // Enlace a la lista de pedidos
                                        onClick={handleNotificationClose}
                                    >
                                        <ListItemIcon>
                                            <RequestQuoteIcon color="info" />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary="Cotizaciones Pendientes" 
                                            secondary={`${notifications.pending_quotes_count} pedido(s) por confirmar`} 
                                        />
                                    </ListItem>
                                )}
                                {notifications?.pending_production_count > 0 && (
                                    <ListItem 
                                        button 
                                        component={RouterLink} 
                                        to="/production/orders" // Enlace a la lista de OPs
                                        onClick={handleNotificationClose}
                                    >
                                        <ListItemIcon>
                                            <QueryBuilderIcon color="secondary" />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary="Producción Pendiente" 
                                            secondary={`${notifications.pending_production_count} orden(es) por iniciar`} 
                                        />
                                    </ListItem>
                                )}
                            </List>
                        )}
                    </Box>
                </Popover>
                {/* ------------------------------------------- */}
            </Toolbar>
        </AppBar>
    );
};

export default Header;