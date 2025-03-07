import PropTypes from 'prop-types';
import { useState } from 'react';
import { Avatar, Box, Grid, Typography, List, ListItem, Divider, Button } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import MainCard from 'ui-component/cards/MainCard';
import SkeletonEarningCard from 'ui-component/cards/Skeleton/EarningCard';
import { motion } from 'framer-motion';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ToastComponent, { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';

const CardWrapper = styled(MainCard)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  color: '#fff',
  borderRadius: '16px',
  boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.3)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)'
  }
}));

const StyledButton = styled(Button)(({ active }) => ({
  width: '130px',
  padding: '10px 20px',
  fontSize: '16px',
  borderRadius: '8px',
  transition: 'all 0.3s ease-in-out',
  backgroundColor: active ? '#ff3d00' : '#007bff',
  color: '#fff',
  '&:hover': {
    backgroundColor: active ? '#d32f2f' : '#0056b3',
    transform: 'scale(1.05)'
  },
  '&:disabled': {
    backgroundColor: '#d3d3d3',
    color: '#6c757d',
    cursor: 'not-allowed'
  }
}));

const CheckinDetails = ({ isLoading }) => {
  const theme = useTheme();
  const currentDate = new Date();
  const month = currentDate.toLocaleString('default', { month: 'long' }); // e.g., January
  const date = currentDate.getDate(); // e.g., 29
  const year = currentDate.getFullYear(); // e.g., 2025
  const time = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // e.g., 09:30 AM
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [empcode, setEmpCode] = useState(localStorage.getItem('employeeCode'));
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const handleCheckIn = async () => {
    const saveCheckIN = {
      status: true,
      orgId: orgId,
      branch: branch,
      empcode: empcode
    };

    try {
      const result = await apiCalls('put', `basicmaster/createCheckInOut`, saveCheckIN);

      if (result.status === true) {
        showToast('success', 'Check-In Success');
        setIsCheckedIn(true); // Enable Check-Out, Disable Check-In
      } else {
        showToast('error', result.paramObjectsMap.errorMessage || 'Check-In Failed');
      }
    } catch (err) {
      showToast('error', 'Check-In Failed');
    }
  };

  const handleCheckOut = async () => {
    const saveCheckIN = {
      status: false,
      orgId: orgId,
      branch: branch,
      empcode: empcode
    };

    try {
      const result = await apiCalls('put', `basicmaster/createCheckInOut`, saveCheckIN);

      if (result.status === true) {
        showToast('success', 'Check-Out Success');
        setIsCheckedIn(false); // Disable Check-Out, Enable Check-In
      } else {
        showToast('error', result.paramObjectsMap.errorMessage || 'Check-Out Failed');
      }
    } catch (err) {
      showToast('error', 'Check-Out Failed');
    }
  };

  return (
    <>
      {isLoading ? (
        <SkeletonEarningCard />
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Grid item>
            <Typography variant="h6" sx={{ mb: 1, color: 'black', fontWeight: 'bold', fontSize: '18px' }}>
              Quick Access
            </Typography>
          </Grid>

          <CardWrapper border={false} content={false}>

            <Box sx={{ p: 2.25 }}>
              <Grid container direction="column" spacing={2}>
                {/* Profile Section */}
                <Grid item>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar alt="User" src="/path/to/avatar.jpg" sx={{ width: 60, height: 60, mr: 2 }} />
                      <Box>
                        <Typography variant="h5" color="secondary.light">Dineshkumar P</Typography>
                        <Typography variant="body2" color="secondary.light">WDS007 - Software Engineer</Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{
                          mr: 2,
                          width: '120px',
                          backgroundColor: isCheckedIn ? '#d3d3d3' : '#007bff',
                          color: isCheckedIn ? '#6c757d' : 'white',
                          cursor: isCheckedIn ? 'not-allowed' : 'pointer',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          '&:hover': {
                            backgroundColor: isCheckedIn ? '#d3d3d3' : '#0056b3'
                          }
                        }}
                        onClick={handleCheckIn}
                        disabled={isCheckedIn}
                      >
                        Check-In
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        sx={{
                          width: '120px',
                          backgroundColor: isCheckedIn ? '#ba3a5a ' : '#ba3a5a ',
                          color: isCheckedIn ? 'white' : '#6c757d',
                          cursor: isCheckedIn ? 'pointer' : 'not-allowed',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          '&:hover': {
                            backgroundColor: isCheckedIn ? '#bf5d75 ' : '#d3d3d3'
                          }
                        }}
                        onClick={handleCheckOut}
                        disabled={!isCheckedIn}
                      >
                        Check-Out
                      </Button>
                    </Box>
                  </Box>
                </Grid>

                {/* Recent Activity Section */}
                <Grid item>
                  <Typography variant="h6" sx={{ mb: 2, color: 'secondary.light' }}>Recent Activity</Typography>
                  <List sx={{ borderRadius: '8px', p: 0 }}>
                    <ListItem sx={{ px: 0 }}>
                      <AccessTimeIcon sx={{ mr: 2, color: 'secondary.light' }} />
                      <Typography sx={{ color: 'secondary.light' }}>Check-In at 9:00 AM</Typography>
                    </ListItem>
                    <Divider variant="inset" component="li" sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                    <ListItem sx={{ px: 0 }}>
                      <AccessTimeIcon sx={{ mr: 2, color: 'secondary.light' }} />
                      <Typography sx={{ color: 'secondary.light' }}>Check-Out at 5:30 PM</Typography>
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Box>
          </CardWrapper>
        </motion.div>
      )}
    </>
  );
};

CheckinDetails.propTypes = {
  isLoading: PropTypes.bool
};

export default CheckinDetails;