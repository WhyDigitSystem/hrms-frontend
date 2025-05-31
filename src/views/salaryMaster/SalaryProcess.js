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
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormHelperText, Checkbox } from '@mui/material';
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

  // const handleMonthChange = (event) => {
  //   const selected = months.find((m) => m.name === event.target.value);
  //   setSelectedMonth(selected?.name || ''); // Set name for UI
  //   setFormData({ ...formData, month: selected?.value || '' }); // Set numeric value for API
  // };

  // const handleYearChange = (event) => {
  //   setFormData({ ...formData, year: event.target.value });
  // };

  const handleMonthChange = (event) => {
    const selected = months.find((m) => m.name === event.target.value);
    setSelectedMonth(selected?.name || ''); // For display
    setFormData((prev) => ({ ...prev, month: selected?.value || '' })); // For API
    setFieldErrors((prev) => ({ ...prev, month: '' })); // Clear month error
  };

  const handleYearChange = (event) => {
    const selectedYear = event.target.value;
    setFormData((prev) => ({ ...prev, year: selectedYear }));
    setFieldErrors((prev) => ({ ...prev, year: '' })); // Clear year error
  };

  const getAllSalaryProcess = async () => {
    try {
      const response = await apiCalls(
        'get',
        `employeemaster/getLeaveDetailsforSalaryProcess?month=${formData.month}&orgId=${orgId}&year=${formData.year}`
      );

      setShowSelectedMonthYear(true);

      if (response.status === true && Array.isArray(response.paramObjectsMap.salaryProcessVO)) {
        const salaryData = response.paramObjectsMap.salaryProcessVO.map((employee) => ({
          ...employee,
          totalLeave: parseFloat(employee.totalLeave).toString(),
          totalCompanyWorkingDays: parseFloat(employee.totalCompanyWorkingDays).toString(),
          lopLeave: parseFloat(employee.lopLeave).toString(),
          empSalaryDays: parseFloat(employee.empSalaryDays).toString(),
          empTotalWorkingDays: parseFloat(employee.empTotalWorkingDays).toString()
        }));

        setAllSalary(salaryData);

        fetchGrossNetSalaries(salaryData);
        setDialogOpen(true);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching leave data:', error);
    }
  };

  const handleGetSalaryProcess = () => {
    const errors = {};

    if (!selectedMonth) {
      errors.month = 'Month is required';
    }

    if (!formData.year) {
      errors.year = 'Year is required';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      getAllSalaryProcess();
    }
  };

  const fetchGrossNetSalaries = async (salaryData) => {
    try {
      const updatedData = await Promise.all(
        salaryData.map(async (employee) => {
          const salaryDetails = await getAllEmployeeGrossNetSalary(employee.employeeCode);

          const grossPay = salaryDetails?.sumOfEarningAmount || 'Pending';
          const netPay = salaryDetails?.netPay || 'Pending';
          const sumOfDetection = salaryDetails?.sumOfDetectionAmount || 'Pending';

          const payOnHandData = await getPayonHandsSalary(
            employee.empSalaryDays,
            grossPay,
            sumOfDetection,
            employee.totalCompanyWorkingDays
          );

          const payOnHand = payOnHandData?.[0]?.payOnHand || 'Pending';
          console.log('pay', payOnHand);

          return {
            ...employee,
            grossPay,
            netPay,
            sumOfDetection,
            payOnHand
          };
        })
      );

      setAllSalary(updatedData);
    } catch (error) {
      console.error('Error building full salary data:', error);
    }
  };

  const getAllEmployeeGrossNetSalary = async (employeeCode) => {
    try {
      const response = await apiCalls(
        'get',
        `/employeemaster/getSalaryStructureForSalaryProcess?employeeCode=${employeeCode}&orgId=${orgId}`
      );

      if (response.status === true && Array.isArray(response.paramObjectsMap.salaryProcessVO)) {
        return response.paramObjectsMap.salaryProcessVO[0];
      } else {
        console.warn(`No salary data found for ${employeeCode}`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching salary for ${employeeCode}:`, error);
      return null;
    }
  };

  const getPayonHandsSalary = async (empSalaryDays, grossPay, sumOfDetection, totalCompanyWorkingDays) => {
    try {
      const response = await apiCalls(
        'get',
        `employeemaster/getPayOnHandsForSalaryProcess?empSalaryDays=${empSalaryDays}&grossPay=${grossPay}&sumOfDetection=${sumOfDetection}&totalCompanyWorkingDays=${totalCompanyWorkingDays}`
      );
      console.log('Pay On Hand API Response:', response);

      if (response.status === true && response.paramObjectsMap.salaryProcessVO) {
        return response.paramObjectsMap.salaryProcessVO;
      } else {
        console.error('API Error:', response);
        return null;
      }
    } catch (error) {
      console.error('Error fetching pay on hand:', error);
      return null;
    }
  };

  const handleSave = async () => {
    const errors = {};

    if (!formData.month) {
      errors.month = 'Month is required';
    }
    if (!formData.year) {
      errors.year = 'Year is required';
    }

    if (mainTableData.length === 0) {
      errors.table = 'No data available in the table. Please add employees before saving.';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);

      try {
        // ✅ Build payload from `allSalary`, which already has grossPay, netPay, etc.
        const saveDataArray = allSalary.map((employee) => ({
          approvedStatus: rowStatus[employee.employeeCode] || 'Pending',
          branch: branch,
          branchCode: branchCode,
          createdBy: loginUserName,
          empSalaryDays: parseInt(employee.empSalaryDays) || 0,
          empTotalWorkingDays: parseInt(employee.empTotalWorkingDays) || 0,
          employeeCode: employee.employeeCode,
          employeeName: employee.employeeName,
          grossPay: parseFloat(employee.grossPay) || 0,
          lopLeave: parseInt(employee.lopLeave) || 0,
          netPay: parseFloat(employee.netPay) || 0,
          // payOnHand: parseFloat(employee.payOnHand) || 0,
          totalCompanyWorkingDays: parseInt(employee.totalCompanyWorkingDays) || 0,
          totalLeave: parseInt(employee.totalLeave) || 0,
          orgId: parseInt(orgId),
          month: parseInt(formData.month),
          year: formData.year
        }));

        console.log('Saving Employee Data:', saveDataArray);

        const response = await apiCalls('put', '/employeemaster/createUpdateSalaryProcess', saveDataArray);

        if (response.status === true) {
          // const successMsg =
          //   response.paramObjectsMap?.message ||
          //   response.paramObjectsMap?.salaryProcessVO?.message ||
          //   'Salary Process created successfully';

          // showToast(successMsg);
          showToast('success', ' Salary Process created successfully');
          handleCancel();
        } else {
          const errorMsg = response.paramObjectsMap?.errorMessage || 'Salary Process creation failed';
          showToast('error', errorMsg);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Salary Process creation failed');
      } finally {
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
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
    setDialogOpen(false);
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

  const handleDialogClose = () => {
    setDialogOpen(false);
    setShowSelectedMonthYear(false);
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={handleGetSalaryProcess} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleCancel} />
            {/* <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} /> */}
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px 0 10px" />
          </div>

          <div className="col-md-3 mb-3">
            <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.month}>
              <InputLabel>Select Month</InputLabel>
              <Select label="Select Month" value={selectedMonth} onChange={handleMonthChange}>
                {months.map((m) => (
                  <MenuItem key={m.value} value={m.name}>
                    {m.name}
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.month && <FormHelperText>{fieldErrors.month}</FormHelperText>}
            </FormControl>
          </div>

          <div className="col-md-3 mb-3">
            <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.year}>
              <InputLabel>Select Year</InputLabel>
              <Select label="Select Year" value={formData.year} onChange={handleYearChange}>
                {years.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.year && <FormHelperText>{fieldErrors.year}</FormHelperText>}
            </FormControl>
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
          <div className="row mt-2">
            <div className="col-lg-12">
              <div className="d-flex justify-content-end mb-2">
                {/* "Approve All" button */}
                <button className="btn btn-success-Approve" onClick={handleApproveAll}>
                  Approve All
                </button>
              </div>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr style={{ background: 'linear-gradient(193deg, #3a6b6d 30%, #2a4b4d 90%, #2a4b4d 90%)', color: 'white' }}>
                      <th className="px-2 py-2 text-white text-center">S.No</th>
                      <th className="px-2 py-2 text-white text-center">Code</th>
                      <th className="px-2 py-2 text-white text-center">Employee</th>
                      <th className="px-2 py-2 text-white text-center">Total Leave</th>
                      <th className="px-2 py-2 text-white text-center">LOP</th>
                      <th className="px-2 py-2 text-white text-center">Working Days</th>
                      <th className="px-2 py-2 text-white text-center">Total Working Days</th>
                      <th className="px-2 py-2 text-white text-center">Gross Salary</th>
                      <th className="px-2 py-2 text-white text-center">Net Pay Salary</th>
                      <th className="px-2 py-2 text-white text-center">Pay On Hand</th>
                      <th className="px-2 py-2 text-white text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mainTableData.length > 0 ? (
                      mainTableData.map((leave, index) => (
                        <tr key={leave.employeeCode}>
                          <td className="text-center">{index + 1}</td>
                          <td className="text-center">{leave.employeeCode}</td>
                          <td className="text-center">{leave.employeeName}</td>
                          <td className="text-center">{leave.totalLeave}</td>
                          <td className="text-center">{leave.lopLeave}</td>
                          <td className="text-center">{leave.empTotalWorkingDays}</td>
                          <td className="text-center">{leave.totalCompanyWorkingDays}</td>
                          <td>{leave.grossPay || 'Pending'}</td>
                          <td>{leave.netPay || 'Pending'}</td>
                          <td>{leave.payOnHand || 'Pending'}</td>

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
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="text-center text-danger">
                          {fieldErrors.table || ''}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <ToastContainer />
        </>
      </div>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>Select Employees</DialogTitle>
        <DialogContent>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>
                  <FormControlLabel control={<Checkbox checked={selectAll} onChange={handleSelectAll} />} label="Select All" />
                </th>
                <th>Code</th>
                <th>Employee</th>
                <th>Total Leave</th>
                <th>LOP</th>
                <th>Working Days</th>
                <th>Total Working Days</th>
                <th>Gross Salary</th>
                <th>Net Pay Salary</th>
                <th>Pay On Hand</th>
              </tr>
            </thead>
            <tbody>
              {allSalary.map((leave) => (
                <tr key={leave.employeeCode}>
                  <td>
                    <Checkbox checked={selectedRows.includes(leave.employeeCode)} onChange={() => handleRowSelect(leave.employeeCode)} />
                  </td>
                  <td>{leave.employeeCode}</td>
                  <td>{leave.employeeName}</td>
                  <td>{leave.totalLeave}</td>
                  <td>{leave.lopLeave}</td>
                  <td>{leave.empTotalWorkingDays}</td>
                  <td>{leave.totalCompanyWorkingDays}</td>
                  <td>{leave.grossPay || 'Pending'}</td>
                  <td>{leave.netPay || 'Pending'}</td>
                  <td>{leave.payOnHand || 'Pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
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
