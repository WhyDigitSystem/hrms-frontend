import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Button,
  Stack,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import MainCard from "ui-component/cards/MainCard";
import { ThumbUp, ThumbDown, Close, ArrowForward } from "@mui/icons-material";
import { useEffect, useState } from "react";
import apiCalls from "apicall";
import emailjs from '@emailjs/browser';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Background image component
const BackgroundImage = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: -1,
        opacity: 0.15,
        backgroundImage: 'url(https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(2px)'
      }}
    />
  );
};

// Gradient overlay for better readability
const GradientOverlay = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
        zIndex: -1
      }}
    />
  );
};

const StyledCard = styled(MainCard)(({ theme }) => ({
  background: `rgba(255, 255, 255, 0.85)`,
  backdropFilter: "blur(12px)",
  borderRadius: "24px",
  boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease-in-out",
  position: "relative",
  overflow: "hidden",
  border: `1px solid rgba(255, 255, 255, 0.3)`,
  "&:hover": {
    boxShadow: "0px 15px 35px rgba(0, 0, 0, 0.15)",
    transform: "translateY(-2px)"
  },
}));

const RequestItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(1.5),
  borderRadius: "16px",
  background: theme.palette.background.paper,
  boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.05)",
  transition: "all 0.2s ease",
  border: `1px solid ${theme.palette.divider}`,
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.1)",
  },
}));

const IconButtonStyled = styled(IconButton)(({ theme, actiontype }) => ({
  width: 40,
  height: 40,
  backgroundColor: actiontype === 'approve' ? theme.palette.success.main : theme.palette.error.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: actiontype === 'approve' ? theme.palette.success.dark : theme.palette.error.dark,
    transform: 'scale(1.1)',
    boxShadow: theme.shadows[2]
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled
  }
}));

const ViewAllButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  color: theme.palette.primary.main,
  padding: '6px 12px',
  borderRadius: '8px',
  border: `1px solid ${theme.palette.primary.light}`,
  background: 'rgba(25, 118, 210, 0.05)',
  '&:hover': {
    background: 'rgba(25, 118, 210, 0.1)',
    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)'
  },
  '& .MuiButton-endIcon': {
    marginLeft: '4px',
    transition: 'transform 0.2s ease'
  },
  '&:hover .MuiButton-endIcon': {
    transform: 'translateX(2px)'
  }
}));

