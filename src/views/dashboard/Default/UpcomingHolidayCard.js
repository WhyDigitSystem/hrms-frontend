import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Typography,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Divider,
  keyframes,
  useMediaQuery, useTheme
} from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiCalls from 'apicall';

import EventIcon from '@mui/icons-material/Event';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;


const UpcomingHolidayCard = () => {
  const [allHolidays, setAllHolidays] = useState([]);
  const [activeHolidays, setActiveHolidays] = useState([]);
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [viewMoreDialogOpen, setViewMoreDialogOpen] = useState(false);
  const [leaveInfo, setLeaveInfo] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


  const [stats, setStats] = useState({
    totalHolidays: 0,
    upcomingHolidays: 0,
    holidaysThisMonth: 0,
    branchDistribution: []
  });

  useEffect(() => {
    getAllHolidayByOrgId();
    getLeaveInformation();
  }, []);

  const filterActiveHolidays = (holidays) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.holidayDate);
      holidayDate.setHours(0, 0, 0, 0);
      return holidayDate >= today;
    }).sort((a, b) => new Date(a.holidayDate) - new Date(b.holidayDate));
  };

  const getAllHolidayByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/basicmaster/getAllHolidayByOrgId?orgId=${orgId}`);
      if (result?.paramObjectsMap?.holidayVO) {
        const holidays = result.paramObjectsMap.holidayVO;
        setAllHolidays(holidays);
        const active = filterActiveHolidays(holidays);
        setActiveHolidays(active);

        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        const thisMonth = active.filter(h => {
          const date = new Date(h.holidayDate);
          return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
        });

        setStats({
          totalHolidays: active.length,
          upcomingHolidays: active.length,
          holidaysThisMonth: thisMonth.length,
          branchDistribution: []
        });
      } else {
        setAllHolidays([]);
        setActiveHolidays([]);
        setStats({ totalHolidays: 0, upcomingHolidays: 0, holidaysThisMonth: 0, branchDistribution: [] });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setAllHolidays([]);
      setActiveHolidays([]);
      setStats({ totalHolidays: 0, upcomingHolidays: 0, holidaysThisMonth: 0, branchDistribution: [] });
    }
  };

  const getLeaveInformation = async () => {
    try {
      const result = await apiCalls('get', `/leave/getLeaveBalanceByUser?userName=${loginUserName}&orgId=${orgId}`);
      if (result?.paramObjectsMap?.leaveBalance) {
        setLeaveInfo(result.paramObjectsMap.leaveBalance);
      }
    } catch (err) {
      console.error('Error fetching leave data:', err);
      setLeaveInfo([]);
    }
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getDayName = (dateString) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  const getHolidayStatus = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const holidayDate = new Date(dateString);
    return holidayDate < today ? 'past' : 'upcoming';
  };

  const getNextHoliday = () => activeHolidays.slice(0, 1);

  const handleViewMoreOpen = () => setViewMoreDialogOpen(true);
  const handleViewMoreClose = () => setViewMoreDialogOpen(false);

  const HolidayCard = ({ holiday, isHighlighted = false }) => (
    <Paper elevation={isHighlighted ? 2 : 1} sx={{ p: 2, borderRadius: 2, bgcolor: isHighlighted ? '#fff8e1' : 'background.paper', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
        🎉 {holiday.festival}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {getDayName(holiday.holidayDate)}, {formatDate(holiday.holidayDate)}
      </Typography>
      {holiday?.holidayType && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          <strong>Type:</strong> {holiday.holidayType}
        </Typography>
      )}
      {holiday?.description && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          <strong>Description:</strong> {holiday.description}
        </Typography>
      )}
      {holiday?.branch && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          <strong>Branch:</strong> {holiday.branch}
        </Typography>
      )}
    </Paper>
  );

  return (
    <>
      <ToastContainer />
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: '100%', borderRadius: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(63, 81, 181, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 3 }}>
              <EventIcon sx={{ fontSize: 30, color: 'primary.main' }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                🎊 Total Holidays
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {stats.totalHolidays}
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: '100%', borderRadius: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(76, 175, 80, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 3 }}>
              <CalendarMonthIcon sx={{ fontSize: 30, color: '#4CAF50' }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                📅 Holidays This Month
              </Typography>
              {stats.holidaysThisMonth === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No holidays this month
                </Typography>
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'red' }}>
                  {new Date().toLocaleString('default', { month: 'long' })} - {stats.holidaysThisMonth}
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {activeHolidays.length > 0 && (
        <Card sx={{ mb: 3, p: 3, borderRadius: 3, boxShadow: 3, borderLeft: '4px solid #264952' }}>
          <Box
            sx={{
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'flex-start',
              display: 'flex',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <EventIcon sx={{ fontSize: 30, mr: 1, color: '#264952' }} />
              Upcoming Holiday
            </Typography>
            <Button
              variant="contained"
              color="primary"
              endIcon={<ExpandMoreIcon />}
              onClick={handleViewMoreOpen}
              sx={{
                background: "linear-gradient(45deg, #3f51b5, #2196f3)",
                borderRadius: 10,
                textTransform: 'none',
                marginLeft: { xs: 0, sm: 'auto' },
                mt: { xs: 1, sm: 0 },
                "&:hover": {
                  background: "linear-gradient(45deg, #2196f3, #3f51b5)",
                },
              }}
            >
              View More
            </Button>
          </Box>

          <Grid container spacing={3} className='mt-3'>
            {activeHolidays.slice(0, 2).map((holiday, index) => (
              <Grid item xs={12} sm={10} md={6} key={index} className='mt-3'>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    background: 'linear-gradient(to right, #fdfcfb, #e2d1c3)',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 12px 35px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  {/* Ribbon Badge */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bgcolor: '#ff7043',
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderBottomLeftRadius: 12,
                      fontSize: 12,
                      fontWeight: 'bold',
                    }}
                  >
                    UPCOMING
                  </Box>

                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                    🎊 {holiday.festival}
                  </Typography>

                  <Typography variant="body1" sx={{ color: '#4e342e', mb: 1 }}>
                    📅 {getDayName(holiday.holidayDate)}, {formatDate(holiday.holidayDate)}
                  </Typography>

                  {holiday.holidayType && (
                    <Typography variant="body2" sx={{ color: '#6d4c41', mb: 0.5 }}>
                      🏷️ <strong>Type:</strong> {holiday.holidayType}
                    </Typography>
                  )}

                  {holiday.description && (
                    <Typography variant="body2" sx={{ color: '#6d4c41', mb: 0.5 }}>
                      📝 <strong>Description:</strong> {holiday.description}
                    </Typography>
                  )}

                  {holiday.branch && (
                    <Typography variant="body2" sx={{ color: '#6d4c41' }}>
                      🏢 <strong>Branch:</strong> {holiday.branch}
                    </Typography>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>
      )}

      <Dialog
        open={viewMoreDialogOpen}
        onClose={handleViewMoreClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box display="flex" alignItems="center">
            <CalendarMonthIcon sx={{ mr: 1 }} />
            All Holidays
          </Box>
          <IconButton onClick={handleViewMoreClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ maxHeight: '100vh', overflowY: 'auto' }}>
          <Grid container spacing={3} sx={{ p: 2 }}>
            {allHolidays
              .sort((a, b) => new Date(a.holidayDate) - new Date(b.holidayDate))
              .map((holiday, index) => {
                const status = getHolidayStatus(holiday.holidayDate);
                return (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background:
                          status === 'past'
                            ? 'linear-gradient(145deg, #f5f5f5 0%, #eeeeee 100%)'
                            : 'linear-gradient(145deg, #ffffff 0%, #f3f4f6 100%)',
                        boxShadow: 2,
                        position: 'relative',
                        opacity: 0,
                        animation: `${fadeIn} 0.5s ease-out ${index * 0.1}s forwards`,
                        transition: 'transform 0.3s',
                        '&:hover': {
                          transform: 'translateY(-3px)'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          bgcolor: 'transparent',
                          px: 1.5,
                          py: 0.5,
                          fontSize: 16,
                        }}
                      >
                        {status === 'past' ? (
                          '❌'
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            fontWeight={'600'}
                            viewBox="0 0 256 256"
                            style={{ fill: '#40C057' }}
                          >
                            <g fill="#40c057" fillRule="nonzero">
                              <g transform="scale(8.53333,8.53333)">
                                <path d="M26.98047,5.99023c-0.2598,0.00774 -0.50638,0.11632 -0.6875,0.30273l-15.29297,15.29297l-6.29297,-6.29297c-0.25082,-0.26124 -0.62327,-0.36647 -0.97371,-0.27511c-0.35044,0.09136 -0.62411,0.36503 -0.71547,0.71547c-0.09136,0.35044 0.01388,0.72289 0.27511,0.97371l7,7c0.39053,0.39037 1.02353,0.39037 1.41406,0l16,-16c0.29576,-0.28749 0.38469,-0.72707 0.22393,-1.10691c-0.16075,-0.37985 -0.53821,-0.62204 -0.9505,-0.60988z" />
                              </g>
                            </g>
                          </svg>
                        )}

                      </Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{
                          mb: 1,
                          color: status === 'past' ? '#757575' : 'inherit'
                        }}
                      >
                        {holiday.festival}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: status === 'past' ? '#9e9e9e' : 'text.secondary',
                          mb: 1
                        }}
                      >
                        📅 {getDayName(holiday.holidayDate)}, {formatDate(holiday.holidayDate)}
                      </Typography>
                      {holiday.description && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: status === 'past' ? '#bdbdbd' : '#616161',
                            fontStyle: status === 'past' ? 'italic' : 'normal'
                          }}
                        >
                          {holiday.description}
                        </Typography>
                      )}
                    </Card>
                  </Grid>
                );
              })}
          </Grid>
        </DialogContent>

      </Dialog>
    </>
  );
};

export default UpcomingHolidayCard;
