import React, { useState, useEffect, useCallback } from 'react';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { Box, Button, Card, Typography, Paper } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import apiCalls from 'apicall';
import 'react-toastify/dist/ReactToastify.css';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';

const PermissionApproval = () => {
  const [listViewData, setListViewData] = useState([]);
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [branchName, setBranchName] = useState(localStorage.getItem('branchName'));
  const orgId = localStorage.getItem('orgId');
  const employeeCode = localStorage.getItem('employeeCode');

  useEffect(() => {
    getApprovedPermissionRequestforTeam();
  }, []);

  const getApprovedPermissionRequestforTeam = useCallback(async () => {
    try {
      const result = await apiCalls(
        'get',
        `/employeemaster/getApprovedPermissionRequestforTeam?branchCode=${branchCode}&orgId=${orgId}&reportingPersonCode=${employeeCode}`
      );

      const approvedPermissions = result?.paramObjectsMap?.permissionRequestVO || [];
      const reversedApprovedPermissions = [...approvedPermissions].reverse();

      setListViewData(reversedApprovedPermissions);

      // Dynamically set branch name if available in the response
      if (reversedApprovedPermissions.length > 0 && reversedApprovedPermissions[0].branch) {
        setBranchName(reversedApprovedPermissions[0].branch);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, [branchCode, orgId, employeeCode]);

  const listViewColumns = [
    { accessorKey: 'date', header: 'Date', size: 140 },
    { accessorKey: 'employeename', header: 'Employee Name', size: 140 },
    { accessorKey: 'employeecode', header: 'Employee Code', size: 140 },
    { accessorKey: 'employeeemail', header: 'Employee Email', size: 140 },
    { accessorKey: 'notes', header: 'Notes', size: 140 },
    { accessorKey: 'fromtime', header: 'From Time', size: 140 },
    { accessorKey: 'totime', header: 'To Time', size: 140 },
    { accessorKey: 'totalhours', header: 'Total Hours', size: 140 },
    { accessorKey: 'branch', header: 'Branch', size: 140 }, // Now visible in the table
  ];

  return (
    <>
      <Card
        sx={{
          padding: 4,
          backgroundColor: '#ffffff',
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
          borderRadius: 4,
          maxWidth: '100%',
          mt: 3,
        }}
      >
        <ToastContainer position="top-right" autoClose={5000} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }} />
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
          Permission Approval - {branchName || 'No branch available'} - Branch
        </Typography>
        <Box sx={{ mt: 0 }}>
          {listViewData.length > 0 ? (
            <Paper
              sx={{
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <CommonListViewTable
                data={listViewData}
                columns={listViewColumns}
                blockEdit
                showActions={false}
                hideActions
              />
            </Paper>
          ) : (
            <Typography variant="h6" sx={{ textAlign: 'center', color: 'gray' }}>
              No Data Available
            </Typography>
          )}
        </Box>
      </Card>
    </>
  );
};

export default PermissionApproval;
