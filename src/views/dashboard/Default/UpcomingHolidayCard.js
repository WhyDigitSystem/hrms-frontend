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
  Divider
} from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiCalls from 'apicall';

import EventIcon from '@mui/icons-material/Event';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';

const UpcomingHolidayCard = () => {
  const [allHolidays, setAllHolidays] = useState([]);
  const [activeHolidays, setActiveHolidays] = useState([]);
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [viewMoreDialogOpen, setViewMoreDialogOpen] = useState(false);
  const [leaveInfo, setLeaveInfo] = useState([]);

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
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}>
            <EventIcon sx={{ fontSize: 30, mr: 1, color: '#264952' }} />
            Upcoming Holiday
            <Button onClick={handleViewMoreOpen} variant="outlined" sx={{ textTransform: 'none', borderRadius: 20, marginLeft: 'auto', display: 'flex', alignItems: 'center' }} endIcon={<ExpandMoreIcon />}>
              View More
            </Button>
          </Typography>

          <Grid container spacing={3}>
            {activeHolidays.slice(0, 2).map((holiday, index) => (
              <Grid item xs={12} sm={10} md={6} key={index}>
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
            borderRadius: 4,
            background: 'linear-gradient(to right, #f5f7fa, #c3cfe2)',
            boxShadow: 10,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 600,
            fontSize: '1.25rem',
            bgcolor: '#e3f2fd',
            borderBottom: '1px solid #cfd8dc',
            p: 2,
          }}
        >
          <Box display="flex" alignItems="center">
            <CalendarMonthIcon sx={{ color: '#0288d1', mr: 1 }} />
            All Upcoming Holidays
          </Box>
          <IconButton onClick={handleViewMoreClose} sx={{ color: '#f44336' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            maxHeight: '70vh',
            overflowY: 'auto',
            backgroundColor: '#f4f6f8',
            px: 4,
            py: 3,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#cfd8dc',
              borderRadius: '8px',
            },
          }}
        >
          {activeHolidays.length === 0 ? (
            <Box sx={{ mt: 6, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No upcoming holidays.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={4}>
              {activeHolidays.map((holiday, index) => (
                <Grid item xs={12} sm={6} md={6} key={index}>
                  <Box
                    sx={{
                      p: 3,
                      background: 'linear-gradient(to right, #fdfcfb, #e2d1c3)',
                      borderRadius: 3,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                      },
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                      🎉 {holiday.festival}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      {getDayName(holiday.holidayDate)}, {formatDate(holiday.holidayDate)}
                    </Typography>
                    {holiday.holidayType && (
                      <Typography variant="body2" color="text.secondary" mb={0.5}>
                        <strong>Type:</strong> {holiday.holidayType}
                      </Typography>
                    )}
                    {holiday.description && (
                      <Typography variant="body2" color="text.secondary" mb={0.5}>
                        <strong>Description:</strong> {holiday.description}
                      </Typography>
                    )}
                    {holiday.branch && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Branch:</strong> {holiday.branch}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpcomingHolidayCard;
