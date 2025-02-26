import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Checkbox, FormControl, FormControlLabel, FormGroup, TextField, Autocomplete } from '@mui/material';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import ActionButton from 'utils/ActionButton';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { showToast } from 'utils/toast-component';
import { mobileModel } from 'react-device-detect';
import { useTheme } from '@mui/material/styles';
import { InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const EmployeeDetails = () => {
  const [showForm, setShowForm] = useState(true);
  const [data, setData] = useState([]);
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId'), 10));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [value, setValue] = useState(0);
  const [editId, setEditId] = useState();
  const [branchList, setBranchList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [allleaveType, setAllLeaveType] = useState([]);
  const [allReportingPerson, setAllReportingPerson] = useState([]);
  const theme = useTheme();
  const anchorRef = useRef(null);
  const [listViewData, setListViewData] = useState([]);
  const maxDate = dayjs().subtract(18, 'years');
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeCode: '',
    employeeAddress: '',
    branch: '',
    gender: '',
    email: '',
    dob: null,
    bloodGroup: '',
    mobileNo: '',
    alternativeMobile: '',
    aadhaarNo: '',
    panNo: '',
    accountNo: '',
    accountholderName: '',
    ifscCode: '',
    doj: null,
    resignationDate: '',
    grade: '',
    team: '',
    reportingPerson: '',
    reportingRole: '',
    department: '',
    designation: '',
    role: '',
    active: true,
    branchCode: ''
  });
  const [fieldErrors, setFieldErrors] = useState({
    employeeName: '',
    employeeCode: '',
    employeeAddress: '',
    branch: '',
    gender: '',
    email: '',
    dob: '',
    bloodGroup: '',
    mobileNo: '',
    alternativeMobile: '',
    aadhaarNo: '',
    panNo: '',
    accountNo: '',
    accountholderName: '',
    ifscCode: '',
    doj: '',
    resignationDate: '',
    grade: '',
    team: '',
    reportingPerson: '',
    reportingRole: '',
    department: '',
    designation: '',
    role: '',
    active: true,
    branchCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [leaveTypeTable, setLeaveTypeTable] = useState([
    {
      id: 1,
      leaveType: '',
      leaveCode: '',
      leaveApplicable: '',
      totalLeave: '',
      effective: '',
      carryforward: ''
    }
  ]);
  const [leaveTypeErrors, setLeaveTypeErrors] = useState([
    {
      leaveType: '',
      leaveCode: '',
      leaveApplicable: '',
      totalLeave: '',
      effective: '',
      carryforward: ''
    }
  ]);
  const columns = [
    { accessorKey: 'employeeName', header: 'Employee Name', size: 140 },
    { accessorKey: 'employeeCode', header: 'Employee Code', size: 140 },
    { accessorKey: 'branch', header: 'Branch', size: 140 },
    { accessorKey: 'joiningDate', header: 'Date of Join', size: 140 },
    { accessorKey: 'grade', header: 'Grade', size: 140 },
    { accessorKey: 'team', header: 'Team', size: 140 },
    { accessorKey: 'department', header: 'Department', size: 140 },
    { accessorKey: 'designation', header: 'Designation', size: 140 },
    { accessorKey: 'role', header: 'Role', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
    
  ];

  useEffect(() => {
    getAllListOfValuesByOrgId();
  }, []);
  useEffect(() => {
    getAllBranches();
    getAllEmployees();
    getAllDesignation();
    getAllDepartment();
    getAllRole();
    getAllLeaveType();
    getAllReportingPerson();
  }, []);
  const getAllBranches = async () => {
    try {
      const branchData = await getAllActiveBranches(orgId);
      setBranchList(branchData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };
  const getAllDesignation = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/getDesignationByOrgId?orgid=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setDesignationList(response.paramObjectsMap.designationVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const getAllDepartment = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/getDepartmentByOrgId?orgid=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setDepartmentList(response.paramObjectsMap.departmentVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const getAllRole = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/getRolesByOrgId?OrgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setRoleList(response.paramObjectsMap.rolesVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const getAllEmployees = async () => {
    try {
      const response = await apiCalls('get', `master/getAllEmployeeByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.employeeVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const getAllLeaveType = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/getLeaveTypeByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setAllLeaveType(response.paramObjectsMap.leaveTypeVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const getAllReportingPerson = async () => {
    try {
      const response = await apiCalls('get', `master/getReportingNameForEmployee?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setAllReportingPerson(response.paramObjectsMap.employeeVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleInputChange = (e) => {
    const { name, value, checked, type, selectionStart, selectionEnd } = e.target;
    const nameRegex = /^[A-Za-z ]*$/;
    const codeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;

    let errorMessage = '';

    if (name === 'employeeName' && !codeRegex.test(value)) {
      errorMessage = 'Invalid Format';
    } else if (name === 'employeeCode' && !codeRegex.test(value)) {
      errorMessage = 'Invalid Format';
    }

    if (errorMessage) {
      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }));
    } else {
      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));

      if (name === 'branch') {
        const selectedBranch = branchList.find((br) => br.branch === value);
        setFormData((prevData) => ({
          ...prevData,
          branch: value,
          branchCode: selectedBranch ? selectedBranch.branchCode : ''
        }));
      } else if (type === 'checkbox') {
        setFormData((prevData) => ({ ...prevData, [name]: checked }));
      } else {
        let inputValue = value;

        if (name === 'email') {
          inputValue = value.toLowerCase();
        } else if (type === 'text' || type === 'textarea') {
          inputValue = value.toUpperCase();
        }

        setFormData((prevData) => ({ ...prevData, [name]: inputValue }));

        // If reportingPerson is selected, map its role automatically.
        if (name === 'reportingPerson') {
          const selectedEmployee = allReportingPerson.find((emp) => emp.employeeName === value);
          setFormData((prevData) => ({
            ...prevData,
            reportingPerson: value,
            reportingRole: selectedEmployee ? selectedEmployee.role : ''
          }));
        }

        // Check if input type is text or textarea before calling setSelectionRange
        if (type === 'text' || type === 'textarea') {
          setTimeout(() => {
            const inputElement = document.getElementsByName(name)[0];
            if (inputElement && inputElement.setSelectionRange) {
              inputElement.setSelectionRange(selectionStart, selectionEnd);
            }
          }, 0);
        }
      }
    }
  };

  const handleAddRow = () => {
    if (isLastRowEmpty(leaveTypeTable)) {
      displayRowError(leaveTypeTable);
      return;
    }
    const newRow = {
      id: Date.now(),
      leaveType: '',
      leaveCode: '',
      leaveApplicable: '',
      totalLeave: '',
      effective: '',
      carryforward: ''
    };
    setLeaveTypeTable([...leaveTypeTable, newRow]);
    setLeaveTypeErrors([...leaveTypeErrors, { leaveCode: '', totalLeave: '', effective: '', carryforward: '' }]);
  };
  const isLastRowEmpty = (table) => {
    if (!table || table.length === 0) return false;

    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === leaveTypeTable) {
      return !lastRow.leaveCode || !lastRow.totalLeave || !lastRow.effective || !lastRow.carryforward;
    }
    return false;
  };

  const displayRowError = (table) => {
    if (table === leaveTypeTable) {
      setLeaveTypeErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[table.length - 1] = {
          ...newErrors[table.length - 1],
          leaveType: !table[table.length - 1].leaveType ? 'Leave Type is required' : '',
          leaveCode: !table[table.length - 1].leaveCode ? 'Leave Code is required' : '',
          leaveApplicable: !table[table.length - 1].leaveApplicable ? 'Leave Applicable is required' : '',
          totalLeave: !table[table.length - 1].totalLeave ? 'Total Leave is required' : '',
          effective: !table[table.length - 1].effective ? 'Effective is required' : '',
          carryforward: !table[table.length - 1].carryforward ? 'Carry Forward is required' : ''
        };
        return newErrors;
      });
    }
  };

  const handleDeleteRow = (id, table, setTable, errorTable, setErrorTable) => {
    const rowIndex = table.findIndex((row) => row.id === id);
    if (rowIndex !== -1) {
      const updatedData = table.filter((row) => row.id !== id);
      const updatedErrors = errorTable.filter((_, index) => index !== rowIndex);
      setTable(updatedData);
      setErrorTable(updatedErrors);
    }
  };

  const handleClear = () => {
    setFormData({
      employeeName: '',
      employeeCode: '',
      employeeAddress: '',
      branch: '',
      gender: '',
      email: '',
      dob: null,
      bloodGroup: '',
      mobileNo: '',
      alternativeMobile: '',
      aadhaarNo: '',
      panNo: '',
      accountNo: '',
      accountholderName: '',
      ifscCode: '',
      doj: null,
      resignationDate: '',
      grade: '',
      team: '',
      reportingPerson: '',
        reportingRole: '',
      department: '',
      designation: '',
      role: '',
      active: true,
      branchCode: ''
    });
    setFieldErrors({});
    setLeaveTypeTable([
      {
        id: 1,
        leaveType: '',
        leaveCode: '',
        leaveApplicable: '',
        totalLeave: '',
        effective: '',
        carryforward: ''
      }
    ]);
    setLeaveTypeErrors('');
    setEditId('');
  };
  const handleDateChange = (field, date) => {
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    setFormData((prevData) => ({ ...prevData, [field]: formattedDate }));
  };

  const handleSave = async () => {
    console.log('THE HANDLE SAVE IS WORKING');

    const errors = {};
    let detailsTableDataValid = true;

    if (!formData.employeeName) errors.employeeName = 'Employee Name is required';
    if (!formData.branch) errors.branch = 'Branch is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.dob) errors.dob = 'Date of Birth is required';
    if (!formData.mobileNo) errors.mobileNo = 'Mobile No is required';
    if (!formData.aadhaarNo) errors.aadhaarNo = 'Aadhaar Number is required';
    if (!formData.panNo) errors.panNo = 'Pan Number is required';
    if (!formData.accountNo) errors.accountNo = 'Account Number is required';
    if (!formData.accountholderName) errors.accountholderName = 'Accountholder Name is required';
    if (!formData.ifscCode) errors.ifscCode = 'IFSC Code is required';
    if (!formData.doj) errors.doj = 'Date of Join is required';
    if (!formData.grade) errors.grade = 'Grade is required';
    if (!formData.team) errors.team = 'Team is required';
    if (!formData.reportingPerson) errors.reportingPerson = 'Reporting Person is required';
    if (!formData.reportingRole) errors.reportingRole = 'Reporting Role is required';
    if (!formData.department) errors.department = 'Department is required';
    if (!formData.designation) errors.designation = 'Designation is required';

    if (!leaveTypeTable || !Array.isArray(leaveTypeTable) || leaveTypeTable.length === 0) {
      detailsTableDataValid = false;
      setLeaveTypeErrors([{ general: 'Leave Type Table Data is required' }]);
    } else {
      const newTableErrors = leaveTypeTable.map((row, index) => {
        const rowErrors = {};
        if (!row.leaveType) {
          rowErrors.leaveType = 'Leave Type is required';
          detailsTableDataValid = false;
        }
        if (!row.leaveCode) {
          rowErrors.leaveCode = 'Leave Code is required';
          detailsTableDataValid = false;
        }
        if (!row.leaveApplicable) {
          rowErrors.leaveApplicable = 'Leave Applicable is required';
          detailsTableDataValid = false;
        }
        if (!row.totalLeave) {
          rowErrors.totalLeave = 'Total Leave is required';
          detailsTableDataValid = false;
        }
        if (!row.effective) {
          rowErrors.effective = 'Effective is required';
          detailsTableDataValid = false;
        }
        if (!row.carryforward) {
          rowErrors.carryforward = 'Carry Forward is required';
          detailsTableDataValid = false;
        }
        return rowErrors;
      });
      setLeaveTypeErrors(newTableErrors);
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length === 0 && detailsTableDataValid) {
      setIsLoading(true);

      const detailsVo = leaveTypeTable.map((row) => ({
        ...(editId && { id: row.id }),
        carryForward: row.carryforward,
        effective: row.effective,
        leaveApplicable: row.leaveApplicable,
        leaveCode: row.leaveCode,
        leaveType: row.leaveType,
        totalLeave: parseInt(row.totalLeave)
      }));

      const selectedBranch = branchList.find((br) => br.branch === formData.branch);
      const branchCode = selectedBranch ? selectedBranch.branchCode : '';

      const saveFormData = {
        ...(editId && { id: editId }),
        aadharNo: parseInt(formData.aadhaarNo),
        accountHolderName: formData.accountholderName,
        accountNo: parseInt(formData.accountNo),
        active: formData.active,
        alternativeMobileNo: parseInt(formData.alternativeMobile),
        bloodGroup: formData.bloodGroup,
        branch: formData.branch,
        branchCode: branchCode,
        cancel: true,
        cancelRemark: null,
        createdBy: loginUserName,
        dateOfBirth: formData.dob,
        department: formData.department,
        designation: formData.designation,
        email: formData.email,
        employeeAddress: formData.employeeAddress,
        employeeCode: formData.employeeCode,
        employeeLeaveDTO: detailsVo,
        employeeName: formData.employeeName,
        gender: formData.gender,
        grade: formData.grade,
        ifscCode: formData.ifscCode,
        joiningDate: formData.doj,
        mobileNo: parseInt(formData.mobileNo),
        orgId: orgId,
        panNo: formData.panNo,
        reportingPerson: formData.reportingPerson,
        reportingRole: formData.reportingRole,
        resignDate: formData.resignationDate,
        role: formData.role,
        team: formData.team,
        updatedBy: loginUserName
      };

      console.log('DATA TO SAVE IS:', saveFormData);
      try {
        const response = await apiCalls('put', '/master/createUpdateEmployee', saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? 'Employee Details updated successfully' : 'Employee Details created successfully');
          getAllListOfValuesByOrgId();
          handleClear();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Employee Details creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Employee Details creation failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const getAllListOfValuesByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/master/getListOfValuesByOrgId?orgId=${orgId}`);
      setData(result.paramObjectsMap.listOfValuesVO.reverse() || []);
      showForm(true);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getEmployeeDetailsById = async (row) => {
    console.log('first', row);
    setShowForm(true);
    try {
      const result = await apiCalls('get', `/master/employee/${row.original.id}`);

      if (result) {
        const employeeDetailsVO = result.paramObjectsMap.Employee;
        setEditId(row.original.id);

        setFormData({
          employeeName: employeeDetailsVO.employeeName || '',
          employeeCode: employeeDetailsVO.employeeCode || '',
          employeeAddress: employeeDetailsVO.employeeAddress || '',
          branch: employeeDetailsVO.branch || '',
          gender: employeeDetailsVO.gender || '',
          email: employeeDetailsVO.email || '',
          doj: employeeDetailsVO.joiningDate || '',
          resignationDate: employeeDetailsVO.resignDate || '',
          grade: employeeDetailsVO.grade || '',
          team: employeeDetailsVO.team || '',
          department: employeeDetailsVO.department || '',
          designation: employeeDetailsVO.designation || '',
          role: employeeDetailsVO.role || '',
          reportingPerson: employeeDetailsVO.reportnigPerson || '',
          reportingRole: employeeDetailsVO.reportingRole || '',
          dob: employeeDetailsVO.dateOfBirth || '',
          bloodGroup: employeeDetailsVO.bloodGroup || '',
          mobileNo: employeeDetailsVO.mobileNo || '',
          alternativeMobile: employeeDetailsVO.alternativeMobileNo || '',
          aadhaarNo: employeeDetailsVO.aadharNo || '',
          panNo: employeeDetailsVO.panNo || '',
          accountNo: employeeDetailsVO.accountNo || '',
          accountholderName: employeeDetailsVO.accountHolderName || '',
          ifscCode: employeeDetailsVO.ifscCode || '',
          active: employeeDetailsVO.active === 'Active' ? true : false,
          id: employeeDetailsVO.id || 0
        });
        setLeaveTypeTable(
          employeeDetailsVO.employeeLeaveVO.map((cl) => ({
            id: cl.id,
            leaveType: cl.leaveType,
            leaveCode: cl.leaveCode,
            leaveApplicable: cl.leaveApplicable,
            totalLeave: cl.totalLeave,
            effective: cl.effective,
            carryforward: cl.carryForward
          }))
        );

        console.log('DataToEdit', employeeDetailsVO);
      } else {
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleList = () => {
    setShowForm(!showForm);
  };
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div>
      <ToastContainer />
      <div className="card w-full p-6 bg-base-100 shadow-xl mb-3" style={{ padding: '20px' }}>
        <div className="d-flex flex-wrap justify-content-start mb-4">
          {/* <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} /> */}
          <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleList} />
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} isLoading={isLoading} margin="0 10px 0 10px" />
        </div>
        {showForm ? (
          <>
            <div className="row">
              <h5 className="mb-4">Employee Details</h5>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Employee Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="employeeName"
                  value={formData.employeeName}
                  onChange={handleInputChange}
                  error={!!fieldErrors.employeeName}
                  helperText={fieldErrors.employeeName}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Employee Code"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="employeeCode"
                  value={formData.employeeCode}
                  onChange={handleInputChange}
                  error={!!fieldErrors.employeeCode}
                  helperText={fieldErrors.employeeCode}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Employee Address"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="employeeAddress"
                  value={formData.employeeAddress}
                  onChange={handleInputChange}
                  error={!!fieldErrors.employeeAddress}
                  helperText={fieldErrors.employeeAddress}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.branch}>
                  <InputLabel id="branch-label">Branch</InputLabel>
                  <Select labelId="branch-label" label="Branch" value={formData.branch} onChange={handleInputChange} name="branch">
                    {branchList?.map((row) => (
                      <MenuItem key={row.id} value={row.branch}>
                        {row.branch}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.branch && <FormHelperText>{fieldErrors.branch}</FormHelperText>}
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.gender}>
                  <InputLabel id="gender-label">Gender</InputLabel>
                  <Select labelId="gender-label" label="Gender" value={formData.gender} onChange={handleInputChange} name="gender">
                    <MenuItem value="MALE">MALE</MenuItem>
                    <MenuItem value="FEMALE">FEMALE</MenuItem>
                  </Select>
                  {fieldErrors.gender && <FormHelperText>{fieldErrors.gender}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Email"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled" size="small">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date of Join"
                      value={formData.doj ? dayjs(formData.doj, 'YYYY-MM-DD') : null}
                      onChange={(date) => handleDateChange('doj', date)}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD-MM-YYYY"
                      error={fieldErrors.doj}
                      helperText={fieldErrors.doj && 'Required'}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              {editId && (
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Resignation Date"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="resignationDate"
                    value={formData.resignationDate}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.grade}>
                  <InputLabel id="grade-label">Grade</InputLabel>
                  <Select labelId="grade-label" label="Grade" value={formData.grade} onChange={handleInputChange} name="grade">
                    <MenuItem value="A GRADE">A GRADE</MenuItem>
                    <MenuItem value="B GRADE">B GRADE</MenuItem>
                    <MenuItem value="C GRADE">C GRADE</MenuItem>
                    <MenuItem value="D GRADE">D GRADE</MenuItem>
                  </Select>
                  {fieldErrors.grade && <FormHelperText>{fieldErrors.grade}</FormHelperText>}
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <TextField
                  label="Team"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="team"
                  value={formData.team}
                  onChange={handleInputChange}
                  error={!!fieldErrors.team}
                  helperText={fieldErrors.team}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.department}>
                  <InputLabel id="department-label">Department</InputLabel>
                  <Select
                    labelId="department-label"
                    id="department"
                    label="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    name="department"
                    // disabled={isEditMode}
                  >
                    {departmentList?.map((row) => (
                      <MenuItem key={row.id} value={row.departmentName}>
                        {row.departmentName}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.department && <FormHelperText>{fieldErrors.department}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.designation}>
                  <InputLabel id="designation-label">Designation</InputLabel>
                  <Select
                    labelId="designation-label"
                    id="designation"
                    label="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    name="designation"
                    // disabled={isEditMode}
                  >
                    {designationList?.map((row) => (
                      <MenuItem key={row.id} value={row.designationName}>
                        {row.designationName}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.designation && <FormHelperText>{fieldErrors.designation}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.role}>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role"
                    label="Role"
                    value={formData.role}
                    onChange={handleInputChange}
                    name="role"
                    // disabled={isEditMode}
                  >
                    {roleList?.map((row) => (
                      <MenuItem key={row.id} value={row.role}>
                        {row.role}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.role && <FormHelperText>{fieldErrors.role}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.reportingPerson}>
                  <InputLabel id="reportingPerson-label">Reporting Person</InputLabel>
                  <Select
                    labelId="reportingPerson-label"
                    label="Reporting Person"
                    value={formData.reportingPerson}
                    onChange={handleInputChange}
                    name="reportingPerson"
                  >
                    {allReportingPerson?.map((row) => (
                      <MenuItem key={row.id} value={row.employeeName}>
                        {row.employeeName}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.reportingPerson && <FormHelperText>{fieldErrors.reportingPerson}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Reporting Role"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="reportingRole"
                  value={formData.reportingRole}
                  onChange={handleInputChange}
                  error={!!fieldErrors.reportingRole}
                  helperText={fieldErrors.reportingRole}
                />
              </div>
              <h5 className="mb-4 mt-2">Personal Details</h5>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled" size="small">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date of Birth"
                      value={formData.dob ? dayjs(formData.dob, 'YYYY-MM-DD') : null}
                      onChange={(date) => handleDateChange('dob', date)}
                      maxDate={maxDate}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD-MM-YYYY"
                      error={fieldErrors.dob}
                      helperText={fieldErrors.dob && 'Required'}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Blood Group"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  error={!!fieldErrors.bloodGroup}
                  helperText={fieldErrors.bloodGroup}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Mobile No"
                  variant="outlined"
                  size="small"
                  type="number"
                  fullWidth
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleInputChange}
                  error={!!fieldErrors.mobileNo}
                  helperText={fieldErrors.mobileNo}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Alternative Mobile No"
                  variant="outlined"
                  size="small"
                  type="number"
                  fullWidth
                  name="alternativeMobile"
                  value={formData.alternativeMobile}
                  onChange={handleInputChange}
                  error={!!fieldErrors.alternativeMobile}
                  helperText={fieldErrors.alternativeMobile}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Aadhaar Number"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="aadhaarNo"
                  value={formData.aadhaarNo}
                  onChange={handleInputChange}
                  error={!!fieldErrors.aadhaarNo}
                  helperText={fieldErrors.aadhaarNo}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Pan Number"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="panNo"
                  value={formData.panNo}
                  onChange={handleInputChange}
                  error={!!fieldErrors.panNo}
                  helperText={fieldErrors.panNo}
                />
              </div>
              <h5 className="mb-4 mt-2">Bank Details</h5>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Account Number"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="accountNo"
                  value={formData.accountNo}
                  onChange={handleInputChange}
                  error={!!fieldErrors.accountNo}
                  helperText={fieldErrors.accountNo}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="AccountHolder Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="accountholderName"
                  value={formData.accountholderName}
                  onChange={handleInputChange}
                  error={!!fieldErrors.accountholderName}
                  helperText={fieldErrors.accountholderName}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="IFSC Code"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  error={!!fieldErrors.ifscCode}
                  helperText={fieldErrors.ifscCode}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControlLabel
                  control={<Checkbox checked={formData.active} onChange={handleInputChange} name="active" />}
                  label="Active"
                />
              </div>
            </div>
            {/* <TableComponent formData={formData} setFormData={setFormData} /> */}
            <div className="row mt-2">
              <Box sx={{ width: '100%' }}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  textColor="secondary"
                  indicatorColor="secondary"
                  aria-label="secondary tabs example"
                >
                  <Tab value={0} label="Leave" />
                </Tabs>
              </Box>
              <Box sx={{ padding: 2 }}>
                {value === 0 && (
                  <>
                    <div className="row d-flex ml">
                      <div className="mb-1">
                        <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow} />
                      </div>
                      <div className="row mt-2">
                        <div className="col-lg-12">
                          <div className="table-responsive">
                            <table className="table table-bordered ">
                              <thead>
                                <tr style={{ backgroundColor: '#673AB7' }}>
                                  {!editId ? (
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                                      Action
                                    </th>
                                  ) : (
                                    ''
                                  )}
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                    S.No
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '150px' }}>
                                    Leave Type
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '150px' }}>
                                    Leave Code
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '150px' }}>
                                    Leave Applicable
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                                    Total Leave
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                                    Effective
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                                    Carry Forward
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {leaveTypeTable.map((row, index) => (
                                  <tr key={row.id}>
                                    {!editId ? (
                                      <td className="border px-2 py-2 text-center">
                                        <ActionButton
                                          title="Delete"
                                          icon={DeleteIcon}
                                          onClick={() =>
                                            handleDeleteRow(row.id, leaveTypeTable, setLeaveTypeTable, leaveTypeErrors, setLeaveTypeErrors)
                                          }
                                        />
                                      </td>
                                    ) : (
                                      ''
                                    )}
                                    <td className="text-center">
                                      <div className="pt-2">{index + 1}</div>
                                    </td>
                                    <Autocomplete
                                      options={allleaveType}
                                      getOptionLabel={(option) => option.leaveType || ''}
                                      groupBy={(option) => (option.leaveType ? option.leaveType : '')}
                                      value={row.leaveType ? allleaveType.find((a) => a.leaveType === row.leaveType) : null}
                                      onChange={(event, newValue) => {
                                        setLeaveTypeTable((prev) =>
                                          prev.map((r) =>
                                            r.id === row.id
                                              ? {
                                                  ...r,
                                                  leaveType: newValue ? newValue.leaveType : '',
                                                  leaveCode: newValue ? newValue.leaveCode : '',
                                                  leaveApplicable: newValue ? newValue.leaveApplicable : '',
                                                  totalLeave: newValue ? newValue.totalLeave : '',
                                                  effective: newValue ? newValue.effective : '',
                                                  carryforward: newValue ? newValue.carryForward : ''
                                                }
                                              : r
                                          )
                                        );

                                        setLeaveTypeErrors((prevErrors) =>
                                          prevErrors.map((err, idx) =>
                                            idx === index
                                              ? {
                                                  ...err,
                                                  leaveType: '',
                                                  leaveCode: '',
                                                  leaveApplicable: '',
                                                  totalLeave: '',
                                                  effective: '',
                                                  carryforward: ''
                                                }
                                              : err
                                          )
                                        );
                                      }}
                                      size="small"
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          label="Leave Type"
                                          variant="outlined"
                                          error={!!leaveTypeErrors[index]?.leaveType}
                                          helperText={leaveTypeErrors[index]?.leaveType}
                                        />
                                      )}
                                      sx={{ width: 250 }}
                                    />

                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.leaveCode}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setLeaveTypeTable((prev) => prev.map((r) => (r.id === row.id ? { ...r, leaveCode: value } : r)));
                                          setLeaveTypeErrors((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = {
                                              ...newErrors[index],
                                              leaveCode: !value ? 'Leave Code is required' : ''
                                            };
                                            return newErrors;
                                          });
                                        }}
                                        className={leaveTypeErrors[index]?.leaveCode ? 'error form-control' : 'form-control'}
                                      />
                                      {leaveTypeErrors[index]?.leaveCode && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {leaveTypeErrors[index].leaveCode}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.leaveApplicable}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setLeaveTypeTable((prev) =>
                                            prev.map((r) => (r.id === row.id ? { ...r, leaveApplicable: value } : r))
                                          );
                                          setLeaveTypeErrors((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = {
                                              ...newErrors[index],
                                              leaveApplicable: !value ? 'Leave Applicable is required' : ''
                                            };
                                            return newErrors;
                                          });
                                        }}
                                        className={leaveTypeErrors[index]?.leaveApplicable ? 'error form-control' : 'form-control'}
                                      />
                                      {leaveTypeErrors[index]?.leaveApplicable && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {leaveTypeErrors[index].leaveApplicable}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.totalLeave}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setLeaveTypeTable((prev) => prev.map((r) => (r.id === row.id ? { ...r, totalLeave: value } : r)));
                                          setLeaveTypeErrors((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = {
                                              ...newErrors[index],
                                              totalLeave: !value ? 'No Of Days is required' : ''
                                            };
                                            return newErrors;
                                          });
                                        }}
                                        className={leaveTypeErrors[index]?.totalLeave ? 'error form-control' : 'form-control'}
                                      />
                                      {leaveTypeErrors[index]?.totalLeave && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {leaveTypeErrors[index].totalLeave}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.effective}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setLeaveTypeTable((prev) => prev.map((r) => (r.id === row.id ? { ...r, effective: value } : r)));
                                          setLeaveTypeErrors((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = {
                                              ...newErrors[index],
                                              effective: !value ? 'Effective is required' : ''
                                            };
                                            return newErrors;
                                          });
                                        }}
                                        className={leaveTypeErrors[index]?.effective ? 'error form-control' : 'form-control'}
                                      />
                                      {leaveTypeErrors[index]?.effective && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {leaveTypeErrors[index].effective}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.carryforward}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setLeaveTypeTable((prev) =>
                                            prev.map((r) => (r.id === row.id ? { ...r, carryforward: value } : r))
                                          );
                                          setLeaveTypeErrors((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = {
                                              ...newErrors[index],
                                              carryforward: !value ? 'Carry forward is required' : ''
                                            };
                                            return newErrors;
                                          });
                                        }}
                                        className={leaveTypeErrors[index]?.carryforward ? 'error form-control' : 'form-control'}
                                      />
                                      {leaveTypeErrors[index]?.carryforward && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {leaveTypeErrors[index].carryforward}
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
                    </div>
                  </>
                )}
              </Box>
            </div>
          </>
        ) : (
          <CommonListViewTable data={listViewData} columns={columns} blockEdit={true} toEdit={getEmployeeDetailsById} />
        )}
      </div>
    </div>
  );
};

export default EmployeeDetails;
