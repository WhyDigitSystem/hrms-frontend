import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Avatar, Box, Grid, Typography, Button, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import MainCard from 'ui-component/cards/MainCard';
import SkeletonEarningCard from 'ui-component/cards/Skeleton/EarningCard';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';

const CardWrapper = styled(MainCard)(({ theme }) => ({
  background: `linear-gradient(135deg, ${'#264952'} 30%, ${'#23869f'} 90%)`,
  color: '#fff',
  borderRadius: '16px',
  boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.3)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)'
  }
}));

const CheckinDetails = ({ isLoading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [branch] = useState(localStorage.getItem('branch'));
  const [empcode] = useState(localStorage.getItem('employeeCode'));
  const [empName] = useState(localStorage.getItem('employeeName'));
  const [designation] = useState(localStorage.getItem('designation'));
  // const [profileImage] = useState(localStorage.getItem('profileImage'));
  // const [profileImage, setProfileImage] = useState(localStorage.getItem('profileImage') || '');
  const [profileImage, setProfileImage] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [hoursWorked, setHoursWorked] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const storedImage = localStorage.getItem('profileImage');
    if (storedImage) {
      setProfileImage(storedImage);
    }

    const handleImageUpdate = () => {
      const updatedImage = localStorage.getItem('profileImage');
      if (updatedImage) {
        setProfileImage(updatedImage);
      }
    };

    window.addEventListener('profileImageUpdated', handleImageUpdate);

    return () => {
      window.removeEventListener('profileImageUpdated', handleImageUpdate);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    getCheckInOutStatus();
  }, []);

  const handleCheckIn = async () => {
    const now = new Date(); // Freeze current time
    const saveCheckIN = {
      status: true,
      orgId,
      branch,
      empcode,
      empName
    };

    try {
      const result = await apiCalls('put', `basicmaster/createCheckInOut`, saveCheckIN);
      if (result.status === true) {
        showToast('success', 'Check-In Success');

        setCheckInTime(now); // Freeze and store time
        localStorage.setItem('checkInTime', now.toISOString()); // Persist

        setIsCheckedIn(true);
        setCheckOutTime(null); // Clear old checkout
        setHoursWorked(null); // Clear old duration
      } else {
        showToast('error', result.paramObjectsMap?.errorMessage || 'Check-In Failed');
      }
    } catch (err) {
      showToast('error', 'Check-In Failed');
    }
  };

  const handleCheckOut = async () => {
    const checkOut = new Date(); // Freeze current time
    const saveCheckIN = {
      status: false,
      orgId,
      branch,
      empcode,
      empName
    };

    try {
      const result = await apiCalls('put', `basicmaster/createCheckInOut`, saveCheckIN);
      if (result.status === true) {
        showToast('success', 'Check-Out Success');

        setIsCheckedIn(false);
        setCheckOutTime(checkOut); // Freeze and store

        if (checkInTime) {
          const start = new Date(checkInTime);
          const diffMs = checkOut - start;

          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          setHoursWorked(`${hours} hours ${minutes} minutes`);
        }

        localStorage.removeItem('checkInTime'); // Clean up
      } else {
        showToast('error', result.paramObjectsMap?.errorMessage || 'Check-Out Failed');
      }
    } catch (err) {
      showToast('error', 'Check-Out Failed');
    }
  };

  const getCheckInOutStatus = async () => {
    try {
      const response = await apiCalls('get', `basicmaster/chkStatus/${empcode}`);
      if (response.status === true) {
        const employeeStatus = response.paramObjectsMap.EmployeeStatus;
        const status = employeeStatus.status;

        const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD
        const inTime = new Date(`${today}T${employeeStatus.latestIn}`);
        const outTime = new Date(`${today}T${employeeStatus.latestOut}`);

        if (status === 'In') {
          setIsCheckedIn(true);
          setCheckInTime(inTime);
          localStorage.setItem('checkInTime', inTime.toISOString());
        } else {
          setIsCheckedIn(false);
          setCheckInTime(inTime);
          setCheckOutTime(outTime);
          localStorage.removeItem('checkInTime');
        }
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  return isLoading ? (
    <SkeletonEarningCard />
  ) : (
    <Box>
      <Grid item>
        <Typography variant="h6" sx={{ mb: 0, mt:2, color: 'black', fontWeight: 'bold', fontSize: isMobile ? '16px' : '18px' }}>
          Quick Access
        </Typography>
      </Grid>

      <CardWrapper border={false} content={false} sx={{ mt: 4, pt: 1 }}>
        <Box sx={{ p: isMobile ? 1.5 : 2.25 }}>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={`data:image/png;base64,${profileImage}`}
                    sx={{
                      width: isMobile ? 56 : 64,
                      height: isMobile ? 56 : 64,
                      border: `2px solid ${isCheckedIn ? '#4caf50' : '#f44336'}`,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Box>
                    <Typography variant="h5" color="secondary.light" sx={{ fontSize: isMobile ? '16px' : '18px' }}>
                      {empName}
                    </Typography>
                    <Typography variant="body2" color="secondary.light" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                      {empcode} - {designation}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  mt:2,
                  justifyContent: { xs: 'center', lg: 'flex-start' },
                  flexDirection: { xs: 'row', sm: 'row' },
                  mb: 2,
                  pl: { lg: 5 },
                  ml: { lg: 5 },
                  width: '100%'
                }}
              >
                {!isCheckedIn && !checkInTime ? (
                  <Button
                    variant="contained"
                    startIcon={<LoginIcon />}
                    color="primary"
                    sx={{
                      minWidth: isMobile ? 48 : 120,
                      px: isMobile ? 1.5 : 2,
                      py: 1,
                      borderRadius: '10px',
                      textTransform: 'none',
                      bgcolor: 'success.main',
                      '&:hover': {
                        bgcolor: 'success.dark'
                      }
                    }}
                    onClick={handleCheckIn}
                  >
                    {!isMobile && 'Check-In'}
                  </Button>
                ) : checkInTime instanceof Date && isCheckedIn ? (
                  <Box
                    sx={{
                      minWidth: isMobile ? 48 : 120,
                      px: 2,
                      py: 1,
                      borderRadius: '10px',
                      bgcolor: 'grey.300'
                    }}
                  >
                    <Typography variant="body2" align="center">
                      <LoginIcon /> In at {checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<LoginIcon />}
                    color="primary"
                    sx={{
                      minWidth: isMobile ? 48 : 120,
                      px: isMobile ? 1.5 : 2,
                      py: 1,
                      borderRadius: '10px',
                      textTransform: 'none',
                      bgcolor: 'success.main',
                      '&:hover': {
                        bgcolor: 'success.dark'
                      }
                    }}
                    onClick={handleCheckIn}
                  >
                    {!isMobile && 'Check-In'}
                  </Button>
                )}

                {isCheckedIn ? (
                  <Button
                    variant="contained"
                    startIcon={<LogoutIcon />}
                    color="secondary"
                    sx={{
                      minWidth: isMobile ? 48 : 120,
                      px: isMobile ? 1.5 : 2,
                      py: 1,
                      borderRadius: '10px',
                      textTransform: 'none',
                      bgcolor: 'error.main',
                      '&:hover': {
                        bgcolor: 'error.dark'
                      }
                    }}
                    onClick={handleCheckOut}
                  >
                    {!isMobile && 'Check-Out'}
                  </Button>
                ) : checkOutTime instanceof Date ? (
                  <Box
                    sx={{
                      minWidth: isMobile ? 48 : 120,
                      px: 2,
                      py: 1,
                      borderRadius: '10px',
                      bgcolor: 'grey.300'
                    }}
                  >
                    <Typography variant="body2" align="center">
                      <LogoutIcon /> Out at {checkOutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                ) : null}
              </Box>

              {/* <List sx={{ color: '#fff', pl: { lg: 5 }, ml: { lg: 5 } }}>
                {checkInTime && (
                  <ListItem>
                    <AccessTimeIcon sx={{ mr: 1 }} />
                    Checked In At: {checkInTime.toLocaleTimeString()}
                  </ListItem>
                )}
                {checkOutTime && (
                  <ListItem>
                    <AccessTimeFilledIcon sx={{ mr: 1 }} />
                    Checked Out At: {checkOutTime.toLocaleTimeString()}
                  </ListItem>
                )}
                {hoursWorked && <ListItem>⏱ Total Time Worked: {hoursWorked}</ListItem>}
              </List> */}
            </Grid>
          </Grid>
        </Box>
      </CardWrapper>
    </Box>
  );
};

CheckinDetails.propTypes = {
  isLoading: PropTypes.bool
};

export default CheckinDetails;
