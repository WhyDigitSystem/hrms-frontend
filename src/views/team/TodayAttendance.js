import React, { useState, useEffect, useCallback } from 'react';
import { Box, Card, Typography, Paper } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import apiCalls from 'apicall';
import 'react-toastify/dist/ReactToastify.css';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import dayjs from 'dayjs';
import SearchOffIcon from '@mui/icons-material/SearchOff';

const TodayAttendance = () => {
  const [listViewData, setListViewData] = useState([]);
  const [branchName] = useState(localStorage.getItem('branch'));
  const [orgId] = useState(localStorage.getItem('orgId'));

  const today = dayjs().format('YYYY-MM-DD');

  const getTodayAttendanceReportByOrgId = useCallback(async () => {
    try {
      const response = await apiCalls(
        'get',
        `/basicmaster/getTodayAttendanceReportByOrgId?branch=${branchName}&date=${today}&orgId=${orgId}`
      );

      const attendanceData = response?.paramObjectsMap?.attendanceReport || [];
      setListViewData(attendanceData);
    } catch (error) {
      console.error("Error fetching today's attendance:", error);
    }
  }, [branchName, today, orgId]);

  useEffect(() => {
    getTodayAttendanceReportByOrgId();
  }, [getTodayAttendanceReportByOrgId]);

  const listViewColumns = [
    { accessorKey: 'empcode', header: 'Employee Code', size: 140 },
    { accessorKey: 'CheckInTime', header: 'Check-In Time', size: 140 },
    { accessorKey: 'CheckOutTime', header: 'Check-Out Time', size: 140 },
    { accessorKey: 'TotalWorkingHours', header: 'Working Hours', size: 160 },
    { accessorKey: 'entrydate', header: 'Date', size: 140 }
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
          mt: 3
        }}
      >
        <ToastContainer position="top-right" autoClose={5000} />
        <Box sx={{ mt: 0 }}>
          {listViewData.length > 0 ? (
            <Paper sx={{ boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit showActions={false} enableEditing={false} hideActions />
            </Paper>
          ) : (
            <Box
              sx={{
                py: 1,
                textAlign: 'center',
                color: 'text.secondary',
                fontSize: 16,
                fontWeight: 500
              }}
            >
              <SearchOffIcon sx={{ fontSize: 40, mb: 1, color: 'grey.500' }} />
              <div>No data found</div>
            </Box>
          )}
        </Box>
      </Card>
    </>
  );
};

export default TodayAttendance;