const PendingApproval = ({ isLoading }) => {
  const theme = useTheme();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [employeeName, setEmployeeName] = useState(localStorage.getItem('employeeName'));
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));

  // const orgId = localStorage.getItem("orgId");
  const employeeCode = localStorage.getItem("employeeCode");

  useEffect(() => {
    getLeaveRequest();
  }, [orgId, employeeCode]);

  // useEffect(() => {
  //   return () => {
  //     if (processingId) {
  //       // If component unmounts during processing, refresh data when mounted again
  //       getLeaveRequest();
  //     }
  //   };
  // }, [processingId]);

  const getLeaveRequest = async () => {
    try {
      const response = await apiCalls(
        "get",
        `leaveprocess/getLeaveRequestForDashBoard?orgId=${orgId}&reportingPersonCode=${employeeCode}`
      );

      // Handle single object or array response
      let requests = response.paramObjectsMap?.leaveRequestVO || [];
      if (!Array.isArray(requests)) {
        requests = [requests];
      }

      // Filter to only show requests with no status or pending status
      const pendingRequests = requests.filter(request =>
        !request.approveStatus || request.approveStatus === 'PENDING'
      );

      setLeaveRequests(pendingRequests);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      toast.error("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRequest(null);
  };

  const handleAction = async (request, action) => {
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

  const ActionButtons = ({ request }) => {
    const isProcessing = processingId === request.id;
    const isPending = !request.approveStatus || request.approveStatus === 'PENDING';

    if (!isPending) {
      return (
        <Chip
          label={request.approveStatus}
          size="small"
          sx={{
            fontWeight: 600,
            backgroundColor: request.approveStatus === 'APPROVED'
              ? 'rgba(76, 175, 80, 0.1)'
              : 'rgba(244, 67, 54, 0.1)',
            color: request.approveStatus === 'APPROVED'
              ? theme.palette.success.dark
              : theme.palette.error.dark
          }}
        />
      );
    }

    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Tooltip title="Approve leave request">
          <span>
            <IconButtonStyled
              actiontype="approve"
              onClick={() => handleAction(request, "APPROVED")}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <ThumbUp fontSize="small" />
              )}
            </IconButtonStyled>
          </span>
        </Tooltip>

        <Tooltip title="Reject leave request">
          <span>
            <IconButtonStyled
              actiontype="reject"
              onClick={() => handleAction(request, "REJECTED")}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <ThumbDown fontSize="small" />
              )}
            </IconButtonStyled>
          </span>
        </Tooltip>
      </Stack>
    );
  };

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      <BackgroundImage />
      <GradientOverlay />
      <StyledCard sx={{ p: 3, height: '100%' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="700" color="primary">
            Pending Approvals
          </Typography>
          {leaveRequests.length > 3 && (
            <ViewAllButton
              onClick={handleOpenModal}
              endIcon={<ArrowForward sx={{ fontSize: '18px' }} />}
            >
              View All ({leaveRequests.length})
            </ViewAllButton>
          )}
        </Box>

        {loading ? (
          <Box textAlign="center" py={4}>
            <CircularProgress size={40} thickness={4} />
            <Typography variant="h6" mt={2} color="text.secondary">
              Loading requests...
            </Typography>
          </Box>
        ) : leaveRequests.length > 0 ? (
          <Stack spacing={2.5}>
            {leaveRequests.slice(0, 3).map((leaveRequest, index) => (
              <RequestItem key={index}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          width: 44,
                          height: 44,
                          mr: 2,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          boxShadow: theme.shadows[2]
                        }}
                      >
                        {leaveRequest.employeeName?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="600">
                          {leaveRequest.employeeName || 'Unknown Employee'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {leaveRequest.leaveType || 'No type specified'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Box display="flex" justifyContent="flex-end">
                      <ActionButtons request={leaveRequest} />
                    </Box>
                  </Grid>
                </Grid>
              </RequestItem>
            ))}
          </Stack>
        ) : (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Pending Requests
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You don't have any leave requests to approve right now.
            </Typography>
          </Box>
        )}

        {/* Modal Dialog for All Requests */}
        <Dialog
          open={openModal}
          onClose={handleCloseModal}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: '20px',
              p: 0,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }
          }}
        >
          <DialogTitle sx={{
            bgcolor: theme.palette.primary.main,
            color: 'white',
            py: 2,
            px: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="700">
                All Pending Leave Requests
              </Typography>
              <IconButton
                onClick={handleCloseModal}
                sx={{
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent dividers sx={{ py: 3, px: 4 }}>
            <Stack spacing={3}>
              {leaveRequests.map((request, index) => (
                <Box key={index}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: theme.palette.primary.main,
                            width: 52,
                            height: 52,
                            mr: 2,
                            fontSize: '1.3rem',
                            fontWeight: 600,
                            boxShadow: theme.shadows[3]
                          }}
                        >
                          {request.employeeName?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="600">
                            {request.employeeName || 'Unknown Employee'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {request.department || 'No department specified'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={8}>
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            Leave Type
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {request.leaveType || '-'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            Duration
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {request.totalDays || 0} day{request.totalDays !== 1 ? 's' : ''}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            From Date
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {request.startDate || '-'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            To Date
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {request.endDate || '-'}
                          </Typography>
                        </Grid>
                      </Grid>

                      {request.reason && (
                        <Box mt={2}>
                          <Typography variant="body2" color="text.secondary">
                            Reason
                          </Typography>
                          <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                            {request.reason}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>

                  <Box mt={3} display="flex" justifyContent="flex-end">
                    <ActionButtons request={request} />
                  </Box>

                  {index < leaveRequests.length - 1 && (
                    <Divider sx={{
                      my: 3,
                      borderColor: 'rgba(0, 0, 0, 0.08)'
                    }} />
                  )}
                </Box>
              ))}
            </Stack>
          </DialogContent>

          <DialogActions sx={{ py: 2, px: 3 }}>
            <Button
              onClick={handleCloseModal}
              variant="outlined"
              sx={{
                borderRadius: '8px',
                px: 3,
                py: 1,
                borderWidth: '1px',
                fontWeight: 600,
                '&:hover': {
                  borderWidth: '1px',
                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </StyledCard>
    </Box>
  );
};

PendingApproval.propTypes = {
  isLoading: PropTypes.bool,
};

export default PendingApproval;