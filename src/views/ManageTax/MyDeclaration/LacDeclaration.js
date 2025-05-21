import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, useTheme } from '@mui/material';
import { AccountBalance as AccountBalanceIcon, Payment as PaymentIcon } from '@mui/icons-material';

function LacDeclaration() {
  const theme = useTheme();

  return (
    <Box sx={{ p: { xs: 2, sm: 4 } }}>
      <Card elevation={6} sx={{ borderRadius: 4, mb: 4 }}>
        <CardContent>
          {/* Header Section */}
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalanceIcon color="primary" />
            Lac Declaration Details
          </Typography>

          <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
            Below is the breakdown of your Lac Declaration. Ensure that all information is accurately declared to avoid discrepancies in the tax calculation.
          </Typography>

          {/* Grid Section for Data Cards */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={3} sx={{ padding: 2, bgcolor: theme.palette.primary.light, textAlign: 'center' }}>
                <Typography variant="h6">Declared Amount</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>₹ 1,50,000</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={3} sx={{ padding: 2, bgcolor: theme.palette.secondary.light, textAlign: 'center' }}>
                <Typography variant="h6">Proof Submitted</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Yes</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={3} sx={{ padding: 2, bgcolor: theme.palette.warning.light, textAlign: 'center' }}>
                <Typography variant="h6">Pending Verification</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>No</Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Buttons Section */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button variant="contained" color="primary" startIcon={<PaymentIcon />} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              Make Payment
            </Button>
            <Button variant="outlined" color="secondary" sx={{ width: { xs: '100%', sm: 'auto' } }}>
              View History
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LacDeclaration;
