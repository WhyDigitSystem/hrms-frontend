import PropTypes from 'prop-types';
import { Avatar, Box, List, ListItem, ListItemText, Typography, Button, Stack, Divider } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import MainCard from 'ui-component/cards/MainCard';
import TotalIncomeCard from 'ui-component/cards/Skeleton/TotalIncomeCard';
import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

const CardWrapper = styled(MainCard)(({ theme }) => ({
  overflow: 'hidden',
  position: 'relative',
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  '&:after': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: `linear-gradient(210.04deg, ${theme.palette.warning.dark} -50.94%, rgba(144, 202, 249, 0) 83.49%)`,
    borderRadius: '50%',
    top: -30,
    right: -180,
    opacity: 0.4
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: `linear-gradient(140.9deg, ${theme.palette.warning.dark} -14.02%, rgba(144, 202, 249, 0) 70.50%)`,
    borderRadius: '50%',
    top: -160,
    right: -130,
    opacity: 0.4
  }
}));

const PendingApproval = ({ isLoading }) => {
  const theme = useTheme();

  // Sample data - in a real app, this would come from props or API
  const leaveRequest = {
    empName: "John Doe",
    empId: "EMP-1001",
    leaveType: "Sick Leave",
    fromDate: "2023-06-15",
    toDate: "2023-06-18",
    totalDays: 3,
    reason: "High fever and doctor's recommendation for rest",
    status: "Pending"
  };

  const handleApprove = () => {
    console.log("Leave approved");
    // Add your approval logic here
  };

  const handleReject = () => {
    console.log("Leave rejected");
    // Add your rejection logic here
  };

  return (
    <>
      {isLoading ? (
        <TotalIncomeCard />
      ) : (
        <CardWrapper border={false} content={false}>
          <Box>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', fontSize: '1.2rem', color: theme.palette.primary.main }}>
              Pending Approval
            </Typography>
            
            <List sx={{ py: 0 }}>
              {/* Employee Information */}
              <ListItem alignItems="flex-start" disableGutters sx={{ py: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 2 }}>
                  <StorefrontTwoToneIcon />
                </Avatar>
                <ListItemText
                  primary={<Typography variant="h6" sx={{ fontWeight: 'bold' }}>{leaveRequest.empName}</Typography>}
                  secondary={
                    <>
                      <Typography variant="subtitle2" sx={{ color: theme.palette.grey[500] }}>
                        Employee ID: {leaveRequest.empId}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ color: theme.palette.grey[500] }}>
                        Status: <span style={{ color: theme.palette.warning.main }}>{leaveRequest.status}</span>
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              
              <Divider sx={{ my: 1 }} />

              {/* Leave Details */}
              <ListItem sx={{ py: 1 }}>
                <ListItemText
                  primary="Leave Details"
                  primaryTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                  secondary={
                    <Box component="div" sx={{ mt: 1 }}>
                      <Stack direction="row" spacing={2} justifyContent="space-between">
                        <Typography variant="body2">Type:</Typography>
                        <Typography variant="body2" fontWeight="bold">{leaveRequest.leaveType}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={2} justifyContent="space-between">
                        <Typography variant="body2">From:</Typography>
                        <Typography variant="body2" fontWeight="bold">{leaveRequest.fromDate}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={2} justifyContent="space-between">
                        <Typography variant="body2">To:</Typography>
                        <Typography variant="body2" fontWeight="bold">{leaveRequest.toDate}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={2} justifyContent="space-between">
                        <Typography variant="body2">Total Days:</Typography>
                        <Typography variant="body2" fontWeight="bold">{leaveRequest.totalDays}</Typography>
                      </Stack>
                    </Box>
                  }
                />
              </ListItem>
              
              <Divider sx={{ my: 1 }} />

              {/* Reason */}
              <ListItem sx={{ py: 1 }}>
                <ListItemText
                  primary="Reason"
                  primaryTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                  secondary={
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {leaveRequest.reason}
                    </Typography>
                  }
                />
              </ListItem>
              
              <Divider sx={{ my: 1 }} />

              {/* Action Buttons */}
              <ListItem sx={{ py: 1, justifyContent: 'center' }}>
                <Stack direction="row" spacing={2}>
                  <Button 
                    variant="contained" 
                    color="success" 
                    startIcon={<ThumbUpIcon />}
                    onClick={handleApprove}
                    sx={{ px: 3 }}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error" 
                    startIcon={<ThumbDownIcon />}
                    onClick={handleReject}
                    sx={{ px: 3 }}
                  >
                    Reject
                  </Button>
                </Stack>
              </ListItem>
            </List>
          </Box>
        </CardWrapper>
      )}
    </>
  );
};

PendingApproval.propTypes = {
  isLoading: PropTypes.bool
};

export default PendingApproval;