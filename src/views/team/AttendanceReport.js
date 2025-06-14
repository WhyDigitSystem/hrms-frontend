import React, { useState, useEffect } from 'react';
import FormControl from '@mui/material/FormControl';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ActionButton from 'utils/ActionButton';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import apiCalls from 'apicall';
import { Dialog, DialogTitle, DialogContent, Table, TableHead, TableRow, TableCell, TableBody, Button, IconButton } from '@mui/material';
import ToastComponent, { showToast } from 'utils/toast-component';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import DownloadIcon from '@mui/icons-material/Download';

const AttendanceReport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [error, setError] = useState('');
  const [empList, setEmpList] = useState([]);
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    employeeCode: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [branchCode] = useState(localStorage.getItem('branchCode'));

  // New state for checkboxes
  const [showEmployee, setShowEmployee] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // PDF download handler
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Attendance Report', 14, 20);

    const monthText = selectedMonth ? selectedMonth.format('MMMM') : '';
    const yearText = selectedYear ? selectedYear.format('YYYY') : '';
    doc.setFontSize(12);
    // doc.text(`Month: ${monthText}`, 14, 28);
    // doc.text(`Year: ${yearText}`, 45, 28);
    doc.setFont('helvetica', 'bold');
    doc.text('Month:', 14, 28);
    doc.setFont('helvetica', 'normal');
    doc.text(monthText, 29, 28);
    doc.setFont('helvetica', 'bold');
    doc.text('Year:', 50, 28);
    doc.setFont('helvetica', 'normal');
    doc.text(yearText, 61, 28);

    autoTable(doc, {
      startY: 30,
      head: [['Code', 'Employee', 'LOP', 'Working Days', 'Total Working Days', 'Total Leave']],
      body: attendanceReport.map((row) => [
        row.employeeCode,
        row.employeeName,
        row.lopLeave,
        row.empTotalWorkingDays,
        row.empSalaryDays,
        row.totalLeave
      ])
    });

    doc.save('Attendance_Report.pdf');
  };

  const handleSearch = async () => {
    // Case: Neither checkbox is selected
    if (!showEmployee && !showDate) {
      showToast('error', 'Please select Employee or Date');
      return;
    }

    // Case: Only Employee selected but no employee chosen
    if (showEmployee && !formData.employeeCode && !showDate) {
      showToast('error', 'Please select an employee');
      return;
    }

    // Case: Only Date selected but month/year not selected
    if (showDate && (!selectedMonth || !selectedYear) && !showEmployee) {
      showToast('error', 'Please select both month and year');
      return;
    }

    // Case: Both selected but missing one or more values
    if (showEmployee && showDate) {
      const missingFields = [];
      if (!formData.employeeCode) missingFields.push('Employee');
      if (!selectedMonth) missingFields.push('Month');
      if (!selectedYear) missingFields.push('Year');

      if (missingFields.length > 0) {
        showToast('error', `Please select: ${missingFields.join(', ')}`);
        return;
      }
    }

    // Construct parameters
    const employeeCode = showEmployee ? formData.employeeCode || '' : 'All';
    const monthVal = showDate ? (selectedMonth ? selectedMonth.month() + 1 : '') : 'All';
    const yearVal = showDate ? (selectedYear ? selectedYear.year() : '') : 'All';

    setIsLoading(true);

    try {
      const result = await apiCalls(
        'get',
        `leaveprocess/getAttandanceReport?employeeCode=${employeeCode}&month=${monthVal}&orgId=${orgId}&year=${yearVal}`
      );

      if (result?.status) {
        const attendance = result?.paramObjectsMap?.leaveProcessVO || [];
        setAttendanceReport(attendance);
        setDialogOpen(true);
      } else {
        showToast('error', 'No records found');
      }
    } catch (err) {
      showToast('error', 'Error fetching attendance report');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
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

  const handleClear = () => {
    setSelectedMonth(null);
    setSelectedYear(null);
    setFormData({ employeeCode: '' });
    setError('');
    setFieldErrors({});
    setShowEmployee(false);
    setShowDate(false);
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (value) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      setError('');
    }
  }, [selectedMonth, selectedYear]);

  const filteredData = attendanceReport.filter((row) =>
    Object.values(row).some((value) => String(value).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
      <div className="row d-flex ml">
        <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
          <ActionButton title="Search" icon={SearchIcon} onClick={handleSearch} disabled={isLoading} />
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} disabled={isLoading} />
        </div>
      </div>

      {/* Remove this since we now use toast for errors */}
      {error && (
        <div className="row">
          <div className="col-md-6 mb-3">
            <Alert severity="error">{error}</Alert>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={showEmployee}
              onChange={(e) => {
                const checked = e.target.checked;
                setShowEmployee(checked);
                if (!checked) {
                  setFormData((prev) => ({ ...prev, employeeCode: '' })); // clear employee
                }
              }}
            />
          }
          label="Employee"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={showDate}
              onChange={(e) => {
                const checked = e.target.checked;
                setShowDate(checked);
                if (!checked) {
                  setSelectedMonth(null); // clear month
                  setSelectedYear(null); // clear year
                }
              }}
            />
          }
          label="Date"
        />
      </div>
      <div className="row">
        {/* Show Employee dropdown only if showEmployee is true */}
        {showEmployee && (
          <div className="col-md-3 mb-3">
            <Autocomplete
              options={empList}
              getOptionLabel={(option) => option.employeeCode || ''}
              value={empList.find((emp) => emp.employeeCode === formData.employeeCode) || null}
              onChange={(event, newValue) => {
                handleSelectChange({
                  target: {
                    name: 'employeeCode',
                    value: newValue ? newValue.employeeCode : ''
                  }
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Employee Code"
                  variant="outlined"
                  fullWidth
                  error={!!fieldErrors.employeeCode}
                  helperText={fieldErrors.employeeCode}
                />
              )}
              isOptionEqualToValue={(option, value) => option.employeeCode === value.employeeCode}
            />
          </div>
        )}

        {/* Show Month and Year dropdowns only if showDate is true */}
        {showDate && (
          <>
            <div className="col-md-3 mb-3">
              <FormControl fullWidth>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    views={['month']}
                    label="Select Month"
                    value={selectedMonth}
                    onChange={(newValue) => setSelectedMonth(newValue)}
                  />
                </LocalizationProvider>
              </FormControl>
            </div>

            <div className="col-md-3 mb-3">
              <FormControl fullWidth>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    views={['year']}
                    label="Select Year"
                    value={selectedYear}
                    onChange={(newValue) => setSelectedYear(newValue)}
                  />
                </LocalizationProvider>
              </FormControl>
            </div>
          </>
        )}
      </div>
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
          Attendance Report
          <IconButton onClick={handleDownloadPDF} title="Download PDF">
            <DownloadIcon color="primary" />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <div className="row mt-2">
            <div className="col-md-4">
              <TextField
                label="Search"
                variant="outlined"
                size="small"
                fullWidth
                sx={{ mb: 2 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {showDate && selectedMonth && selectedYear && (
              <div style={{ marginBottom: '5px', fontSize: '14px', display: 'flex', gap: '10px' }}>
                <label>
                  <strong>Month:</strong> {selectedMonth.format('MMMM')}
                </label>
                <label>
                  <strong>Year:</strong> {selectedYear.format('YYYY')}
                </label>
              </div>
            )}
          </div>

          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {['Code', 'Employee', 'LOP', 'Working Days', 'Total Working Days', 'Total Leave'].map((heading, index) => (
                  <TableCell
                    key={index}
                    sx={{
                      backgroundColor: '#1976d2',
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
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ padding: 3, fontStyle: 'italic', color: '#777' }}>
                    No matching records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row) => (
                  <TableRow key={row.id} hover sx={{ '&:hover': { backgroundColor: '#f0f8ff' } }}>
                    <TableCell align="center">{row.employeeCode}</TableCell>
                    <TableCell align="center">{row.employeeName}</TableCell>
                    <TableCell align="center">{row.lopLeave}</TableCell>
                    <TableCell align="center">{row.empTotalWorkingDays}</TableCell>
                    <TableCell align="center">{row.empSalaryDays}</TableCell>
                    <TableCell align="center">{row.totalLeave}</TableCell>
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
      <ToastComponent />
    </div>
  );
};

export default AttendanceReport;
