import React, { useState, useEffect } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  Box,
  Button,
  Card,
  Typography,
  Grid,
  Avatar,
  LinearProgress,
  Chip,
  useTheme,
  Stack,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  Collapse
} from '@mui/material';
import CommonBulkUpload from 'utils/CommonBulkUpload';
import { ToastContainer } from 'react-toastify';
import apiCalls from 'apicall';
import 'react-toastify/dist/ReactToastify.css';
import EventIcon from '@mui/icons-material/Event';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PieChartIcon from '@mui/icons-material/PieChart';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const UpcomingHolidayCard = () => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [allHolidays, setAllHolidays] = useState([]);
  const [activeHolidays, setActiveHolidays] = useState([]);
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  const [stats, setStats] = useState({
    totalHolidays: 0,
    upcomingHolidays: 0,
    holidaysThisMonth: 0,
    branchDistribution: []
  });

  useEffect(() => {
    getAllHolidayByOrgId();
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
      if (result && result.paramObjectsMap && result.paramObjectsMap.holidayVO) {
        const holidays = result.paramObjectsMap.holidayVO;
        setAllHolidays(holidays);

        const activeHolidays = filterActiveHolidays(holidays);
        setActiveHolidays(activeHolidays);

        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        const thisMonth = activeHolidays.filter(h => {
          const date = new Date(h.holidayDate);
          return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
        });

        setStats({
          totalHolidays: activeHolidays.length,
          upcomingHolidays: activeHolidays.length,
          holidaysThisMonth: thisMonth.length,
          branchDistribution: []
        });
      } else {
        setAllHolidays([]);
        setActiveHolidays([]);
        setStats({
          totalHolidays: 0,
          upcomingHolidays: 0,
          holidaysThisMonth: 0,
          branchDistribution: []
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setAllHolidays([]);
      setActiveHolidays([]);
      setStats({
        totalHolidays: 0,
        upcomingHolidays: 0,
        holidaysThisMonth: 0,
        branchDistribution: []
      });
    }
  };

  const handleBulkUploadOpen = () => {
    setUploadOpen(true);
  };

  const handleBulkUploadClose = () => {
    setUploadOpen(false);
  };

  const handleSubmit = async () => {
    handleBulkUploadClose();
    await getAllHolidayByOrgId();
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

  const getNextThreeHolidays = () => {
    return activeHolidays.slice(0, 3);
  };

  const getUpcomingHolidays = () => {
    return activeHolidays.slice(3);
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Holiday Card Component
  const HolidayCard = ({ holiday, isHighlighted = false }) => (
    <Paper
      elevation={isHighlighted ? 2 : 1}
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: isHighlighted ? '#fff8e1' : 'background.paper',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      <Box display="flex" alignItems="center">
        <Badge
          badgeContent={isHighlighted ? "Next" : ""}
          color="error"
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          sx={{ mr: 1 }}
        >
          <Avatar sx={{
            bgcolor: isHighlighted ? theme.palette.warning.main : theme.palette.primary.main,
            color: 'white',
            width: 40,
            height: 40
          }}>
            {new Date(holiday.holidayDate).getDate()}
          </Avatar>
        </Badge>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {holiday.festival}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getDayName(holiday.holidayDate)}, {formatDate(holiday.holidayDate)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );

  return (
    <>
      <ToastContainer />

      {/* Summary Cards */}
      {/* <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{
            p: 3,
            height: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
            borderLeft: '4px solid #3f51b5',
            transition: 'transform 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)'
            }
          }}>
            <Box display="flex" alignItems="center">
              <Box sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: 'rgba(63, 81, 181, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}>
                <EventIcon color="primary" fontSize="medium" />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Active Holidays</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalHolidays}</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{
            p: 3,
            height: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
            borderLeft: '4px solid #4caf50',
            transition: 'transform 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)'
            }
          }}>
            <Box display="flex" alignItems="center">
              <Box sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: 'rgba(76, 175, 80, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}>
                <CalendarMonthIcon color="success" fontSize="medium" />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Upcoming Holidays</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.upcomingHolidays}</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{
            p: 3,
            height: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
            borderLeft: '4px solid #ff9800',
            transition: 'transform 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)'
            }
          }}>
            <Box display="flex" alignItems="center">
              <Box sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 152, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}>
                <PieChartIcon color="warning" fontSize="medium" />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">This Month</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.holidaysThisMonth}</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid> */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{
            p: 3,
            height: '100%',
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            backgroundImage: 'linear-gradient(to bottom right, rgba(63, 81, 181, 0.1), rgba(63, 81, 181, 0.05))'
          }}>
            <Box display="flex" alignItems="center">
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: 'rgba(63, 81, 181, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}>
                <EventIcon sx={{ color: '#3f51b5' }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Active Holidays</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#3f51b5' }}>{stats.totalHolidays}</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{
            p: 3,
            height: '100%',
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            backgroundImage: 'linear-gradient(to bottom right, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05))'
          }}>
            <Box display="flex" alignItems="center">
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: 'rgba(76, 175, 80, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}>
                <CalendarMonthIcon sx={{ color: '#4caf50' }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Upcoming Holidays</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>{stats.upcomingHolidays}</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{
            p: 3,
            height: '100%',
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            backgroundImage: 'linear-gradient(to bottom right, rgba(255, 152, 0, 0.1), rgba(255, 152, 0, 0.05))'
          }}>
            <Box display="flex" alignItems="center">
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: 'rgba(255, 152, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}>
                <PieChartIcon sx={{ color: '#ff9800' }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">This Month</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>{stats.holidaysThisMonth}</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Holidays Section */}
      {activeHolidays.length > 0 && (
        <Card sx={{ mb: 3, p: 3, borderRadius: 3, boxShadow: 3, borderLeft: '4px solid #ff5722' }}>
          <Box display="flex" alignItems="center" mb={2}>
            <NotificationsActiveIcon color="warning" sx={{ mr: 1, fontSize: 30 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Upcoming Holidays</Typography>
          </Box>

          <Grid container spacing={2}>
            {getNextThreeHolidays().map((holiday, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <HolidayCard holiday={holiday} isHighlighted={index === 0} />
              </Grid>
            ))}
          </Grid>

          {/* View More Section */}
          {activeHolidays.length > 3 && (
            <>
              <Collapse in={expanded}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {getUpcomingHolidays().map((holiday, index) => (
                    <Grid item xs={12} sm={4} key={index + 3}>
                      <HolidayCard holiday={holiday} />
                    </Grid>
                  ))}
                </Grid>
              </Collapse>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  onClick={toggleExpand}
                  endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  color="primary"
                  variant="text"
                >
                  {expanded ? 'Show Less' : `View All (${activeHolidays.length})`}
                </Button>
              </Box>
            </>
          )}
        </Card>
      )}
    </>
  );
};

export default UpcomingHolidayCard;