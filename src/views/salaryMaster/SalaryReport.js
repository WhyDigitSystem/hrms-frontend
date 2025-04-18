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
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Checkbox } from '@mui/material';
import { FaEllipsisV } from 'react-icons/fa';

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
            <ActionButton title="Search" icon={SearchIcon} onClick={getAllSalaryReport} />
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
                    <button className="btn btn-primary" onClick={handlePrint}>
                      Print
                    </button>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-bordered" id="salaryTable">
                      <thead>
                        <tr style={{ backgroundColor: '#673AB7' }}>
                          <th className="px-2 py-2 text-white text-center">S.No</th>
                          <th className="px-2 py-2 text-white text-center">Employee Name</th>
                          <th className="px-2 py-2 text-white text-center">Employee Code</th>
                          <th className="px-2 py-2 text-white text-center">Total Leave</th>
                          <th className="px-2 py-2 text-white text-center">LOP (Loss of Pay)</th>
                          <th className="px-2 py-2 text-white text-center">Total Employee Working Days</th>
                          <th className="px-2 py-2 text-white text-center">Total Working Days</th>
                          <th className="px-2 py-2 text-white text-center">Employee Salary</th>
                          <th className="px-2 py-2 text-white text-center">Net Pay Salary</th>
                          <th className="px-2 py-2 text-white text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allSalary.map((leave, index) => (
                          <tr key={leave.employeeCode}>
                            <td className="text-center">{index + 1}</td>
                            <td className="text-center">{leave.employeeName}</td>
                            <td className="text-center">{leave.employeeCode}</td>
                            <td className="text-center">{leave.totalLeave}</td>
                            <td className="text-center">{leave.lopLeave}</td>
                            <td className="text-center">{leave.empTotalWorkingDays}</td>
                            <td className="text-center">{leave.empSalaryDays}</td>
                            <td className="text-center">{leave.grossPay}</td>
                            <td className="text-center">{leave.netPay}</td>
                            <td className="text-center" style={{ color: leave.approvedStatus === 'Approved' ? 'green' : 'inherit' }}>
                              {leave.approvedStatus}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
