import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import apiCalls from 'apicall';
import { useState, useEffect } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import dayjs from 'dayjs';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import { MenuItem } from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel } from '@mui/material';
import { FaEllipsisV } from 'react-icons/fa';
import { TableCell, TableContainer, TableHead, TablePagination, Tooltip, Typography, Checkbox, Button } from '@mui/material';
import { Table, TableBody, TableRow, TableFooter, TableSortLabel, Paper, Box } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
const months = [
  { name: 'All', value: '0' },
  { name: 'January', value: '01' },
  { name: 'February', value: '02' },
  { name: 'March', value: '03' },
  { name: 'April', value: '04' },
  { name: 'May', value: '05' },
  { name: 'June', value: '06' },
  { name: 'July', value: '07' },
  { name: 'August', value: '08' },
  { name: 'September', value: '09' },
  { name: 'October', value: '10' },
  { name: 'November', value: '11' },
  { name: 'December', value: '12' }
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, index) => currentYear - index);

const SalaryReport = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [selectedMonth, setSelectedMonth] = useState('');
  const [formData, setFormData] = useState({ month: '', year: '' });
  const [fieldErrors, setFieldErrors] = useState({ month: '', year: '' });
  const [listView, setListView] = useState(false);
  const [allSalary, setAllSalary] = useState([]);
  const [showSelectedMonthYear, setShowSelectedMonthYear] = useState(false);

  const [mainTableData, setMainTableData] = useState([]);

  const handleMonthChange = (event) => {
    const selected = months.find((m) => m.name === event.target.value);
    setSelectedMonth(selected?.name || '');
    setFormData({ ...formData, month: selected?.value || '' });
  };

  const handleYearChange = (event) => {
    setFormData({ ...formData, year: event.target.value });
  };

  const getAllSalaryReport = async () => {
    try {
      const selectedMonth = formData.month ? formData.month : '0';
      const selectedYear = formData.year ? formData.year : 'All';

      const response = await apiCalls(
        'get',
        `employeemaster/getApprovedSalaryProcessReport?month=${selectedMonth}&orgId=${orgId}&Year=${selectedYear}`
      );

      setShowSelectedMonthYear(true);

      if (response.status === true) {
        const salaryData = response.paramObjectsMap.salaryProcessVO;
        setAllSalary(salaryData);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Collect all employees' status data to save
      const saveDataArray = allSalary.map((employee) => ({
        branch: branch,
        branchCode: branchCode,
        createdBy: loginUserName,
        empSalaryDays: parseInt(employee.empSalaryDays),
        empTotalWorkingDays: parseInt(employee.empTotalWorkingDays),
        employeeCode: employee.employeeCode,
        employeeName: employee.employeeName,
        orgId: parseInt(orgId),
        totalCompanyWorkingDays: parseInt(employee.totalCompanyWorkingDays),
        totalLeave: parseInt(employee.totalLeave),
        month: parseInt(formData.month),
        year: formData.year
      }));

      console.log('Saving Employee Data:', saveDataArray);

      const response = await apiCalls('put', '/employeemaster/createUpdateSalaryProcess', saveDataArray);

      if (response.status === true) {
        showToast('Salary Process created successfully');
        handleCancel();
        setIsLoading(false);
      } else {
        showToast('error', response.paramObjectsMap.errorMessage || 'Salary Process creation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('error', 'Salary Process creation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  const handleCancel = () => {
    setSelectedMonth(''); // Clear selected month
    setFormData({ month: '', year: '' }); // Clear form data
    setFieldErrors({ month: false, year: false }); // Reset errors
    setAllSalary([]); // Clear table data
    setShowSelectedMonthYear(false); // Hide text
    setMainTableData([]);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const tableContent = document.getElementById('salaryTable').outerHTML;
    const style = `
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid black;
          padding: 8px;
          text-align: center;
        }
        th {
          background-color: #673AB7;
          color: white;
          font-weight: bold;
        }
      </style>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>Salary Report</title>
          ${style}
        </head>
        <body>
          ${tableContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
            {/* <ActionButton title="Search" icon={SearchIcon} onClick={getAllSalaryReport} /> */}
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleCancel} />
            {/* <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} /> */}
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px 0 10px" />
          </div>
          {/* Select Month */}
          <div className="col-md-3 mb-3">
            <FormControl fullWidth size="small">
              <InputLabel>Select Month</InputLabel>
              <Select label="Select Month" value={selectedMonth} onChange={handleMonthChange}>
                {months.map((m) => (
                  <MenuItem key={m.value} value={m.name}>
                    {m.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          {/* Select Year */}
          <div className="col-md-3 mb-3">
            <FormControl fullWidth size="small">
              <InputLabel>Select Year</InputLabel>
              <Select label="Select Year" value={formData.year} onChange={handleYearChange}>
                <MenuItem value="All">All</MenuItem>
                {years.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          {/*  */}
          <div className="col-md-3 mb-3">
            <Button
              variant="contained"
              color="primary"
              onClick={getAllSalaryReport}
              sx={{
                borderRadius: '8px',
                boxShadow: '0px 3px 5px rgba(0,0,0,0.2)',
                textTransform: 'none'
              }}
            >
              Go
            </Button>
          </div>

          {/*  */}
        </div>

        {/* <div className="row mt-3">
          <div className="col-md-2">
            <Button variant="contained" color="primary" fullWidth onClick={getAllSalaryReport} disabled={!formData.month || !formData.year}>
              Search
            </Button>
          </div>
          <div className="col-md-2">
            <Button variant="contained" color="secondary" fullWidth onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div> */}

        <>
          {showSelectedMonthYear && formData.month && formData.year && (
            <div className="row mt-4">
              <div className="col-12">
                <p className="font-weight-bold" style={{ fontSize: '20px' }}>
                  <strong>
                    {formData.month === '0' && formData.year === 'All'
                      ? `All Month Report`
                      : `${dayjs()
                          .month(parseInt(formData.month, 10) - 1)
                          .format('MMMM')} ${formData.year} - The company working days is ${allSalary[0]?.totalCompanyWorkingDays}`}
                  </strong>
                </p>
              </div>
            </div>
          )}

          {/* Selected Salary Data Table */}
          {allSalary.length > 0 && (
            <>
              <div className="row mt-2">
                <div className="col-lg-12">
                  <div className="d-flex justify-content-end mb-2">
                    {/* <button className="btn btn-primary" onClick={handlePrint}>
                      Print
                    </button> */}
                    <Tooltip title="Print">
                      <Button
                        sx={{
                          backgroundColor: '#b5e8df',
                          color: 'black',
                          minWidth: 40,
                          height: 40,
                          '&:hover': {
                            backgroundColor: '#364152',
                            color: 'white'
                          }
                        }}
                        startIcon={<PrintIcon sx={{ fontSize: '3rem', marginLeft: '8px' }} />}
                        onClick={handlePrint}
                      ></Button>
                    </Tooltip>
                  </div>
                  <div className="table-responsive">
                    <TableContainer component={Paper}>
                      <Table id="salaryTable">
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableRow>
                            <TableCell>
                              <strong>S.No</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Employee</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Code</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Total Leave</strong>
                            </TableCell>
                            <TableCell>
                              <strong>LOP</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Total Employee Working Days</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Total Working Days</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Employee Salary</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Net Pay Salary</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Status</strong>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {allSalary.length > 0 ? (
                            allSalary.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((leave, index) => (
                              <TableRow key={leave.employeeCode} hover>
                                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                <TableCell>{leave.employeeName}</TableCell>
                                <TableCell>{leave.employeeCode}</TableCell>
                                <TableCell>{leave.totalLeave}</TableCell>
                                <TableCell>{leave.lopLeave}</TableCell>
                                <TableCell>{leave.empTotalWorkingDays}</TableCell>
                                <TableCell>{leave.empSalaryDays}</TableCell>
                                <TableCell>{leave.grossPay}</TableCell>
                                <TableCell>{leave.netPay}</TableCell>
                                <TableCell style={{ color: leave.approvedStatus === 'Approved' ? 'green' : 'inherit' }}>
                                  {leave.approvedStatus}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={10} className="text-center">
                                No data available
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={mainTableData.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                          setRowsPerPage(parseInt(e.target.value, 10));
                          setPage(0);
                        }}
                      />
                    </TableContainer>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      </div>
      <ToastContainer />
    </>
  );
};

export default SalaryReport;
