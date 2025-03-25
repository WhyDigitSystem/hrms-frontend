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

const SalaryProcess = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [selectedMonth, setSelectedMonth] = useState('');
  const [formData, setFormData] = useState({ month: '', year: '' });
  const [fieldErrors, setFieldErrors] = useState({ month: '', year: '' });
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  const [allSalary, setAllSalary] = useState([]);
  const [employeeSalaries, setEmployeeSalaries] = useState([]);
  const [employeeNetSalaries, setEmployeeNetSalaries] = useState([]);
  const [showSelectedMonthYear, setShowSelectedMonthYear] = useState(false);
  const [rowStatus, setRowStatus] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [mainTableData, setMainTableData] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // const toggleDropdown = (employeeCode) => {
  //   setDropdownOpen((prev) => ({
  //     ...prev,
  //     [employeeCode]: !prev[employeeCode] // Toggle dropdown for specific row
  //   }));
  // };

  // const handleStatusChange = (employeeCode, status) => {
  //   setRowStatus((prev) => ({
  //     ...prev,
  //     [employeeCode]: status
  //   }));

  //   setDropdownOpen((prev) => ({
  //     ...prev,
  //     [employeeCode]: false // Close dropdown after selecting status
  //   }));
  // };

  const toggleDropdown = (employeeCode) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [employeeCode]: !prev[employeeCode]
    }));
  };

  const handleStatusChange = (employeeCode, status) => {
    setRowStatus((prev) => ({
      ...prev,
      [employeeCode]: status
    }));

    setDropdownOpen((prev) => ({
      ...prev,
      [employeeCode]: false
    }));
  };

  const handleApproveAll = () => {
    const updatedStatus = {};
    mainTableData.forEach((employee) => {
      updatedStatus[employee.employeeCode] = 'Approved';
    });

    setRowStatus(updatedStatus);
  };

  const handleMonthChange = (event) => {
    const selected = months.find((m) => m.name === event.target.value);
    setSelectedMonth(selected?.name || ''); // Set name for UI
    setFormData({ ...formData, month: selected?.value || '' }); // Set numeric value for API
  };

  const handleYearChange = (event) => {
    setFormData({ ...formData, year: event.target.value });
  };

  const getAllEmployeeNetSalary = async (empSalaryDays, grossPay, totalCompanyWorkingDays, employeeCode) => {
    try {
      const response = await apiCalls(
        'get',
        `employeemaster/getNetPayForSalaryProcess?empSalaryDays=${empSalaryDays}&grossPay=${grossPay}&totalCompanyWorkingDays=${totalCompanyWorkingDays}`
      );

      if (response.status === true) {
        const netSalary = response.paramObjectsMap.salaryProcessVO[0]?.empTotalSalaryAmount || 'Pending';

        // Update net salary state
        setEmployeeNetSalaries((prev) => ({
          ...prev,
          [employeeCode]: netSalary
        }));
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllEmployeeTotalSalary = async (employeeCode) => {
    try {
      const response = await apiCalls(
        'get',
        `employeemaster/getSalaryStructureForSalaryProcess?employeeCode=${employeeCode}&orgId=${orgId}`
      );

      if (response.status === true) {
        const empTotalSalaryAmount = response.paramObjectsMap.salaryProcessVO[0]?.empTotalSalaryAmount || 'Pending';

        // Update employee salaries state
        setEmployeeSalaries((prev) => ({
          ...prev,
          [employeeCode]: empTotalSalaryAmount
        }));

        return empTotalSalaryAmount;
      } else {
        console.error('API Error:', response);
        return 'Pending';
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return 'Pending';
    }
  };

  const getAllSalaryProcess = async () => {
    try {
      const response = await apiCalls(
        'get',
        `employeemaster/getLeaveDetailsforSalaryProcess?month=${formData.month}&orgId=${orgId}&year=${formData.year}`
      );

      setShowSelectedMonthYear(true);

      if (response.status === true) {
        const salaryData = response.paramObjectsMap.salaryProcessVO;
        setAllSalary(salaryData);
        setDialogOpen(true);
        // Fetch salary for each employee in parallel
        salaryData.forEach(async (employee) => {
          const empTotalSalaryAmount = await getAllEmployeeTotalSalary(employee.employeeCode);
          if (empTotalSalaryAmount !== 'Pending') {
            // Now fetch the net salary
            getAllEmployeeNetSalary(employee.empSalaryDays, empTotalSalaryAmount, employee.totalCompanyWorkingDays, employee.employeeCode);
          }
        });
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
        approvedStatus: rowStatus[employee.employeeCode] || 'Pending', // Default to Pending if not set
        branch: branch,
        branchCode: branchCode,
        createdBy: loginUserName,
        empSalaryDays: parseInt(employee.empSalaryDays),
        empTotalWorkingDays: parseInt(employee.empTotalWorkingDays),
        employeeCode: employee.employeeCode,
        employeeName: employee.employeeName,
        grossPay: parseInt(employeeSalaries[employee.employeeCode]) || 0,
        lopLeave: parseInt(employeeSalaries[employee.lopLeave]) || 0,
        netPay: parseInt(employeeNetSalaries[employee.employeeCode]) || 0,
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
    setDialogOpen(false)
  };

  const handleRowSelect = (employeeCode) => {
    setSelectedRows((prev) => (prev.includes(employeeCode) ? prev.filter((code) => code !== employeeCode) : [...prev, employeeCode]));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(allSalary.map((item) => item.employeeCode));
    }
    setSelectAll(!selectAll);
  };

  const handleConfirmSelection = () => {
    setMainTableData(allSalary.filter((item) => selectedRows.includes(item.employeeCode)));
    setDialogOpen(false);
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
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
                {years.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-md-2">
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={getAllSalaryProcess}
              disabled={!formData.month || !formData.year}
            >
              Search
            </Button>
          </div>
          <div className="col-md-2">
            <Button variant="contained" color="secondary" fullWidth onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>

        <>
          {showSelectedMonthYear && formData.month && formData.year && (
            <div className="row mt-3">
              <div className="col-12">
                <p className="font-weight-bold" style={{ fontSize: '20px' }}>
                  <strong>
                    {dayjs()
                      .month(parseInt(formData.month, 10) - 1)
                      .format('MMMM')}{' '}
                    {formData.year} - The company working days is {allSalary[0]?.totalCompanyWorkingDays}
                  </strong>
                </p>
              </div>
            </div>
          )}
          {/* Selected Salary Data Table */}
          {/* {mainTableData.length > 0 && (
            <div className="row mt-2">
              <div className="col-lg-12">
                <div className="table-responsive">
                  <table className="table table-bordered">
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
                      {mainTableData.map((leave, index) => (
                        <tr key={leave.employeeCode}>
                          <td className="text-center">{index + 1}</td>
                          <td className="text-center">{leave.employeeName}</td>
                          <td className="text-center">{leave.employeeCode}</td>
                          <td className="text-center">{leave.totalLeave}</td>
                          <td className="text-center">{leave.lopLeave}</td>
                          <td className="text-center">{leave.empTotalWorkingDays}</td>
                          <td className="text-center">{leave.totalCompanyWorkingDays}</td>
                          <td className="text-center">{employeeSalaries[leave.employeeCode] || 'Pending'}</td>
                          <td className="text-center">{employeeNetSalaries[leave.employeeCode] || 'Pending'}</td>

                          <td className="text-center position-relative">
                            <button className="btn btn-light" type="button" onClick={() => toggleDropdown(leave.employeeCode)}>
                              <FaEllipsisV />
                            </button>

                            {dropdownOpen[leave.employeeCode] && (
                              <div className="dropdown-menu show position-absolute">
                                <button className="dropdown-item" onClick={() => handleStatusChange(leave.employeeCode, 'Approved')}>
                                  Approved
                                </button>
                                <button className="dropdown-item" onClick={() => handleStatusChange(leave.employeeCode, 'Pending')}>
                                  Pending
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )} */}
          {mainTableData.length > 0 && (
            <div className="row mt-2">
              <div className="col-lg-12">
                <div className="d-flex justify-content-end mb-2">
                  {/* "Approve All" button */}
                  <button className="btn btn-success" onClick={handleApproveAll}>
                    Approve All
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="table table-bordered">
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
                      {mainTableData.map((leave, index) => (
                        <tr key={leave.employeeCode}>
                          <td className="text-center">{index + 1}</td>
                          <td className="text-center">{leave.employeeName}</td>
                          <td className="text-center">{leave.employeeCode}</td>
                          <td className="text-center">{leave.totalLeave}</td>
                          <td className="text-center">{leave.lopLeave}</td>
                          <td className="text-center">{leave.empTotalWorkingDays}</td>
                          <td className="text-center">{leave.totalCompanyWorkingDays}</td>
                          <td className="text-center">{employeeSalaries[leave.employeeCode] || 'Pending'}</td>
                          <td className="text-center">{employeeNetSalaries[leave.employeeCode] || 'Pending'}</td>
                          <td className="text-center position-relative">
                            <button className="btn btn-light" type="button" onClick={() => toggleDropdown(leave.employeeCode)}>
                              <FaEllipsisV />
                            </button>

                            {dropdownOpen[leave.employeeCode] && (
                              <div className="dropdown-menu show position-absolute">
                                <button className="dropdown-item" onClick={() => handleStatusChange(leave.employeeCode, 'Approved')}>
                                  Approved
                                </button>
                                <button className="dropdown-item" onClick={() => handleStatusChange(leave.employeeCode, 'Pending')}>
                                  Pending
                                </button>
                              </div>
                            )}
                            <div className="mt-2">{rowStatus[leave.employeeCode] || 'Pending'}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      </div>
      <ToastContainer />
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>Select Employees</DialogTitle>
        <DialogContent>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>
                  <FormControlLabel control={<Checkbox checked={selectAll} onChange={handleSelectAll} />} label="Select All" />
                </th>
                <th>Employee Name</th>
                <th>Employee Code</th>
                <th>Total Leave</th>
                <th>LOP (Loss of Pay)</th>
                <th>Total Employee Working Days</th>
                <th>Total Working Days</th>
                <th>Employee Salary</th>
                <th>Net Pay Salary</th>
              </tr>
            </thead>
            <tbody>
              {allSalary.map((leave) => (
                <tr key={leave.employeeCode}>
                  <td>
                    <Checkbox checked={selectedRows.includes(leave.employeeCode)} onChange={() => handleRowSelect(leave.employeeCode)} />
                  </td>
                  <td>{leave.employeeName}</td>
                  <td>{leave.employeeCode}</td>
                  <td>{leave.totalLeave}</td>
                  <td>{leave.lopLeave}</td>
                  <td>{leave.empTotalWorkingDays}</td>
                  <td>{leave.totalCompanyWorkingDays}</td>
                  <td>{employeeSalaries[leave.employeeCode] || 'Pending'}</td>
                  <td>{employeeNetSalaries[leave.employeeCode] || 'Pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmSelection} color="primary">
            Confirm Selection
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SalaryProcess;
