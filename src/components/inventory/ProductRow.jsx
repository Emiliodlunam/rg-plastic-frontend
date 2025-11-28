import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableRow, TableCell, IconButton, Collapse, Box, Typography, Chip } from '@mui/material';
import { Edit, Delete, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

const ProductRow = ({ product, handleDelete }) => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const getStockStatus = (prod) => {
        if (prod.current_stock <= 0) return { label: 'Crítico', color: 'error' };
        if (prod.current_stock <= prod.min_stock) return { label: 'Bajo Stock', color: 'warning' };
        return { label: 'OK', color: 'success' };
    };

    const status = getStockStatus(product);

    return (
        <React.Fragment>
            {/* Fila Principal */}
            <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                </TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>
                    <Chip label={status.label} color={status.color} size="small" variant="outlined" />
                </TableCell>
                <TableCell>{product.supplier_name || 'N/A'}</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                    <IconButton color="primary" size="small" onClick={() => navigate(`/inventory/products/edit/${product.id}`)}>
                        <Edit />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => handleDelete(product.id)}>
                        <Delete />
                    </IconButton>
                </TableCell>
            </TableRow>
            {/* Fila Colapsable con Detalles */}
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, padding: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Detalles del Producto
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                                <Box>
                                    <Typography variant="caption" display="block" color="text.secondary">Stock Actual</Typography>
                                    <Typography variant="body2">{product.current_stock} {product.unit}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" display="block" color="text.secondary">Stock Mínimo</Typography>
                                    <Typography variant="body2">{product.min_stock} {product.unit}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" display="block" color="text.secondary">Precio Costo</Typography>
                                    <Typography variant="body2">${product.cost_price}</Typography>
                                </Box>
                                {product.type === 'FINISHED_PRODUCT' && (
                                    <>
                                        <Box>
                                            <Typography variant="caption" display="block" color="text.secondary">Ancho</Typography>
                                            <Typography variant="body2">{product.width || 'N/A'} cm</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" display="block" color="text.secondary">Alto</Typography>
                                            <Typography variant="body2">{product.height || 'N/A'} cm</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" display="block" color="text.secondary">Calibre</Typography>
                                            <Typography variant="body2">{product.gauge || 'N/A'} mic</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" display="block" color="text.secondary">Fuelle</Typography>
                                            <Typography variant="body2">{product.gusset || 'N/A'} cm</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" display="block" color="text.secondary">Peso</Typography>
                                            <Typography variant="body2">{product.weight || 'N/A'} kg</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" display="block" color="text.secondary">Color</Typography>
                                            <Typography variant="body2">{product.color || 'N/A'}</Typography>
                                        </Box>
                                    </>
                                )}
                            </Box>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};

export default ProductRow;