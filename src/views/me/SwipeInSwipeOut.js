import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  TextField,
  TablePagination,
  Modal,
  Box,
  Typography,
  Button
} from '@mui/material';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';
import { ToastContainer } from 'react-toastify';
import emailjs from '@emailjs/browser';

const SwipeInSwipeOut = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userName] = useState(localStorage.getItem('userName'));
  const [empName, setEmpName] = useState(localStorage.getItem('employeeName'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [empCode] = useState(localStorage.getItem('employeeCode'));
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [listViewData, setListViewData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState('');
  const [searchText, setSearchText] = useState('');
  const [reportingPersonMail, setReportingPersonMail] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    getAllSwipeInandOut();
    getReportingPerson();
  }, []);

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setCheckOutTime(row.checkOutTime || '');
    setModalOpen(true);
  };

  const getAllSwipeInandOut = async () => {
    setLoading(true);
    try {
      const result = await apiCalls('get', `basicmaster/attendance/${userName}`);
      if (result?.paramObjectsMap?.Attendance) {
        const transformed = result.paramObjectsMap.Attendance.map((item) => ({
          ...item,
          date: formatDate(item.entrydate),
          day: getDay(item.entrydate),
          totalWorkingHours: formatTime(item.TotalWorkingHours),
          effectiveFrom: formatTime(item.effectivefrom),
          checkInTime: formatTime(item.checkInTime),
          checkOutTime: formatTime(item.checkOutTime)
        }));
        const sorted = transformed.sort((a, b) => new Date(b.entrydate) - new Date(a.entrydate));
        setListViewData(sorted);
        setFilteredData(sorted);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReportingPerson = async () => {
    setLoading(true);
    try {
      const result = await apiCalls('get', `master/getAllEmployeeByOrgIdAndEmployeeCode?employeeCode=${empCode}&orgId=${orgId}`);
      if (result?.paramObjectsMap?.employeeVO?.length) {
        const mail = result.paramObjectsMap.employeeVO[0]?.reportnigPersonEmail;
        setReportingPersonMail(mail || '');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB'); // dd/mm/yyyy
  };

  const getDay = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const formatTime = (timeStr) => {
    if (!timeStr || timeStr === '00:00:00') return '00:00';
    const [h, m] = timeStr.split(':');
    return `${h}:${m}`;
  };

  const handleSearch = (e) => {
    const val = e.target.value.toLowerCase();
    setSearchText(val);
    const filtered = listViewData.filter(
      (row) => row.date.toLowerCase().includes(val) || row.day.toLowerCase().includes(val) || row.checkInTime.toLowerCase().includes(val)
    );
    setFilteredData(filtered);
    setPage(0);
  };

  const handleCheckOutClick = (row) => {
    const now = new Date().toTimeString().slice(0, 5);
    setSelectedRow(row);
    setCheckOutTime(now);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedRow) return;

    // Convert from "dd/mm/yyyy" to "yyyy-mm-dd"
    let formattedDate = '';
    if (selectedRow.date.includes('/')) {
      const [day, month, year] = selectedRow.date.split('/');
      formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else {
      formattedDate = selectedRow.date;
    }

    const payload = {
      branch: branch,
      empCode: empCode,
      orgId: orgId,
      entryTime: checkOutTime,
      reportingPersonMail: reportingPersonMail,
      date: formattedDate // correctly formatted here
    };

    setIsLoading(true);

    try {
      const response = await apiCalls('put', '/basicmaster/createRequestCheckOut', payload);

      if (response.status === true) {
        showToast('success', 'Check-out time submitted successfully');
        await sendEmailNotification(payload);

        const updatedData = listViewData.map((row) => (row.date === selectedRow.date ? { ...row, checkOutTime } : row));

        setListViewData(updatedData);
        setFilteredData(
          updatedData.filter(
            (row) =>
              row.date.toLowerCase().includes(searchText) ||
              row.day.toLowerCase().includes(searchText) ||
              row.checkInTime.toLowerCase().includes(searchText)
          )
        );

        setModalOpen(false);
      } else {
        showToast('error', response.paramObjectsMap?.errorMessage || 'Check-out submission failed');
      }
    } catch (error) {
      console.error('Error submitting check-out:', error);
      showToast('error', 'Check-out submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmailNotification = async (row) => {
    try {
      const emailParams = {
        name: row.notify, // ensure 'notify' is part of `selectedRow`
        from_name: empName,
        entryTime: row.entryTime, // should be `entryTime` not checkOutTime
        email: row.reportingPersonMail
      };

      console.log('Email Params:', emailParams);

      if (!emailParams.email) {
        console.error('Error: Recipient email is missing!');
        showToast('error', 'Recipient email is missing!');
        return;
      }

      await emailjs.send('service_d3c7xso', 'template_0pef9wb', emailParams, 'uMcVJdror6W86lK6z');
      console.log('Email Sent Successfully for', emailParams.email);
    } catch (error) {
      console.error('Email Sending Failed:', error);
      showToast('error', 'Failed to send email notification. Please try again.');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {/* <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
        Swipe In / Swipe Out Records
      </Typography> */}

      <TextField variant="outlined" label="Search" value={searchText} onChange={handleSearch} sx={{ mb: 2 }} />
      <Box display="flex" alignItems="center" justifyContent="right" gap={2} mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box width={16} height={16} bgcolor="green" borderRadius="50%" />
          <span>Approved</span>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box width={16} height={16} bgcolor="#FFA500" borderRadius="50%" />
          <span>Pending</span>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box width={16} height={16} bgcolor="black" borderRadius="50%" />
          <span>Not Submitted</span>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>
                <strong>Date</strong>
              </TableCell>
              <TableCell>
                <strong>Day</strong>
              </TableCell>
              <TableCell>
                <strong>Check-In</strong>
              </TableCell>
              <TableCell>
                <strong>Check-Out</strong>
              </TableCell>
              <TableCell>
                <strong>Gross Hours</strong>
              </TableCell>
              <TableCell>
                <strong>Effective Hours</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.day}</TableCell>
                <TableCell>{row.checkInTime}</TableCell>
                <TableCell
                  onClick={() => {
                    if (row.checkOutTime === '00:00') {
                      handleCheckOutClick(row);
                    }
                  }}
                  style={{
                    color:
                      row.approvalstatus === 'APPROVED'
                        ? 'green'
                        : row.approvalstatus === 'PENDING'
                          ? '#FFA500' // More reliable than "orange"
                          : 'black',
                    cursor: row.checkOutTime === '00:00' ? 'pointer' : 'default',
                    textDecoration: row.checkOutTime === '00:00' ? 'underline' : 'none',
                    fontWeight: row.approvalstatus === 'APPROVED' || row.approvalstatus === 'PENDING' ? 'bold' : 'normal'
                  }}
                >
                  {row.checkOutTime}
                </TableCell>
                <TableCell>{row.totalWorkingHours}</TableCell>
                <TableCell>{row.effectiveFrom}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'white',
            p: 4,
            borderRadius: 2,
            boxShadow: 24,
            width: 300
          }}
        >
          <Typography variant="h6" gutterBottom>
            Set Check-Out Time
          </Typography>
          <TextField
            type="time"
            fullWidth
            value={checkOutTime}
            onChange={(e) => setCheckOutTime(e.target.value)}
            sx={{ mt: 2 }}
            inputProps={{ step: 60 }}
          />
          <Button variant="contained" color="primary" fullWidth sx={{ mt: 3 }} onClick={handleSave}>
            Save
          </Button>
        </Box>
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default SwipeInSwipeOut;
