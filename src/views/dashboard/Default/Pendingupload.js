import PropTypes from 'prop-types';
import { Avatar, Box, Typography, Button, Stack, Chip, Paper, Divider } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import MainCard from 'ui-component/cards/MainCard';
import TotalIncomeCard from 'ui-component/cards/Skeleton/TotalIncomeCard';
import { ThumbUp, ThumbDown, Person, CalendarToday, AccessTime, Description, Work, Badge } from '@mui/icons-material';

const StyledCard = styled(MainCard)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: '16px',
  boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.05)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0px 15px 35px rgba(0, 0, 0, 0.1)'
  },
  position: 'relative',
  overflow: 'visible',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.primary.main})`,
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px'
  }
}));

const StatusBadge = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  right: 20,
  top: 15,
  fontWeight: 700,
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  backgroundColor: theme.palette.warning.light,
  color: theme.palette.warning.dark
}));

const DetailRow = ({ icon, label, value }) => (
  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
    <Box sx={{
      p: 1,
      bgcolor: 'background.default',
      borderRadius: '8px',
      color: 'primary.main'
    }}>
      {icon}
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography variant="caption" color="textSecondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight="500">
        {value}
      </Typography>
    </Box>
  </Stack>
);

const PendingApproval = ({ isLoading }) => {
  const theme = useTheme();

  const leaveRequest = {
    empName: "John Doe",
    empId: "EMP-1001",
    leaveType: "Sick Leave",
    fromDate: "June 15, 2023",
    toDate: "June 18, 2023",
    totalDays: 3,
    reason: "High fever and doctor's recommendation for rest. Need proper medication and recovery time.",
    status: "Pending Review",
    department: "Marketing",
    position: "Senior Marketing Executive"
  };

  const handleApprove = () => console.log("Leave approved");
  const handleReject = () => console.log("Leave rejected");

  return isLoading ? <TotalIncomeCard /> : (
    <StyledCard>
      <StatusBadge label={leaveRequest.status} size="small" />
      
      <Box sx={{ pt: 4, pb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Avatar sx={{ 
            width: 56, 
            height: 56, 
            bgcolor: theme.palette.primary.main,
            fontSize: '1.25rem',
            fontWeight: 600
          }}>
            {leaveRequest.empName.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="600">{leaveRequest.empName}</Typography>
            <Typography variant="body2" color="textSecondary">
              {leaveRequest.position} • {leaveRequest.department}
            </Typography>
            <Chip 
              label={leaveRequest.empId} 
              size="small" 
              icon={<Badge fontSize="small" />}
              sx={{ mt: 0.5, fontSize: '0.7rem' }}
            />
          </Box>
        </Stack>

        <Paper elevation={0} sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: '12px',
          bgcolor: 'background.default'
        }}>
          <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 2 }}>
            Leave Details
          </Typography>
          
          <DetailRow icon={<Work fontSize="small" />} label="Leave Type" value={leaveRequest.leaveType} />
          <DetailRow icon={<CalendarToday fontSize="small" />} label="From Date" value={leaveRequest.fromDate} />
          <DetailRow icon={<CalendarToday fontSize="small" />} label="To Date" value={leaveRequest.toDate} />
          <DetailRow icon={<AccessTime fontSize="small" />} label="Total Days" value={`${leaveRequest.totalDays} days`} />
        </Paper>

        <Paper elevation={0} sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: '12px',
          bgcolor: 'background.default'
        }}>
          <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Description fontSize="small" sx={{ mr: 1 }} />
            Reason for Leave
          </Typography>
          <Typography variant="body2" sx={{ 
            p: 1.5,
            bgcolor: 'background.paper',
            borderRadius: '8px',
            borderLeft: `3px solid ${theme.palette.primary.main}`
          }}>
            {leaveRequest.reason}
          </Typography>
        </Paper>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            color="success"
            startIcon={<ThumbUp />}
            onClick={handleApprove}
            sx={{
              px: 4,
              borderRadius: '8px',
              fontWeight: '600',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: `0 4px 12px ${theme.palette.success.light}`
              }
            }}
          >
            Approve
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<ThumbDown />}
            onClick={handleReject}
            sx={{
              px: 4,
              borderRadius: '8px',
              fontWeight: '600',
              textTransform: 'none',
              borderWidth: '2px',
              '&:hover': {
                borderWidth: '2px',
                bgcolor: 'error.light'
              }
            }}
          >
            Reject
          </Button>
        </Stack>
      </Box>
    </StyledCard>
  );
};

PendingApproval.propTypes = {
  isLoading: PropTypes.bool
};

export default PendingApproval;