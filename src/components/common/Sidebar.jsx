import React, { useState } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, Collapse } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ArticleIcon from '@mui/icons-material/Article';
import GroupIcon from '@mui/icons-material/Group';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'; 
import TrendingUpIcon from '@mui/icons-material/TrendingUp'; 
import TrendingDownIcon from '@mui/icons-material/TrendingDown'; 
import ShowChartIcon from '@mui/icons-material/ShowChart'; 
import CalculateIcon from '@mui/icons-material/Calculate'; 
import PersonAddIcon from '@mui/icons-material/PersonAdd'; 
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People'; 
import EventAvailableIcon from '@mui/icons-material/EventAvailable'; 
import PaymentsIcon from '@mui/icons-material/Payments'; 
import ScheduleIcon from '@mui/icons-material/Schedule';
import PolicyIcon from '@mui/icons-material/Policy';

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { 
        text: 'Inventario', 
        icon: <InventoryIcon />,
        // Sub-menú para el módulo de inventario
        subItems: [
            { text: 'Ver Inventario', icon: <ArticleIcon />, path: '/inventory/products' },
            { text: 'Registrar Entrada', icon: <AddCircleOutlineIcon />, path: '/inventory/movements/entry' },
            { text: 'Registrar Salida', icon: <RemoveCircleOutlineIcon />, path: '/inventory/movements/exit' },
        ]
    },
    { text: 'Producción', 
        icon: <PrecisionManufacturingIcon />,
        subItems: [
            { text: 'Ver Órdenes', icon: <PlaylistPlayIcon />, path: '/production/orders' },
            { text: 'Nueva Orden', icon: <AddCircleOutlineIcon />, path: '/production/orders/new' },
            { text: 'Reporte de Mermas', icon: <ReportProblemIcon />, path: '/production/reports/wastes' }, // <-- Nuevo enlace
        ]
    },
    { 
        text: 'Ventas', 
        icon: <PointOfSaleIcon />,
        subItems: [
            { text: 'Clientes', icon: <GroupIcon />, path: '/sales/clients' },
            { text: 'Ver Pedidos', icon: <ReceiptIcon />, path: '/sales/orders' },
            { text: 'Crear Pedido', icon: <AddCircleOutlineIcon />, path: '/sales/orders/new' },
            { text: 'Reporte de Ventas', icon: <AssessmentIcon />, path: '/sales/reports/dashboard' },
    
        ]
    },
    {
        text: 'Finanzas',
        icon: <MonetizationOnIcon />,
        subItems: [
            { text: 'Ingresos', icon: <TrendingUpIcon />, path: '/finances/incomes' },
            { text: 'Egresos', icon: <TrendingDownIcon />, path: '/finances/expenses' },
            { text: 'Reporte Utilidad', icon: <ShowChartIcon />, path: '/finances/reports/profit-by-client' },
            { text: 'Costeo de Productos', icon: <CalculateIcon />, path: '/finances/costing' }, 
        ]
    },
    {
        text: 'RRHH',
        icon: <PeopleIcon />,
        subItems: [
            { text: 'Empleados', icon: <PersonAddIcon />, path: '/hhrr/employees' },
            { text: 'Usuarios', icon: <AdminPanelSettingsIcon />, path: '/hhrr/users' },
            { text: 'Asistencia', icon: <EventAvailableIcon />, path: '/hhrr/attendance' },
            { text: 'Reporte de Nómina', icon: <PaymentsIcon />, path: '/hhrr/payroll' }, 
            { text: 'Planif. Turnos', icon: <ScheduleIcon />, path: '/hhrr/shifts' },
            { text: 'Auditoría', icon: <PolicyIcon />, path: '/hhrr/audit' },        ]
    }
];

const Sidebar = () => {
    // Estado para controlar qué sub-menú está abierto
    const [openSubMenu, setOpenSubMenu] = useState('');
    const location = useLocation();

    const handleSubMenuClick = (text) => {
        setOpenSubMenu(openSubMenu === text ? '' : text);
    };

    // Determinar si una ruta de sub-menú está activa
    const isSubItemActive = (subItems) => {
        return subItems.some(item => location.pathname.startsWith(item.path));
    };

    return (
        <Box
            component="nav"
            sx={{ width: 240, flexShrink: 0, bgcolor: 'white', borderRight: '1px solid rgba(0, 0, 0, 0.12)' }}
        >
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '64px' }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Stockify
                </Typography>
            </Box>
            <Divider />
            <List>
                {menuItems.map((item) => {
                    // Si el item tiene sub-menú
                    if (item.subItems) {
                        const isOpen = openSubMenu === item.text || isSubItemActive(item.subItems);
                        return (
                            <React.Fragment key={item.text}>
                                <ListItemButton onClick={() => handleSubMenuClick(item.text)}>
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} />
                                    {isOpen ? <ExpandLess /> : <ExpandMore />}
                                </ListItemButton>
                                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        {item.subItems.map((subItem) => (
                                            <ListItemButton
                                                key={subItem.text}
                                                component={NavLink}
                                                to={subItem.path}
                                                sx={{ pl: 4 }} // Añadimos padding para anidarlo visualmente
                                            >
                                                <ListItemIcon>{subItem.icon}</ListItemIcon>
                                                <ListItemText primary={subItem.text} />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </Collapse>
                            </React.Fragment>
                        );
                    }
                    // Si es un item normal sin sub-menú
                    return (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton component={NavLink} to={item.path}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );
};

export default Sidebar;