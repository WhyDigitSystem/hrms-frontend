import { 
  Box, Card, CardActions, CardContent, Divider, 
  Stack, Typography, Avatar, Chip , Button
} from '@mui/material';
import { 
  Notifications as NotificationsIcon, 
  Person as PersonIcon, 
  Event as EventIcon, 
  Work as WorkIcon
} from '@mui/icons-material';

const hrNotifications = [
  {
    id: 'HR-2024-001',
    type: 'Leave Request',
    employee: {
      name: 'John Doe',
      avatar: '/avatars/john-doe.jpg',
      department: 'Engineering',
      position: 'Senior Developer'
    },
    dates: '2024-12-20 to 2024-12-24',
    status: 'Pending',
    days: 5,
    submitted: '2024-11-15 09:30',
    details: 'Annual leave for family vacation'
  },
  {
    id: 'HR-2024-002',
    type: 'Overtime Claim',
    employee: {
      name: 'Jane Smith',
      avatar: '/avatars/jane-smith.jpg',
      department: 'Marketing',
      position: 'Marketing Manager'
    },
    dates: '2024-11-10',
    hours: 4.5,
    status: 'Pending',
    submitted: '2024-11-12 17:45',
    details: 'Extra hours worked for campaign launch'
  }
];

const statusColors = {
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'error'
};

const NotificationList = () => {
  // Get the first pending notification to show
  const notification = hrNotifications.find(n => n.status === 'Pending') || hrNotifications[0];

  return (
    <Box sx={{ 
      maxWidth: 600, 
      margin: '0 auto',
      p: 1
    }}>
      <Card
        sx={{
          borderRadius: 2,
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        }}
      >
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={notification.employee.avatar} sx={{ width: 48, height: 48 }}>
                {notification.employee.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {notification.employee.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {notification.employee.position}, {notification.employee.department}
                </Typography>
              </Box>
            </Stack>
            <Chip 
              label={notification.status} 
              color={statusColors[notification.status]} 
              size="small" 
              sx={{ fontWeight: 500 }}
            />
          </Stack>
          
          <Divider sx={{ my: 2 }} />
          
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={2}>
              <WorkIcon color="action" fontSize="small" />
              <Typography variant="body2">
                <strong>Request Type:</strong> {notification.type}
              </Typography>
            </Stack>
            
            <Stack direction="row" spacing={2}>
              <EventIcon color="action" fontSize="small" />
              <Typography variant="body2">
                <strong>Dates:</strong> {notification.dates}
                {notification.type === 'Leave Request' && ` (${notification.days} day${notification.days > 1 ? 's' : ''})`}
                {notification.type === 'Overtime Claim' && ` (${notification.hours} hours)`}
              </Typography>
            </Stack>
            
            {notification.type === 'Expense Reimbursement' && (
              <Stack direction="row" spacing={2}>
                <PersonIcon color="action" fontSize="small" />
                <Typography variant="body2">
                  <strong>Amount:</strong> {notification.currency} {notification.amount.toFixed(2)}
                </Typography>
              </Stack>
            )}
            
            <Stack direction="row" spacing={2}>
              <NotificationsIcon color="action" fontSize="small" />
              <Typography variant="body2">
                <strong>Submitted:</strong> {new Date(notification.submitted).toLocaleString()}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', pt: 0, pb: 2, px: 2 }}>
          {notification.status === 'Pending' && (
            <>
              <Button size="small" variant="contained" color="success" sx={{ borderRadius: 2, px: 2 }}>
                Approve
              </Button>
              <Button size="small" variant="outlined" color="error" sx={{ borderRadius: 2, px: 2 }}>
                Reject
              </Button>
            </>
          )}
        </CardActions>
      </Card>
    </Box>
  );
};

export default NotificationList;