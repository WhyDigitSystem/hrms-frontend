import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ActionButton from 'utils/ActionButton';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/';
import dayjs from 'dayjs';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';
import { useState, useEffect } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, Table, TableHead, TableRow, TableCell, TableBody, Button, IconButton } from '@mui/material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CircularProgress from '@mui/material/CircularProgress';
import { ToastContainer } from 'react-toastify';
import Tooltip from '@mui/material/Tooltip';
import DownloadIcon from '@mui/icons-material/Download';
const EmployeeAttanceReport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [branchCode] = useState(localStorage.getItem('branchCode'));
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [branch] = useState(localStorage.getItem('branch'));
  const [empList, setEmpList] = useState([]);
  const [formData, setFormData] = useState({
    fromDate: null,
    toDate: null,
    empId: 'ALL'
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogClose = () => {
    setDialogOpen(false);
    handleAllClear();
  };
  const handleAllClear = () => {
    setFormData({
      fromDate: null,
      toDate: null,
      empId: 'ALL'
    });
    setFieldErrors({});
  };

  const handleClick = async () => {
    const errors = {};
    if (!formData.fromDate) {
      errors.fromDate = 'From Date is required';
    }
    if (!formData.toDate) {
      errors.toDate = 'To Date is required';
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    } else {
      setFieldErrors({});
    }
    setIsLoading(true);
    try {
      const result = await apiCalls(
        'get',
        `/leaveprocess/getCheckInOutReport?branch=${branch}&employeeCode=${formData.empId}&fromDate=${dayjs(formData.fromDate).format('YYYY-MM-DD')}&orgId=${orgId}&toDate=${dayjs(formData.toDate).format('YYYY-MM-DD')}`
      );
      if (result?.status) {
        const attendance = result?.paramObjectsMap?.checkInVO || [];
        setAttendanceReport(attendance);
        setDialogOpen(true);
        setIsLoading(false);
      } else {
        showToast('error', 'No records found');
        setIsLoading(false);
      }
    } catch (err) {
      showToast('error', 'Error fetching attendance report');
      setIsLoading(false);
      console.error(err);
    }
  };

  // Fetch employee list
  const getAllUsers = async () => {
    try {
      const response = await apiCalls('get', `/master/getAllEmployeeByOrgId?orgId=${orgId}&branchCode=${branchCode}`);
      if (response.status === true) {
        setEmpList(response.paramObjectsMap.employeeVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  useEffect(() => {
    getAllUsers();
  }, []);

  //
  const handleDownloadPDF = () => {
    if (attendanceReport.length === 0) {
      showToast('error', 'No data to download');
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Check In/Out Report', 14, 20);

    const fromDate = formData.fromDate ? dayjs(formData.fromDate).format('DD-MM-YYYY') : '';
    const toDate = formData.toDate ? dayjs(formData.toDate).format('DD-MM-YYYY') : '';
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('From Date:', 14, 28);
    doc.setFont('helvetica', 'normal');
    doc.text(fromDate, 38, 28);
    doc.setFont('helvetica', 'bold');
    doc.text('To Date:', 62, 28);
    doc.setFont('helvetica', 'normal');
    doc.text(toDate, 80, 28);

    autoTable(doc, {
      startY: 30,
      head: [['Code', 'Employee', 'Date', 'Check In', 'Check Out', 'Total Hours']],
      body: attendanceReport.map((row) => [
        row.employeeCode,
        row.employeeName,
        row.entryDate,
        row.checkInTime,
        row.checkOutTime,
        row.grossHours
      ])
    });

    doc.save('Check In/Out Report_.pdf');
  };

  const handleDownloadExcel = () => {
    if (attendanceReport.length === 0) {
      showToast('error', 'No data to download');
      return;
    }

    const exportData = attendanceReport.map((row) => ({
      Code: row.employeeCode,
      Employee: row.employeeName,
      Date: row.entryDate,
      'Check In': row.checkInTime,
      'Check Out': row.checkOutTime,
      'Total Hours': row.grossHours
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Check In-Out Report');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    saveAs(blob, 'CheckInOutReport.xlsx');
  };

  return (
    <>
      <ToastContainer />
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={handleClick} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleAllClear} />
          </div>
        </div>
        <div className="row">
          <div className="col-md-3 mb-3">
            <FormControl fullWidth variant="filled" size="small">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  // label="From Date"
                  label={
                    <span>
                      From Date<span style={{ color: 'red' }}> *</span>
                    </span>
                  }
                  format="DD-MM-YYYY"
                  value={formData.fromDate ? dayjs(formData.fromDate, 'YYYY-MM-DD') : null}
                  onChange={(newValue) => {
                    setFormData((prev) => ({ ...prev, fromDate: newValue }));
                    setFieldErrors((prev) => ({ ...prev, fromDate: '' }));
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      clearable: true,
                      error: !!fieldErrors.fromDate,
                      helperText: fieldErrors.fromDate
                    }
                  }}
                />
              </LocalizationProvider>
            </FormControl>
          </div>
          <div className="col-md-3 mb-3">
            <FormControl fullWidth variant="filled" size="small">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  // label="To Date"
                  label={
                    <span>
                      To Date<span style={{ color: 'red' }}> *</span>
                    </span>
                  }
                  format="DD-MM-YYYY"
                  value={formData.toDate ? dayjs(formData.toDate, 'YYYY-MM-DD') : null}
                  onChange={(newValue) => {
                    setFormData((prev) => ({ ...prev, toDate: newValue }));
                    setFieldErrors((prev) => ({ ...prev, toDate: '' }));
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      clearable: true,
                      error: !!fieldErrors.toDate,
                      helperText: fieldErrors.toDate
                    }
                  }}
                />
              </LocalizationProvider>
            </FormControl>
          </div>
          <div className="col-md-3 mb-3">
            <FormControl size="small" variant="outlined" fullWidth>
              <InputLabel id="empId-label">Emp Id</InputLabel>
              <Select
                labelId="empId-label"
                label="Emp Id"
                name="empId"
                value={formData.empId}
                onChange={(e) => setFormData((prev) => ({ ...prev, empId: e.target.value }))}
              >
                <MenuItem value="ALL">ALL</MenuItem>
                {empList?.map((row) => (
                  <MenuItem key={row.id} value={row.employeeCode}>
                    {row.employeeCode}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/*  */}
          {isLoading && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '20px',
                width: '100%'
              }}
            >
              <CircularProgress size={40} />
            </div>
          )}
        </div>
        {/*  */}
        {/* Dialog for showing attendance report */}
        <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="lg" fullWidth>
          <DialogTitle
            sx={{
              fontWeight: 'bold',
              fontSize: '20px',
              backgroundColor: '#f5f5f5',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            Check In/Out Report
            {/* <IconButton onClick={handleDownloadPDF} title="Download PDF">
              <DownloadIcon color="primary" />
            </IconButton> */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <Tooltip title="Download Excel">
                <IconButton onClick={handleDownloadExcel}>
                  <DownloadIcon color="primary" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download PDF">
                <IconButton onClick={handleDownloadPDF}>
                  <PictureAsPdfIcon color="error" />
                </IconButton>
              </Tooltip>
            </div>
          </DialogTitle>
          <DialogContent>
            <div style={{ marginBottom: '5px', fontSize: '14px', display: 'flex', gap: '10px' }}>
              <label>
                <strong>From Date:</strong> {formData.fromDate ? dayjs(formData.fromDate).format('DD-MM-YYYY') : 'N/A'}
              </label>
              <label>
                <strong>To Date:</strong> {formData.toDate ? dayjs(formData.toDate).format('DD-MM-YYYY') : 'N/A'}
              </label>
            </div>

            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {['Code', 'Employee', 'Date', 'Check In', 'Check Out', 'Total Hours'].map((heading, index) => (
                    <TableCell
                      key={index}
                      sx={{
                        backgroundColor: '#1976d2',
                        // backgroundColor: '#364152',
                        color: '#fff',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}
                    >
                      {heading}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {attendanceReport.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ padding: 3, fontStyle: 'italic', color: '#777' }}>
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  attendanceReport.map((row) => (
                    <TableRow key={row.id} hover sx={{ '&:hover': { backgroundColor: '#f0f8ff' } }}>
                      <TableCell align="center">{row.employeeCode}</TableCell>
                      <TableCell align="center">{row.employeeName}</TableCell>
                      <TableCell align="center">{row.entryDate}</TableCell>
                      <TableCell align="center">{row.checkInTime}</TableCell>
                      <TableCell align="center">{row.checkOutTime}</TableCell>
                      <TableCell align="center">{row.grossHours}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <Button variant="contained" color="primary" onClick={handleDialogClose}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default EmployeeAttanceReport;
