import React from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Select, MenuItem, Chip, Paper,
  useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton
} from '@mui/material';
import { CheckCircleOutline, CancelOutlined } from '@mui/icons-material';

const OtherDeductions = () => {
  const theme = useTheme();

  return (
    <Box p={4} sx={{ backgroundColor: theme.palette.background.default }}>
      {/* Main Card for Other Deductions */}
      <Card elevation={4} sx={{ borderRadius: 2, marginBottom: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Other Deductions
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Other Deductions under chapter VI(A) from 80CCD(1B) to 80U.
          </Typography>

          {/* Amount Display Grid */}
          <Grid container spacing={3} my={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Amount Declared</Typography>
              <Typography variant="subtitle1">INR 0</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Auto Approved Amount</Typography>
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

          {/* Filter and Search Bar */}
          <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
            <Select size="small" defaultValue="Status" sx={{ width: '150px' }}>
              <MenuItem value="Status">Status</MenuItem>
              <MenuItem value="Accepted">Accepted</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
            <Box sx={{ flexGrow: 1, ml: 2 }}>
              <input type="text" placeholder="Search" style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #ccc', width: '100%' }} />
            </Box>
          </Box>

          {/* Deductions Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                  <TableCell>Section</TableCell>
                  <TableCell>Deductions</TableCell>
                  <TableCell>Max Limit</TableCell>
                  <TableCell>Declaration</TableCell>
                  <TableCell>Proof</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow hover>
                  <TableCell>80CCD(2)</TableCell>
                  <TableCell>NPS Employer Contribution</TableCell>
                  <TableCell>No Limit</TableCell>
                  <TableCell>Not Declared</TableCell>
                  <TableCell>No Proof</TableCell>
                  <TableCell>
                    <Chip label="Auto Accepted" color="success" size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <CheckCircleOutline color="primary" />
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell>80C</TableCell>
                  <TableCell>Life Insurance Premium</TableCell>
                  <TableCell>₹1,50,000</TableCell>
                  <TableCell>Declared</TableCell>
                  <TableCell>Yes</TableCell>
                  <TableCell>
                    <Chip label="Rejected" color="error" size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <CancelOutlined color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OtherDeductions;
