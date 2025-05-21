import React from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Select, MenuItem, Chip, Link,
  Divider, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Alert, IconButton, Collapse, Button
} from '@mui/material';
import { CheckCircleOutline, CancelOutlined, AddCircleOutline } from '@mui/icons-material';

const TaxSavingAllowances = () => {
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);

  const handleCollapse = () => setOpen(!open);

  return (
    <Box p={2} sx={{ backgroundColor: theme.palette.background.default }}>
      <Card elevation={4} sx={{ borderRadius: 2, marginBottom: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexDirection={{ xs: 'column', sm: 'row' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, textAlign: { xs: 'center', sm: 'left' } }}>
              Tax Saving Allowances
            </Typography>
            <IconButton color="primary" onClick={handleCollapse} sx={{ ml: { xs: 0, sm: 2 } }}>
              {open ? 'Collapse' : 'Expand'}
            </IconButton>
          </Box>

          {/* Collapsible Content */}
          <Collapse in={open}>
            <Typography variant="body2" color="textSecondary" gutterBottom sx={{ textAlign: 'center' }}>
              Tax saving allowances include deductions available under sections like 80C, 80D, etc. These deductions help in reducing taxable income.
            </Typography>

            {/* Amount Display Grid */}
            <Grid container spacing={3} my={3} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between">
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">Amount Declared</Typography>
                <Typography variant="subtitle1">INR 0</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">Auto Approval Amount</Typography>
                <Typography variant="subtitle1">INR 0</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">Amount Accepted</Typography>
                <Typography variant="subtitle1">INR 0</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">Amount Rejected</Typography>
                <Typography variant="subtitle1">INR 0</Typography>
              </Grid>
            </Grid>

            {/* Information Alert */}
            <Alert severity="warning" sx={{ my: 2 }}>
              Tax exempted values are based on the amount allocated in your salary structure. Please check the income tax calculation to view the tax exempted amount.
            </Alert>

            {/* Filter and Search Bar */}
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" my={2}>
              <Select size="small" defaultValue="Status" sx={{ width: { xs: '100%', sm: '150px' }, marginBottom: { xs: 2, sm: 0 } }}>
                <MenuItem value="Status">Status</MenuItem>
                <MenuItem value="Accepted">Accepted</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
              <Box sx={{ flexGrow: 1, ml: 2 }}>
                <input
                  type="text"
                  placeholder="Search"
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid #ccc',
                    width: '100%',
                    marginBottom: { xs: 2, sm: 0 }
                  }}
                />
              </Box>
            </Box>

            {/* Table Container */}
            <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 'none' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                    <TableCell>Section</TableCell>
                    <TableCell>Deduction Name</TableCell>
                    <TableCell>Max Exemption Limit</TableCell>
                    <TableCell>Declaration</TableCell>
                    <TableCell>Proof</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No records found
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Collapse>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TaxSavingAllowances;
