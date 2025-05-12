import {
  Box, Card, CardActions, CardContent, Divider,
  Stack, Typography, Avatar, Chip, Button
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Work as WorkIcon
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
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [employeeCode, setEmployeeCode] = useState(localStorage.getItem('employeeCode'));
  const [employeeName, setEmployeeName] = useState(localStorage.getItem('employeeName'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [processingId, setProcessingId] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);

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

      const leaveRequests = Array.isArray(leaveResponse.paramObjectsMap?.leaveRequestVO)
        ? leaveResponse.paramObjectsMap.leaveRequestVO
        : [leaveResponse.paramObjectsMap?.leaveRequestVO].filter(Boolean);

      const permissionRequests = Array.isArray(permissionResponse.paramObjectsMap?.permissionRequestVO)
        ? permissionResponse.paramObjectsMap.permissionRequestVO
        : [permissionResponse.paramObjectsMap?.permissionRequestVO].filter(Boolean);

      const compoOffRequests = Array.isArray(compoOffResponse.paramObjectsMap?.compensatoryOffVO)
        ? compoOffResponse.paramObjectsMap.compensatoryOffVO
        : [compoOffResponse.paramObjectsMap?.compensatoryOffVO].filter(Boolean);

      const allMappedRequests = [
        ...leaveRequests.map(r => mapRequest(r, 'Leave Request')),
        ...permissionRequests.map(r => mapRequest(r, 'Permission Request')),
        ...compoOffRequests.map(r => mapRequest(r, 'Compensatory Off'))
      ].filter(r => r.status === 'Pending');

      setNotifications(allMappedRequests);
    } catch (error) {
      console.error("Error fetching combined requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionLeave = async (request, action) => {
    setProcessingId(request.id);

    try {
      // 1. Make API call to approve/reject
      await apiCalls(
        'put',
        `/leaveprocess/createApprovalLeave?action=${action}&actionBy=${loginUserName}&employeeCode=${request.employeeCode}&id=${request.id}&orgId=${orgId}`
      );

      setLeaveRequests(prev => prev.filter(r => r.id !== request.id));

      const isApproved = action === "APPROVED";

      const templateParams = {
        name: request.employeeName,
        from_name: employeeName,
        leave_type: request.leaveType,
        start_date: dayjs(request.fromDate).format("DD-MM-YYYY"),
        end_date: dayjs(request.toDate).format("DD-MM-YYYY"),
        total_days: request.totalDays,
        status: action,
        status_message: isApproved ? "Approved" : "Rejected",
        status_class: isApproved ? "status-approved" : "status-rejected",
        remarks: request.remarks || "N/A",
        email: request.employeeEmail,
      };

      // 3. Send email notification
      await emailjs.send(
        'service_hff8dd7',
        'template_0pmh0cu',
        templateParams,
        'G6cKiPBXzCvlFaOuo'
      );

      toast.success(`Request ${action.toLowerCase()} successfully`, {
        autoClose: 3000,
      });

    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing request:`, error);

      // Revert UI if error occurs
      setLeaveRequests(prev => [...prev, request].sort((a, b) => a.id - b.id));

      toast.error(`Failed to ${action.toLowerCase()} request`, {
        autoClose: 3000,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleActionPermission = async (request, action) => {
    setProcessingId(request.id);

    try {
      // 1. Make API call to approve/reject
      await apiCalls(
        'put',
        `/employeemaster/createApprovalPermissionRequest?action=${action}&actionBy=${loginUserName}&employeeCode=${request.employeeCode}&id=${request.id}&orgId=${orgId}`
      );

      setLeaveRequests(prev => prev.filter(r => r.id !== request.id));

      const isApproved = action === "APPROVED";

      const fromTimeFormatted = request.fromTime
        ? dayjs(request.fromTime, ['HH:mm', 'HHmm']).format('HH:mm')
        : '';

      const toTimeFormatted = request.toTime
        ? dayjs(request.toTime, ['HH:mm', 'HHmm']).format('HH:mm')
        : '';

      let totalHoursFormatted = request.totalHours || '';
      if (totalHoursFormatted.length === 4 && !totalHoursFormatted.includes(':')) {
        // e.g., "0100" => "01:00"
        totalHoursFormatted = `${totalHoursFormatted.slice(0, 2)}:${totalHoursFormatted.slice(2)}`;
      }

      const templateParams = {
        name: request.employeeName,
        from_name: employeeName,
        start_date: dayjs(request.fromDate).format("DD-MM-YYYY"),
        from_time: fromTimeFormatted,
        to_time: toTimeFormatted,
        total_hours: totalHoursFormatted,
        status: action,
        status_message: isApproved ? "Approved" : "Rejected",
        status_class: isApproved ? "status-approved" : "status-rejected",
        remarks: request.remarks || "N/A",
        email: request.employeeEmail,
      };

      // 3. Send email notification
      await emailjs.send(
        'service_9ucz1v3',
        'template_om3wfui',
        templateParams,
        'Opp4e1xb0JkW0bocB'
      );

      toast.success(`Request ${action.toLowerCase()} successfully`, {
        autoClose: 3000,
      });

    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing request:`, error);

      // Revert UI if error occurs
      setLeaveRequests(prev => [...prev, request].sort((a, b) => a.id - b.id));

      toast.error(`Failed to ${action.toLowerCase()} request`, {
        autoClose: 3000,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleActionCompoOff = async (request, action) => {
    setProcessingId(request.id);

    try {
      // 1. Make API call to approve/reject
      await apiCalls(
        'put',
        `/leaveprocess/createApprovalCompOff?action=${action}&actionBy=${loginUserName}&employeeCode=${request.employeeCode}&id=${request.id}&orgId=${orgId}`
      );

      setLeaveRequests(prev => prev.filter(r => r.id !== request.id));

      const isApproved = action === "APPROVED";

      const templateParams = {
        name: request.employeeName,
        from_name: employeeName,
        date: dayjs(request.compOffDate).format("DD-MM-YYYY"),
        status: action,
        status_message: isApproved ? "Approved" : "Rejected",
        status_class: isApproved ? "status-approved" : "status-rejected",
        remarks: request.remarks || "N/A",
        email: request.employeeEmail,
      };

      // 3. Send email notification
      await emailjs.send(
        'service_y4jqb7q',
        'template_qf406wl',
        templateParams,
        '4wxbCMaMoQh0TD6tx'
      );

      toast.success(`Request ${action.toLowerCase()} successfully`, {
        autoClose: 3000,
      });

    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing request:`, error);

      // Revert UI if error occurs
      setLeaveRequests(prev => [...prev, request].sort((a, b) => a.id - b.id));

      toast.error(`Failed to ${action.toLowerCase()} request`, {
        autoClose: 3000,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const notification = notifications.find(n => n.status === 'Pending') || notifications[0];

  if (loading) {
    return <Typography textAlign="center">Loading notifications...</Typography>;
  }

  if (!notification) {
    return <Typography textAlign="center">No notifications available</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', p: 1 }}>
      <Card sx={{ borderRadius: 2, backgroundColor: '#ffffff', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)' }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={notification.employee?.avatar} sx={{ width: 48, height: 48 }}>
                {notification.employee?.name?.charAt(0) || '?'}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {notification.employee?.name}
                </Typography>
                {/* <Typography variant="body2" color="text.secondary">
                  {notification.employee?.position}, {notification.employee?.department}
                </Typography> */}
              </Box>
            </Stack>
            <Chip
              label={notification.status}
              color={statusColors[notification.status] || 'default'}
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
              <Button size="small" variant="contained" color="success"
                onClick={() => {
                  if (notification.type === "Leave Request") {
                    handleActionLeave(notification, "APPROVED");
                  } else if (notification.type === "Permission Request") {
                    handleActionPermission(notification, "APPROVED");
                  } else if (notification.type === "Compensatory Off") {
                    handleActionCompoOff(notification, "APPROVED");
                  }
                }}
                sx={{ borderRadius: 2, px: 2 }}>
                Approve
              </Button>
              <Button size="small" variant="outlined" color="error"
                onClick={() => {
                  if (notification.type === "Leave Request") {
                    handleActionLeave(notification, "REJECTED");
                  } else if (notification.type === "Permission Request") {
                    handleActionPermission(notification, "REJECTED");
                  } else if (notification.type === "Compensatory Off") {
                    handleActionCompoOff(notification, "REJECTED");
                  }
                }}
                sx={{ borderRadius: 2, px: 2 }}>
                Reject
              </Button>
            </>
          )}
        </CardActions>
      </Card>
    </Box >
  );
};

export default NotificationList;
