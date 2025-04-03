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

const StyledCard = styled(MainCard)(({ theme }) => ({
  background: `rgba(255, 255, 255, 0.7)`,
  backdropFilter: "blur(10px)",
  borderRadius: "20px",
  boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease-in-out",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    boxShadow: "0px 15px 35px rgba(0, 0, 0, 0.15)",
  },
}));

const RequestItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  borderRadius: "12px",
  background: theme.palette.background.paper,
  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
  },
}));

const ActionButton = styled(Button)(({ theme, actiontype }) => ({
  borderRadius: '20px',
  minWidth: '100px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: actiontype === 'approve' 
    ? '0 2px 4px rgba(76, 175, 80, 0.3)'
    : '0 2px 4px rgba(244, 67, 54, 0.3)',
  background: actiontype === 'approve' 
    ? 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)'
    : 'linear-gradient(135deg, #F44336 0%, #C62828 100%)',
  '&:hover': {
    background: actiontype === 'approve' 
      ? 'linear-gradient(135deg, #43A047 0%, #1B5E20 100%)'
      : 'linear-gradient(135deg, #E53935 0%, #B71C1C 100%)',
    boxShadow: actiontype === 'approve'
      ? '0 4px 8px rgba(76, 175, 80, 0.4)'
      : '0 4px 8px rgba(244, 67, 54, 0.4)'
  },
  '&.Mui-disabled': {
    background: '#E0E0E0',
    color: '#A5A5A5'
  }
}));

const PendingApproval = ({ isLoading }) => {
  const theme = useTheme();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const orgId = localStorage.getItem("orgId");
  const employeeCode = localStorage.getItem("employeeCode");

  useEffect(() => {
    getLeaveRequest();
  }, [orgId, employeeCode]);

  const getLeaveRequest = async () => {
    try {
      const response = await apiCalls(
        "get",
        `leaveprocess/getLeaveRequestForDashBoard?orgId=${orgId}&reportingPersonCode=${employeeCode}`
      );
      setLeaveRequests(response.paramObjectsMap.leaveRequestVO || []);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request) => {
    setProcessingId(request.id);
    try {
      console.log("Approving:", request);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Add your actual approval API call here
      // await apiCalls("post", "approveEndpoint", request);
      // Refresh the list after approval
      await getLeaveRequest();
    } catch (error) {
      console.error("Approval failed:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request) => {
    setProcessingId(request.id);
    try {
      console.log("Rejecting:", request);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Add your actual rejection API call here
      // await apiCalls("post", "rejectEndpoint", request);
      // Refresh the list after rejection
      await getLeaveRequest();
    } catch (error) {
      console.error("Rejection failed:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRequest(null);
  };

  const ActionButtons = ({ request }) => (
    <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
      <Tooltip title="Approve leave request">
        <span> {/* Added span to prevent tooltip warning when button is disabled */}
          <ActionButton
            actiontype="approve"
            variant="contained"
            startIcon={
              processingId === request.id ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <ThumbUp />
              )
            }
            onClick={() => handleApprove(request)}
            size="small"
            disabled={processingId !== null && processingId !== request.id}
          >
            {processingId === request.id ? 'Approving...' : 'Approve'}
          </ActionButton>
        </span>
      </Tooltip>

      <Tooltip title="Reject leave request">
        <span> {/* Added span to prevent tooltip warning when button is disabled */}
          <ActionButton
            actiontype="reject"
            variant="contained"
            startIcon={
              processingId === request.id ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <ThumbDown />
              )
            }
            onClick={() => handleReject(request)}
            size="small"
            disabled={processingId !== null && processingId !== request.id}
          >
            {processingId === request.id ? 'Rejecting...' : 'Reject'}
          </ActionButton>
        </span>
      </Tooltip>
    </Stack>
  );

  return (
    <StyledCard sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="700">
          Pending Leave Requests
        </Typography>
        {leaveRequests.length > 3 && (
          <Button
            onClick={handleOpenModal}
            endIcon={<ArrowForward />}
            sx={{ 
              textTransform: 'none',
              color: theme.palette.primary.main
            }}
          >
            View All ({leaveRequests.length})
          </Button>
        )}
      </Box>

      {loading ? (
        <Box textAlign="center" py={4}>
          <CircularProgress size={40} />
          <Typography variant="h6" mt={2}>Loading requests...</Typography>
        </Box>
      ) : leaveRequests.length > 0 ? (
        <Stack spacing={2}>
          {leaveRequests.slice(0, 3).map((leaveRequest, index) => (
            <RequestItem key={index}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} sm={5}>
                  <Box display="flex" alignItems="center">
                    <Avatar 
                      sx={{ 
                        bgcolor: theme.palette.primary.main, 
                        width: 40, 
                        height: 40, 
                        mr: 2,
                        fontSize: '1rem',
                        fontWeight: 600
                      }}
                    >
                      {leaveRequest.employeeName?.charAt(0) || 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600">
                        {leaveRequest.employeeName || 'Unknown Employee'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {leaveRequest.leaveType || 'No type specified'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Chip 
                    label={`${leaveRequest.totalDays || 0} day${leaveRequest.totalDays !== 1 ? 's' : ''}`}
                    color="primary"
                    variant="outlined"
                    sx={{
                      fontWeight: 500,
                      borderWidth: '2px',
                      '& .MuiChip-label': {
                        px: 1
                      }
                    }}
                  />
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
          <Typography variant="h6" color="textSecondary">
            No Pending Requests
          </Typography>
          <Typography variant="body2" mt={1}>
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
            borderRadius: '16px',
            p: 0,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: theme.palette.primary.main,
          color: 'white',
          py: 2,
          px: 3
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="700">
              All Pending Leave Requests
            </Typography>
            <IconButton 
              onClick={handleCloseModal}
              sx={{ color: 'white' }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers sx={{ py: 2, px: 3 }}>
          <Stack spacing={3}>
            {leaveRequests.map((request, index) => (
              <Box key={index}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <Box display="flex" alignItems="center">
                      <Avatar 
                        sx={{ 
                          bgcolor: theme.palette.primary.main, 
                          width: 48, 
                          height: 48, 
                          mr: 2,
                          fontSize: '1.2rem',
                          fontWeight: 600
                        }}
                      >
                        {request.employeeName?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="600">
                          {request.employeeName || 'Unknown Employee'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {request.department || 'No department specified'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="textSecondary">
                          Leave Type
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {request.leaveType || '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="textSecondary">
                          Duration
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {request.totalDays || 0} day{request.totalDays !== 1 ? 's' : ''}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="textSecondary">
                          From Date
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {request.fromDate || '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="textSecondary">
                          To Date
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {request.toDate || '-'}
                        </Typography>
                      </Grid>
                    </Grid>

                    {request.reason && (
                      <Box mt={2}>
                        <Typography variant="body2" color="textSecondary">
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
              borderRadius: '20px',
              px: 3,
              borderWidth: '2px',
              '&:hover': {
                borderWidth: '2px'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </StyledCard>
  );
};

PendingApproval.propTypes = {
  isLoading: PropTypes.bool,
};

export default PendingApproval;