import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Typography,
  Box,
  Chip,
  Divider,
  Tooltip,
  Paper,
  Fade,
  Skeleton,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import CelebrationIcon from '@mui/icons-material/Celebration';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function WorkAnniversaries() {
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [todayAnniversaries, setTodayAnniversaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState('');

  useEffect(() => {
    if (orgId) fetchWorkAnniversaries();
  }, [orgId]);

  const fetchWorkAnniversaries = async () => {
    setIsLoading(true);
    try {
      const result = await apiCalls('get', `/basicmaster/Getworkaniversary?orgId=${orgId}`);
      if (result?.status && result?.paramObjectsMap?.employee?.length > 0) {
        const anniversaries = result.paramObjectsMap.employee.map(emp => ({
          name: emp.employee || emp.employeecode || 'Employee',
          initials: (emp.employee?.[0] || emp.employeecode?.[0] || 'E').toUpperCase(),
          employeeId: emp.employeecode || emp.employeeid || 'N/A',
          role: emp.designation || 'Employee',
          gender: emp.gender || '',
          years: emp.noofyears || 0,
          image: '', // Optional future enhancement
          department: emp.department || '',
        }));
        setTodayAnniversaries(anniversaries);
      } else {
        setTodayAnniversaries([]);
      }
      if (result?.paramObjectsMap?.employeeVO?.length > 0) {
        const empData = result.paramObjectsMap.employeeVO[0];
        setEmployeeData(empData);

        // Optionally update localStorage with fetched data
        if (empData.profileImage) {
          localStorage.setItem('profileImage', empData.profileImage);
        }
      }
    } catch (error) {
      console.error('Error fetching work anniversaries:', error);
      showToast('Failed to fetch work anniversaries', 'error');
      setTodayAnniversaries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    pauseOnHover: true,
  };

  return (
    <Box mt={4} px={2} sx={{ overflow: 'hidden' }}>
      {/* Inline CSS for animations - move to global CSS if desired */}
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(21, 101, 192, 0.4);
            }
            70% {
              transform: scale(1.05);
              box-shadow: 0 0 0 10px rgba(21, 101, 192, 0);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(21, 101, 192, 0);
            }
          }
        `}
      </style>

      <Typography
        variant="h4"
        sx={{
          color: '#1976d2',
          fontWeight: 700,
          textAlign: 'center',
          mb: 4,
          letterSpacing: 1,
          animation: 'pulse 3s infinite',
          background: 'linear-gradient(90deg, #1565c0, #42a5f5)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        🎉 Today’s Work Anniversaries
      </Typography>

      {isLoading ? (
        <Box textAlign="center">
          <Skeleton variant="text" width="60%" height={40} sx={{ mx: 'auto' }} />
          <Skeleton
            variant="rectangular"
            width="90%"
            height={200}
            sx={{ mx: 'auto', borderRadius: 4 }}
          />
        </Box>
      ) : todayAnniversaries.length > 0 ? (
        <Slider {...sliderSettings}>
          {todayAnniversaries.map((person, index) => (
            <Box key={index} px={2}>
              <Fade in timeout={800}>
                <Paper
                  elevation={6}
                  sx={{
                    borderRadius: 6,
                    p: 4,
                    backdropFilter: 'blur(8px)',
                    background: 'rgba(255, 255, 255, 0.85)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={2}
                      flexDirection={{ xs: 'column', sm: 'row' }}
                    >
                      <Avatar
                        src={
                          employeeData?.profileImage
                            ? `data:image/png;base64,${employeeData?.profileImage}`
                            : ''
                        }
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: '#1976d2',
                          fontSize: 32,
                          border: '3px solid white',
                          boxShadow: 2,
                          animation: 'pulse 2s infinite',
                        }}
                      >
                        {!employeeData?.profileImage && person.initials}
                      </Avatar>
                      <Box textAlign={{ xs: 'center', sm: 'left' }}>
                        <Typography variant="h6" fontWeight="bold">
                          {person.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {person.role}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {person.employeeId}
                        </Typography>
                      </Box>
                    </Box>

                    {/* {person.department && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {person.department}
                      </Typography>
                    )} */}

                    <Divider sx={{ width: '100%', my: 2 }} />

                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                      }}
                    >
                      <Tooltip title="Years of Contribution" arrow>
                        <Chip
                          icon={<CelebrationIcon />}
                          label={`${person.years} Year${person.years > 1 ? 's' : ''}`}
                          color="primary"
                          sx={{
                            fontWeight: 'bold',
                            px: 1,
                            animation: 'pulse 2s infinite',
                          }}
                        />
                      </Tooltip>

                      <Tooltip title="Work Anniversary" arrow>
                        <Chip
                          icon={<WorkIcon />}
                          label="Happy Anniversary!"
                          color="success"
                          variant="outlined"
                          sx={{ px: 1 }}
                        />
                      </Tooltip>
                    </Box>
                  </Box>
                </Paper>
              </Fade>
            </Box>
          ))}
        </Slider>
      ) : (
        <Typography
          variant="body2"
          align="center"
          sx={{
            color: '#757575',
            fontStyle: 'italic',
            mt: 2,
          }}
        >
          No work anniversaries today
        </Typography>
      )}
    </Box>
  );
}

export default WorkAnniversaries;
