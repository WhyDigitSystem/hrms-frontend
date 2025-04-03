import PropTypes from "prop-types";
import { Box, Typography, Button, Stack, Grid } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import MainCard from "ui-component/cards/MainCard";
import { ThumbUp, ThumbDown } from "@mui/icons-material";
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

const PendingApproval = ({ isLoading }) => {
  const theme = useTheme();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleApprove = (request) => console.log("Approved:", request);
  const handleReject = (request) => console.log("Rejected:", request);

  return (
    <StyledCard sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
        Pending Leave Requests
      </Typography>
      {loading ? (
        <Typography variant="h6" textAlign="center">
          Loading...
        </Typography>
      ) : leaveRequests.length > 0 ? (
        <Stack >
          <Grid container sx={{ background: "#f9f9f9", p: 2, borderRadius: "12px" }}>
            {leaveRequests.map((leaveRequest, index) => (
              <Grid
                container
                key={index}
                // spacing={2}
                alignItems="center"
                sx={{
                  borderBottom: index !== leaveRequests.length - 1 ? "1px solid #ddd" : "none",
                  pb: 1,
                }}
              >
                {/* Employee Name */}
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {leaveRequest.employeeName}
                  </Typography>
                </Grid>

                {/* Total Days */}
                <Grid item xs={2}>
                  <Typography variant="body2" fontWeight="500">
                    {leaveRequest.totalDays} days
                  </Typography>
                </Grid>

                {/* Buttons */}
                <Grid item xs={6} display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ThumbUp />}
                    onClick={() => handleApprove(leaveRequest)}
                    sx={{ mr: 1 }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<ThumbDown />}
                    onClick={() => handleReject(leaveRequest)}
                  >
                    Reject
                  </Button>
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Stack>
      ) : (
        <Typography variant="h6" textAlign="center">
          No Leave Requests Found
        </Typography>
      )}
    </StyledCard>
  );
};

PendingApproval.propTypes = {
  isLoading: PropTypes.bool,
};

export default PendingApproval;
