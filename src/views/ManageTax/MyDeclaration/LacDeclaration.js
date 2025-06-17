import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, useTheme,
  TextField, TableContainer, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, IconButton, Chip, Select, MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
  FormatListBulletedTwoTone as FormatListBulletedTwoToneIcon,
  Save as SaveIcon,
  CheckCircleOutline,
  CancelOutlined
} from '@mui/icons-material';

import apiCalls from 'apicall';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';

function LacDeclaration() {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [finYear] = useState('APR 2025 - MAR 2026');
  const orgId = parseInt(localStorage.getItem('orgId'));
  const createdBy = localStorage.getItem('userName');
  const branch = localStorage.getItem('branch') || '';
  const branchCode = localStorage.getItem('branchCode') || '';
  const department = localStorage.getItem('department') || '';
  const employeeCode = localStorage.getItem('employeeCode') || '';
  const employeeName = localStorage.getItem('userName') || '';

  // State for deductions data
  const [deductions, setDeductions] = useState([
    {
      id: 1,
      section: '80C',
      deductions: 'Life Insurance Premium',
      maxLimit: '150000',
      declaration: '',
      proof: '',
      status: 'Auto Accepted'
    }
  ]);

  // Function to handle input changes in deductions table
  const handleDeductionChange = (id, field, value) => {
    setDeductions(
      deductions.map((item) => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Function to handle status change
  const handleStatusChange = (id, status) => {
    setDeductions(
      deductions.map((item) => 
        item.id === id ? { ...item, status } : item
      )
    );
  };

  // Function to add new deduction row
  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      section: '',
      deductions: '',
      maxLimit: '',
      declaration: '',
      proof: '',
      status: 'Auto Accepted'
    };
    setDeductions([...deductions, newRow]);
  };

  // Function to delete deduction row
  const handleDeleteRow = (id) => {
    if (deductions.length > 1) {
      setDeductions(deductions.filter(item => item.id !== id));
    }
  };

  // Function to clear all deductions
  const handleClear = () => {
    setDeductions([
      {
        id: 1,
        section: '80C',
        deductions: 'Life Insurance Premium',
        maxLimit: '150000',
        declaration: '',
        proof: '',
        status: 'Auto Accepted'
      }
    ]);
  };

  // Function to save deductions data
  const handleSaveDeductions = async () => {
    setIsLoading(true);
    
    // Validate that all declarations have values
    const hasEmptyDeclaration = deductions.some(d => 
      d.declaration === '' || d.declaration === null || d.declaration === undefined
    );
    
    if (hasEmptyDeclaration) {
      showToast('error', 'Please fill in all declaration amounts');
      setIsLoading(false);
      return;
    }

    const payload = {
      branch,
      branchCode,
      createdBy,
      department,
      employeeCode,
      employeeName,
      finYear: finYear.replace('APR ', '').replace(' - MAR', ''),
      oneCroreFiveLacDeductionsDTO: deductions.map(deduction => ({
        section: deduction.section,
        deductions: deduction.deductions,
        maxLimit: parseFloat(deduction.maxLimit) || 0,
        declaration: deduction.declaration.toString(),
        proof: deduction.proof,
        status: deduction.status
      })),
      otherDeclarationDTO: [],
      orgId
    };

    try {
      const response = await apiCalls(
        'put', 
        '/managetax/createUpdateDeclaration', 
        payload
      );
      
      if (response.status) {
        showToast('success', 'Deductions saved successfully');
      } else {
        showToast('error', response.message || 'Failed to save deductions');
      }
    } catch (error) {
      console.error('Error saving deductions:', error);
      showToast('error', 'Failed to save deductions');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle view toggle
  const handleView = () => setListView(!listView);

  // Calculate summary values
  const declaredAmount = deductions.reduce((sum, item) => 
    sum + parseFloat(item.declaration || 0), 0);
  
  const autoApprovedAmount = deductions.reduce((sum, item) => 
    item.status === 'Auto Accepted' ? sum + parseFloat(item.declaration || 0) : sum, 0);
  
  const acceptedAmount = deductions.reduce((sum, item) => 
    item.status === 'Accepted' ? sum + parseFloat(item.declaration || 0) : sum, 0);
  
  const rejectedAmount = deductions.reduce((sum, item) => 
    item.status === 'Rejected' ? sum + parseFloat(item.declaration || 0) : sum, 0);

  return (
    <>
      <ToastComponent />
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4">
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton 
              title="Save" 
              icon={SaveIcon} 
              onClick={handleSaveDeductions} 
              disabled={isLoading} 
            />
          </div>

          {!listView ? (
            <div className="row d-flex ml">
              <Card elevation={4} sx={{ borderRadius: 2, marginBottom: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    1.5 Lac Deductions
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Deductions under section 80C up to ₹1.5 lakhs
                  </Typography>

                  {/* Amount Display Grid */}
                  <Grid container spacing={3} my={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Amount Declared</Typography>
                      <Typography variant="subtitle1">₹ {declaredAmount.toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Auto Approved Amount</Typography>
                      <Typography variant="subtitle1">₹ {autoApprovedAmount.toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Amount Accepted</Typography>
                      <Typography variant="subtitle1">₹ {acceptedAmount.toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Amount Rejected</Typography>
                      <Typography variant="subtitle1">₹ {rejectedAmount.toLocaleString()}</Typography>
                    </Grid>
                  </Grid>

                  {/* Filter and Search Bar */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
                    <Select 
                      size="small" 
                      defaultValue="All"
                      sx={{ width: '150px' }}
                    >
                      <MenuItem value="All">All Status</MenuItem>
                      <MenuItem value="Auto Accepted">Auto Accepted</MenuItem>
                      <MenuItem value="Accepted">Accepted</MenuItem>
                      <MenuItem value="Rejected">Rejected</MenuItem>
                    </Select>
                    <Box sx={{ flexGrow: 1, ml: 2 }}>
                      <TextField
                        size="small"
                        variant="outlined"
                        placeholder="Search deductions..."
                        fullWidth
                      />
                    </Box>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      startIcon={<AddIcon />}
                      onClick={handleAddRow}
                      sx={{ ml: 2 }}
                    >
                      Add Deduction
                    </Button>
                  </Box>

                  {/* Deductions Table */}
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                          <TableCell>Section</TableCell>
                          <TableCell>Deductions</TableCell>
                          <TableCell>Max Limit (₹)</TableCell>
                          <TableCell>Declaration (₹)</TableCell>
                          <TableCell>Proof</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {deductions.map((row) => (
                          <TableRow hover key={row.id}>
                            <TableCell>
                              <TextField
                                size="small"
                                variant="outlined"
                                placeholder="e.g., 80C"
                                fullWidth
                                value={row.section}
                                onChange={(e) => 
                                  handleDeductionChange(row.id, 'section', e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                variant="outlined"
                                placeholder="Deduction type"
                                fullWidth
                                value={row.deductions}
                                onChange={(e) => 
                                  handleDeductionChange(row.id, 'deductions', e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                variant="outlined"
                                placeholder="Max limit"
                                fullWidth
                                type="number"
                                value={row.maxLimit}
                                onChange={(e) => 
                                  handleDeductionChange(row.id, 'maxLimit', e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                variant="outlined"
                                placeholder="Declared amount"
                                fullWidth
                                type="number"
                                value={row.declaration}
                                onChange={(e) => 
                                  handleDeductionChange(row.id, 'declaration', e.target.value)
                                }
                                required
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                variant="outlined"
                                placeholder="Proof details"
                                fullWidth
                                value={row.proof}
                                onChange={(e) => 
                                  handleDeductionChange(row.id, 'proof', e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={row.status} 
                                size="small" 
                                variant="outlined"
                                color={
                                  row.status === 'Auto Accepted' ? 'success' : 
                                  row.status === 'Accepted' ? 'primary' : 'error'
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Box display="flex" gap={1}>
                                <IconButton 
                                  size="small" 
                                  color="success" 
                                  title="Accept"
                                  onClick={() => handleStatusChange(row.id, 'Accepted')}
                                  disabled={row.status === 'Accepted'}
                                >
                                  <CheckCircleOutline />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  color="error" 
                                  title="Reject"
                                  onClick={() => handleStatusChange(row.id, 'Rejected')}
                                  disabled={row.status === 'Rejected'}
                                >
                                  <CancelOutlined />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  color="secondary" 
                                  title="Delete"
                                  onClick={() => handleDeleteRow(row.id)}
                                  disabled={deductions.length <= 1}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {/* Help text */}
                  <Typography variant="body2" color="textSecondary" mt={2}>
                    Note: Deductions under section 80C are eligible for tax savings up to ₹1.5 lakhs per financial year.
                  </Typography>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card elevation={4} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Saved Deductions
                </Typography>
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
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {deductions.map((row) => (
                        <TableRow hover key={row.id}>
                          <TableCell>{row.section}</TableCell>
                          <TableCell>{row.deductions}</TableCell>
                          <TableCell>₹ {parseFloat(row.maxLimit).toLocaleString()}</TableCell>
                          <TableCell>₹ {parseFloat(row.declaration || 0).toLocaleString()}</TableCell>
                          <TableCell>{row.proof || '-'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={row.status} 
                              size="small" 
                              variant="outlined"
                              color={
                                row.status === 'Auto Accepted' ? 'success' : 
                                row.status === 'Accepted' ? 'primary' : 'error'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

export default LacDeclaration;