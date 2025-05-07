import React, { useState, useEffect, useCallback } from 'react';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { Box, Button, Card, Typography, Paper } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import apiCalls from 'apicall';
import 'react-toastify/dist/ReactToastify.css';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';

const LeaveApproval = () => {
  const [listViewData, setListViewData] = useState([]);
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const orgId = localStorage.getItem('orgId');
  const employeeCode = localStorage.getItem("employeeCode");

  useEffect(() => {
    getAllApprovedLeaveForTeam();
  }, []);

  // In your getAllHolidayByOrgId function
  const getAllApprovedLeaveForTeam = useCallback(async () => {
    try {
      // Fetching approved leaves for the team
      const result = await apiCalls('get', `/leaveprocess/getAllApprovedLeaveForTeam?branchCode=${branchCode}&orgId=${orgId}&reportingPersonCode=${employeeCode}`);

      const approvedLeaves = result?.paramObjectsMap?.leaveRequestVO || [];

      // Optionally reverse the list if you want the latest leaves first
      const reversedApprovedLeaves = [...approvedLeaves];
      setListViewData(reversedApprovedLeaves);

      if (reversedApprovedLeaves.length > 0 && reversedApprovedLeaves[0].branchCode) {
        setBranchCode(reversedApprovedLeaves[0].branchCode);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, [branchCode, orgId, employeeCode]);

  const listViewColumns = [
    { accessorKey: 'employeeName', header: 'Employee Name', size: 140 },
    { accessorKey: 'employeeCode', header: 'Employee Code', size: 140 },
    { accessorKey: 'employeeEmail', header: 'Employee Email', size: 140 },
    { accessorKey: 'reason', header: 'Reason', size: 140 },
    { accessorKey: 'leaveType', header: 'Leave Type', size: 140 },
    { accessorKey: 'totalDays', header: 'Total Days', size: 140 },
    { accessorKey: 'startDate', header: 'Start Date', size: 140 },
    { accessorKey: 'endDate', header: 'End Date', size: 140 },
    { accessorKey: 'screenName', header: 'Screen Name', size: 140 },
  ];

  return (
    <>
      <Card sx={{ padding: 4, backgroundColor: '#ffffff', boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)', borderRadius: 4, maxWidth: '100%', mt: 3 }}>
        <ToastContainer position="top-right" autoClose={5000} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          {/* <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
          Leave Approval- {branchName ? branchName : "No branch available"} - Branch
          </Typography> */}
        </Box>
        <Box sx={{ mt: 4 }}>
          {listViewData.length > 1 && (
            <Paper sx={{ boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <CommonListViewTable
                data={listViewData}
                columns={listViewColumns}
                blockEdit
                showActions={false}
                hideActions
              />
            </Paper>
          )}
        </Box>
      </Card>
    </>
  );
};

export default LeaveApproval;