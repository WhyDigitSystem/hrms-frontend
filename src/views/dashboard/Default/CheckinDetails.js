import PropTypes from 'prop-types';
import { useState } from 'react';
import { Avatar, Box, Grid, Typography, List, ListItem, Button, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import MainCard from 'ui-component/cards/MainCard';
import SkeletonEarningCard from 'ui-component/cards/Skeleton/EarningCard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ToastComponent, { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';
import { display } from '@mui/system';

const CardWrapper = styled(MainCard)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  color: '#fff',
  borderRadius: '16px',
  boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.3)'
}));

const StyledButton = styled(Button)(({ active }) => ({
  width: '130px',
  padding: '10px 20px',
  fontSize: '16px',
  borderRadius: '8px',
  backgroundColor: active ? '#ff3d00' : '#007bff',
  color: '#fff',
  '&:hover': {
    backgroundColor: active ? '#d32f2f' : '#0056b3'
  },
  '&:disabled': {
    backgroundColor: '#d3d3d3',
    color: '#6c757d',
    cursor: 'not-allowed'
  }
}));

const CheckinDetails = ({ isLoading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Detect mobile devices
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [empcode, setEmpCode] = useState(localStorage.getItem('employeeCode'));
  const [empName, setEmpName] = useState(localStorage.getItem('employeeName'));
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null); // State to store check-in time
  const [checkOutTime, setCheckOutTime] = useState(null); // State to store check-out time
  const [hoursWorked, setHoursWorked] = useState(null); // State to store hours worked

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
        setCheckInTime(new Date()); // Set check-in time
        setCheckOutTime(null); // Reset check-out time
        setHoursWorked(null); // Reset hours worked
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
        const checkOut = new Date(); // Get current time for check-out
        setCheckOutTime(checkOut);

        // Calculate hours worked
        if (checkInTime) {
          const timeDiff = checkOut - checkInTime; // Difference in milliseconds
          const hours = Math.floor(timeDiff / (1000 * 60 * 60)); // Convert to hours
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          setHoursWorked(`${hours} hours ${minutes} minutes`); // Set hours worked
        }
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
        <div>
          <Grid item>
            <Typography variant="h6" sx={{ mb: 1, color: 'black', fontWeight: 'bold', fontSize: isMobile ? '16px' : '18px' }}>
              Quick Access
            </Typography>
          </Grid>

          <CardWrapper border={false} content={false}>
            <Box sx={{ p: isMobile ? 1.5 : 2.25 }}>
              <Grid container direction="column" spacing={2}>
                {/* Profile Section */}
                <Grid item>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: isMobile ? 2 : 0 }}>
                      <Avatar alt={empName} src="/path/to/avatar.jpg" sx={{ width: isMobile ? 50 : 60, height: isMobile ? 50 : 60, mr: 2 }} />
                      <Box>
                        <Typography variant="h5" color="secondary.light" sx={{ fontSize: isMobile ? '16px' : '18px' }}>
                          {empName}
                        </Typography>
                        <Typography variant="body2" color="secondary.light" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                          {empcode} - Software Engineer
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: isMobile ? 1 : 2, mt: isMobile ? 2 : 0 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{
                          width: isMobile ? '100px' : '120px',
                          fontSize: isMobile ? '12px' : '14px',
                          backgroundColor: isCheckedIn ? '#d3d3d3' : '#007bff',
                          color: isCheckedIn ? '#6c757d' : 'white',
                          cursor: isCheckedIn ? 'not-allowed' : 'pointer',
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
                          width: isMobile ? '100px' : '120px',
                          fontSize: isMobile ? '12px' : '14px',
                          backgroundColor: isCheckedIn ? '#ba3a5a' : '#ba3a5a',
                          color: isCheckedIn ? 'white' : '#6c757d',
                          cursor: isCheckedIn ? 'pointer' : 'not-allowed',
                          '&:hover': {
                            backgroundColor: isCheckedIn ? '#bf5d75' : '#d3d3d3'
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
                  <Typography variant="h6" sx={{ mb: 2, color: 'secondary.light', fontSize: isMobile ? '16px' : '18px' }}>
                    Recent Activity
                  </Typography>
                  <List sx={{ borderRadius: '8px', p: 0, display: 'flex', flexDirection: 'column' }}>
                    <div className='d-flex '>
                      <ListItem sx={{ px: 0 }}>
                        <AccessTimeIcon sx={{ mr: 2, color: 'secondary.light', fontSize: isMobile ? '18px' : '24px' }} />
                        <Typography sx={{ color: 'secondary.light', fontSize: isMobile ? '12px' : '14px' }}>
                          {checkInTime ? `Check-In at ${checkInTime.toLocaleTimeString()}` : 'No Check-In Recorded'}
                        </Typography>
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <AccessTimeIcon sx={{ mr: 2, color: 'secondary.light', fontSize: isMobile ? '18px' : '24px' }} />
                        <Typography sx={{ color: 'secondary.light', fontSize: isMobile ? '12px' : '14px' }}>
                          {checkOutTime ? `Check-Out at ${checkOutTime.toLocaleTimeString()}` : 'No Check-Out Recorded'}
                        </Typography>
                      </ListItem>
                    </div>
                    {hoursWorked && (
                      <ListItem sx={{ px: 0 }}>
                        <AccessTimeIcon className='text-muted' sx={{ mr: 2, color: 'secondary.light', fontSize: isMobile ? '18px' : '24px' }} />
                        <Typography className='text-muted' sx={{ color: 'secondary.light', fontSize: isMobile ? '12px' : '14px' }}>
                          Hours Worked: {hoursWorked}
                        </Typography>
                      </ListItem>
                    )}
                  </List>
                </Grid>
              </Grid>
            </Box>
          </CardWrapper>
        </div>
      )}
    </>
  );
};

CheckinDetails.propTypes = {
  isLoading: PropTypes.bool
};

export default CheckinDetails;