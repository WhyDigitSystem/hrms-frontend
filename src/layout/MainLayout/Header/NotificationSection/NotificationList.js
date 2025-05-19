import {
  Box, Card, CardActions, CardContent, Divider,
  Stack, Typography, Avatar, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, List
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Work as WorkIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import apiCalls from 'apicall';
import emailjs from '@emailjs/browser';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

const statusColors = {
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'error'
};

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [employeeCode] = useState(localStorage.getItem('employeeCode'));
  const [employeeName] = useState(localStorage.getItem('employeeName'));
  const [branchCode] = useState(localStorage.getItem('branchCode'));
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [processingId, setProcessingId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    getAllRequests();
  }, []);

  const getAllRequests = async () => {
    try {
      setLoading(true);

      const [leaveResponse, permissionResponse, compoOffResponse] = await Promise.all([
        apiCalls("get", `leaveprocess/getLeaveRequestForDashBoard?orgId=${orgId}&reportingPersonCode=${employeeCode}&branchCode=${branchCode}`),
        apiCalls("get", `employeemaster/getPendingPermissionRequest?orgId=${orgId}&reportingPersonCode=${employeeCode}&branchCode=${branchCode}`),
        apiCalls("get", `leaveprocess/getCompoffRequestForDashBoard?orgId=${orgId}&reportingPersonCode=${employeeCode}&branchCode=${branchCode}`)
      ]);

      const mapRequest = (req, type) => ({
        type,
        status: 'Pending',
        id: req.id,
        employeeCode: req.employeeCode,
        leaveType: req.leaveType,
        fromDate: req.fromDate || req.startDate,
        toDate: req.toDate || req.endDate,
        totalDays: req.totalDays || req.noOfDays || 1,
        remarks: req.remarks || '',
        employeeEmail: req.employeeEmail || req.officialEmail || '',
        dates: `${req.startDate || req.fromDate} to ${req.endDate || req.toDate}`,
        days: parseFloat(req.totalDays || req.noOfDays) || 1,
        hours: req.noOfHours || null,
        submitted: req.submittedDate || req.appliedDate || new Date().toISOString(),
        employee: {
          name: req.employeeName || 'Unknown',
          avatar: req.photoPath || '',
          department: req.departmentName || 'N/A',
          position: req.designation || 'N/A'
        }
      });

      const flattenArray = (data) => Array.isArray(data) ? data : [data].filter(Boolean);

      const allMappedRequests = [
        ...flattenArray(leaveResponse.paramObjectsMap?.leaveRequestVO).map(r => mapRequest(r, 'Leave Request')),
        ...flattenArray(permissionResponse.paramObjectsMap?.permissionRequestVO).map(r => mapRequest(r, 'Permission Request')),
        ...flattenArray(compoOffResponse.paramObjectsMap?.compensatoryOffVO).map(r => mapRequest(r, 'Compensatory Off'))
      ];

      setNotifications(allMappedRequests);
    } catch (error) {
      console.error("Error fetching combined requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (request, action) => {
    setProcessingId(request.id);
    try {
      let apiEndpoint = '';
      let emailParams = {};
      let serviceId = '';
      let templateId = '';
      let publicKey = '';

      switch (request.type) {
        case 'Leave Request':
          apiEndpoint = `/leaveprocess/createApprovalLeave?action=${action}&actionBy=${loginUserName}&employeeCode=${request.employeeCode}&id=${request.id}&orgId=${orgId}`;
          emailParams = {
            name: request.employee.name,
            from_name: employeeName,
            leave_type: request.leaveType,
            start_date: dayjs(request.fromDate).format("DD-MM-YYYY"),
            end_date: dayjs(request.toDate).format("DD-MM-YYYY"),
            total_days: request.totalDays,
            status: action,
            status_message: action === "APPROVED" ? "Approved" : "Rejected",
            remarks: request.remarks || "N/A",
            email: request.employeeEmail,
          };
          serviceId = 'service_hff8dd7';
          templateId = 'template_0pmh0cu';
          publicKey = 'G6cKiPBXzCvlFaOuo';
          break;

        case 'Permission Request':
          apiEndpoint = `/employeemaster/createApprovalPermissionRequest?action=${action}&actionBy=${loginUserName}&employeeCode=${request.employeeCode}&id=${request.id}&orgId=${orgId}`;
          const fromTime = dayjs(request.fromTime, ['HH:mm', 'HHmm']).format('HH:mm');
          const toTime = dayjs(request.toTime, ['HH:mm', 'HHmm']).format('HH:mm');
          let hours = request.totalHours;
          if (hours?.length === 4 && !hours.includes(':')) hours = `${hours.slice(0, 2)}:${hours.slice(2)}`;
          emailParams = {
            name: request.employee.name,
            from_name: employeeName,
            start_date: dayjs(request.fromDate).format("DD-MM-YYYY"),
            from_time: fromTime,
            to_time: toTime,
            total_hours: hours,
            status: action,
            status_message: action === "APPROVED" ? "Approved" : "Rejected",
            remarks: request.remarks || "N/A",
            email: request.employeeEmail,
          };
          serviceId = 'service_9ucz1v3';
          templateId = 'template_om3wfui';
          publicKey = 'Opp4e1xb0JkW0bocB';
          break;

        case 'Compensatory Off':
          apiEndpoint = `/leaveprocess/createApprovalCompOff?action=${action}&actionBy=${loginUserName}&employeeCode=${request.employeeCode}&id=${request.id}&orgId=${orgId}`;
          emailParams = {
            name: request.employee.name,
            from_name: employeeName,
            date: dayjs(request.fromDate).format("DD-MM-YYYY"),
            status: action,
            status_message: action === "APPROVED" ? "Approved" : "Rejected",
            remarks: request.remarks || "N/A",
            email: request.employeeEmail,
          };
          serviceId = 'service_y4jqb7q';
          templateId = 'template_qf406wl';
          publicKey = '4wxbCMaMoQh0TD6tx';
          break;

        default:
          throw new Error("Invalid request type");
      }

      await apiCalls('put', apiEndpoint);
      setNotifications(prev => prev.filter(r => r.id !== request.id));
      await emailjs.send(serviceId, templateId, emailParams, publicKey);
      toast.success(`Request ${action.toLowerCase()} successfully`, { autoClose: 3000 });
    } catch (error) {
      console.error(`Failed to ${action.toLowerCase()} request:`, error);
      toast.error(`Failed to ${action.toLowerCase()} request`, { autoClose: 3000 });
    } finally {
      setProcessingId(null);
    }
  };

  const NotificationCard = ({ notification }) => (
    <Card sx={{ mb: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={notification.employee?.avatar} sx={{ width: 40, height: 40 }}>
              {notification.employee?.name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {notification.employee?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {notification.type}
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
          <Stack direction="row" spacing={1} alignItems="center">
            <EventIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {dayjs(notification.fromDate).format('DD MMM')} - {dayjs(notification.toDate).format('DD MMM YYYY')}
              <span style={{ marginLeft: 8, color: '#666' }}>
                ({notification.days} day{notification.days > 1 ? 's' : ''})
              </span>
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <WorkIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {notification.employee.department}
            </Typography>
          </Stack>

          {notification.remarks && (
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="body2" style={{ fontStyle: 'italic' }}>
                "{notification.remarks}"
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>

      {notification.status === 'Pending' && (
        <CardActions sx={{ justifyContent: 'flex-end', gap: 1, px: 2, pb: 2 }}>
          <Button
            size="small"
            variant="contained"
            color="success"
            disabled={processingId === notification.id}
            onClick={() => handleAction(notification, "APPROVED")}
          >
            Approve
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            disabled={processingId === notification.id}
            onClick={() => handleAction(notification, "REJECTED")}
          >
            Reject
          </Button>
        </CardActions>
      )}
    </Card>
  );

  if (loading) {
    return <Typography textAlign="center">Loading notifications...</Typography>;
  }

  if (notifications.length === 0) {
    return <Typography textAlign="center">No notifications available</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', p: 2 }}>
      {/* Notification Count Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Pending Notifications</Typography>
        <Chip
          label={`Total: ${notifications.length}`}
          color="primary"
          size="small"
        />
      </Box>

      {/* Show the first notification */}
      <NotificationCard notification={notifications[0]} />

      {notifications.length > 1 && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<NotificationsIcon />}
            onClick={() => setOpenModal(true)}
            sx={{ borderRadius: 50, px: 4 }}
          >
            View All ({notifications.length})
          </Button>
        </Box>
      )}

      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle sx={{ borderBottom: '1px solid #eee', py: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <NotificationsIcon color="primary" />
            <Typography variant="h6">Pending Requests</Typography>
            <Chip label={notifications.length} color="primary" size="small" />
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 2 }}>
          <List sx={{ py: 0 }}>
            {notifications.map((notification) => (
              <Box key={notification.id} sx={{ mb: 2 }}>
                <NotificationCard notification={notification} />
              </Box>
            ))}
          </List>
        </DialogContent>

        <DialogActions sx={{ borderTop: '1px solid #eee', py: 2 }}>
          <Button
            variant="contained"
            startIcon={<CloseIcon />}
            onClick={() => setOpenModal(false)}
            sx={{ borderRadius: 50, px: 4 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationList;
