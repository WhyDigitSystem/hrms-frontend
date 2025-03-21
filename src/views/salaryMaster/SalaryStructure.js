import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import apiCalls from 'apicall';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';

const SalaryMaster = () => {
  const [listViewData, setListViewData] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId')));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchcode'));
  const [finYear, setFinYear] = useState(localStorage.getItem('finYear'));
  const [createdBy, setCreatedBy] = useState(localStorage.getItem('userName'));
  const [value, setValue] = useState(0);
  const [editId, setEditId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [empList, setEmpList] = useState([]);
  const [salaryHeadsType, setSalaryHeadsType] = useState([]);
  const [employeeSalary, setEmployeeSalary] = useState(0);

  const [formData, setFormData] = useState({
    employeeName: '',
    employeeCode: '',
    dob: '',
    grade: '',
    department: '',
    panNo: '',
    bankAccountNo: '',
    position: '',
    dateOfJoining: '',
    orgId: orgId
  });

  const [fieldErrors, setFieldErrors] = useState({
    employeeName: '',
    employeeCode: '',
    dob: '',
    grade: '',
    department: '',
    panNo: '',
    bankAccountNo: '',
    position: '',
    dateOfJoining: '',
    orgId: orgId
  });

  const listViewColumns = [
    { accessorKey: 'employeeName', header: 'Employee Name', size: 140 },
    { accessorKey: 'employeeCode', header: 'Employee Code', size: 140 },
    { accessorKey: 'dateOfBirth', header: 'DOB', size: 140 },
    { accessorKey: 'grade', header: 'Grade', size: 140 },
    { accessorKey: 'department', header: 'Department', size: 140 },
    { accessorKey: 'panNo', header: 'panNo', size: 140 },
    { accessorKey: 'bankAccountNo', header: 'Bank Account No', size: 140 },
    { accessorKey: 'designation', header: 'Position', size: 140 },
    { accessorKey: 'dateOfJoining', header: 'Date of Joining', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  const [earningDetailsData, setEarningDetailsData] = useState([{ id: 1, heading: '', amount: '' }]);
  const [earningDetailsDataErrors, setEarningDetailsDataErrors] = useState([
    {
      heading: '',
      amount: ''
    }
  ]);
  const [detectionDetailsData, setDetectionDetailsData] = useState([{ id: 1, detectionHeading: '', detectionAmount: '' }]);
  const [detectionDetailsDataErrors, setDetectionDetailsDataErrors] = useState([
    {
      detectionHeading: '',
      detectionAmount: ''
    }
  ]);

  useEffect(() => {
    // Calculate total earnings
    const totalEarnings = earningDetailsData.reduce((sum, row) => {
      return sum + (parseFloat(row.amount) || 0);
    }, 0);
  
    // Calculate total deductions
    const totalDeductions = detectionDetailsData.reduce((sum, row) => {
      return sum + (parseFloat(row.detectionAmount) || 0);
    }, 0);
  
    // Calculate net salary
    const netSalary = totalEarnings - totalDeductions;
  
    // Update employee salary
    setEmployeeSalary(netSalary);
  }, [earningDetailsData, detectionDetailsData]); // Runs when earningDetailsData or detectionDetailsData changes
  

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;

    // setFormData((prevFormData) => ({
    //   ...prevFormData,
    //   [name]: updatedValue,
    // }));

    let errorMessage = '';

    if (errorMessage) {
      setFieldErrors({ ...fieldErrors, [name]: errorMessage });
    } else {
      // Special cases for checkboxes and other inputs
      if (name === 'active' || name === 'allIndiaAccess') {
        setFormData({ ...formData, [name]: checked });
      } else {
        setFormData({ ...formData, [name]: value.toUpperCase() });
      }

      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const handleSelectChange = (e) => {
    const value = e.target.value;
    console.log('Selected employeeName value:', value);
    console.log('Full empList:', empList);

    const selectedEmp = empList.find((emp) => emp.employeeName === value);

    if (selectedEmp) {
      console.log('Selected Employee:', selectedEmp);
      setFormData((prevData) => ({
        ...prevData,
        employeeCode: selectedEmp.employeeCode,
        employeeName: selectedEmp.employeeName,
        dob: selectedEmp.dateOfBirth, // Mapping Date of Birth
        grade: selectedEmp.grade, // Mapping Grade
        department: selectedEmp.department, // Mapping Department
        panNo: selectedEmp.panNo, // Mapping PAN Number
        bankAccountNo: selectedEmp.accountNo, // Mapping Bank Account Number
        position: selectedEmp.designation, // Mapping Designation
        dateOfJoining: selectedEmp.joiningDate // Mapping Date of Joining
      }));
    } else {
      console.log('No employee found with the given name:', value);
    }
  };

  const handleDateChange = (name, date) => {
    if (date && dayjs(date).isValid()) {
      const dateString = dayjs(date).toISOString();
      setFormData({ ...formData, [name]: dateString });
      setFieldErrors({ ...fieldErrors, [name]: false });
    } else {
      setFormData({ ...formData, [name]: null });
    }

    if (formData.fromDate && formData.toDate) {
      const start = dayjs(formData.fromDate);
      const end = dayjs(formData.toDate);
      if (start.isAfter(end)) {
        setFieldErrors({ ...fieldErrors, toDate: true });
      } else {
        setFieldErrors({ ...fieldErrors, toDate: false });
      }
    }
  };

  useEffect(() => {
    getAllEmployeeList();
    getSalaryHeadsDetails();
    getAllSalaryStructure();
  }, []);

  const getAllSalaryStructure = async () => {
    try {
      const response = await apiCalls('get', `/employeemaster/getAllSalaryStructureByOrgId?orgId=${orgId}&branchCode=${branchCode}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.SalaryStructureVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllEmployeeList = async () => {
    try {
      const response = await apiCalls('get', `employeemaster/getAllEmployeeByActive?orgId=${orgId}&branchCode=${branchCode}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setEmpList(response.paramObjectsMap.employeeVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getSalaryHeadsDetails = async () => {
    try {
      const response = await apiCalls('get', `employeemaster/getAllSalaryHeadsByOrgId?orgId=${orgId}&branchCode=${branchCode}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setSalaryHeadsType(response.paramObjectsMap.salaryHeadsVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getSalaryStructureById = async (row) => {
    console.log('THE SELECTED EMPLOYEE ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `employeemaster/getSalaryStructureById?id=${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const particularSalaryStructure = response.paramObjectsMap.SalaryStructureVO;

        setFormData({
          employeeCode: particularSalaryStructure.employeeCode || '',
          employeeName: particularSalaryStructure.employeeName,
          dob: particularSalaryStructure.dateOfBirth,
          grade: particularSalaryStructure.grade,
          department: particularSalaryStructure.department,
          panNo: particularSalaryStructure.panNo,
          bankAccountNo: particularSalaryStructure.bankAccountNo,
          position: particularSalaryStructure.designation,
          dateOfJoining: particularSalaryStructure.dateOfJoining,
        });
        setEarningDetailsData(
          particularSalaryStructure.salaryEarningDetailsVO.map((role) => ({
            id: role.id,
            heading: role.heading,
            amount: role.amount
          }))
        );
        setDetectionDetailsData(
          particularSalaryStructure.salaryDetectionDetailsVO.map((role) => ({
            id: role.id,
            detectionHeading: role.heading,
            detectionAmount: role.amount
          }))
        );
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.employeeName) {
      errors.employeeName = 'Employee Name is required';
    }

    let earningDetailsDataValid = true;
    const newTableErrors = earningDetailsData.map((row) => {
      const rowErrors = {};
      if (!row.heading) {
        rowErrors.heading = 'Heading is required';
        earningDetailsDataValid = false;
      }
      if (!row.amount) {
        rowErrors.amount = 'Amount is required';
        earningDetailsDataValid = false;
      }

      return rowErrors;
    });
    setFieldErrors(errors);

    setEarningDetailsDataErrors(newTableErrors);

    let deductionDetailsDataValid = true;
    const newTableErrors1 = detectionDetailsData.map((row) => {
      const rowErrors = {};
      if (!row.detectionHeading) {
        rowErrors.detectionHeading = 'Heading is required';
        deductionDetailsDataValid = false;
      }
      if (!row.detectionAmount) {
        rowErrors.detectionAmount = 'Amount is required';
        deductionDetailsDataValid = false;
      }

      return rowErrors;
    });

    setDetectionDetailsDataErrors(newTableErrors1);

    if (Object.keys(errors).length === 0 && earningDetailsDataValid && deductionDetailsDataValid) {
      setIsLoading(true);

      const earningDetailsVO = earningDetailsData.map((row) => ({
        ...(editId && { id: row.id }),
        heading: row.heading,
        amount: row.amount
      }));
      const detectionDetailsVO = detectionDetailsData.map((row) => ({
        ...(editId && { id: row.id }),
        heading: row.detectionHeading,
        amount: row.detectionAmount
      }));

      const saveFormData = {
        ...(editId && { id: editId}),
        active: formData.active,
        bankAccountNo: formData.bankAccountNo,
        branch: branch,
        branchCode: branchCode,
        createdBy: createdBy,
        dateOfBirth: formData.dob,
        dateOfJoining: formData.dateOfJoining,
        department: formData.department,
        designation: formData.position,
        employeeCode: formData.employeeCode,
        employeeName: formData.employeeName,
        finYear: finYear,
        grade: formData.grade,
        orgId: orgId,
        panNo: formData.panNo,
        salaryDetectionDetailsDTO: detectionDetailsVO,
        salaryEarningDetailsDTO: earningDetailsVO,
      };
      console.log('DATA TO SAVE IS:', saveFormData);
      try {
        const response = await apiCalls('put', `employeemaster/createUpdateSalaryStructure`, saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? 'Salary Structure Updated Successfully' : 'Salary Structure created successfully');
          handleClear();
          getAllSalaryStructure();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Salary Structure creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Salary Structure creation failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleClear = () => {
    setFormData({
      employeeCode: '',
      employeeName: '',
      dob: '',
      grade: '',
      department: '',
      panNo: '',
      bankAccountNo: '',
      position: '',
      dateOfJoining: '',
      orgId: orgId
    });
    setFieldErrors({
      employeeCode: false,
      employeeName: false,
      grade: false,
      dob: false,
      department: false,
      bankAccountNo: false,
      position: false,
      panNo: false,
      dateOfJoining: false
    });
    setEarningDetailsData([{ id: 1, heading: '', amount: '' }]);
    setEarningDetailsDataErrors('');
    setDetectionDetailsData([{ id: 1, detectionHeading: '', detectionAmount: '' }]);
    setDetectionDetailsDataErrors('');
    setEditId('');
  };

  const handleKeyDown = (e, row, table) => {
    if (e.key === 'Tab' && row.id === table[table.length - 1].id) {
      e.preventDefault();
      if (isLastRowEmpty(table)) {
        displayRowError(table);
      }
    }
  };

  const handleAddRow = () => {
    if (isLastRowEmpty(earningDetailsData)) {
      displayRowError(earningDetailsData);
      return;
    }
    const newRow = {
      id: Date.now(),
      heading: '',
      amount: ''
    };
    setEarningDetailsData([...earningDetailsData, newRow]);
    setEarningDetailsDataErrors([...earningDetailsDataErrors, { heading: '', amount: '' }]);
  };

  const handleAddRow1 = () => {
    if (isLastRowEmpty(detectionDetailsData)) {
      displayRowError(detectionDetailsData);
      return;
    }
    const newRow = {
      id: Date.now(),
      detectionHeading: '',
      detectionAmount: ''
    };
    setDetectionDetailsData([...detectionDetailsData, newRow]);
    setDetectionDetailsDataErrors([...detectionDetailsDataErrors, { detectionHeading: '', detectionAmount: '' }]);
  };

  const isLastRowEmpty = (table) => {
    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === earningDetailsData) {
      return !lastRow.heading || !lastRow.amount;
    } else if (table === detectionDetailsData) {
      return !lastRow.detectionHeading || !lastRow.detectionAmount;
    }
    return false;
  };

  const displayRowError = (table) => {
    if (table === earningDetailsData) {
      setEarningDetailsDataErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[table.length - 1] = {
          ...newErrors[table.length - 1],
          heading: !table[table.length - 1].heading ? 'Heading is required' : '',
          amount: !table[table.length - 1].amount ? 'Amount is required' : ''
        };
        return newErrors;
      });
    }
    if (table === detectionDetailsData) {
      setDetectionDetailsDataErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[table.length - 1] = {
          ...newErrors[table.length - 1],
          detectionHeading: !table[table.length - 1].detectionHeading ? 'Heading is required' : '',
          detectionAmount: !table[table.length - 1].detectionAmount ? 'Amount is required' : ''
        };
        return newErrors;
      });
    }
  };

  const handleDeleteRow = (id, table, setTable, errorTable, setErrorTable) => {
    const rowIndex = table.findIndex((row) => row.id === id);
    // If the row exists, proceed to delete
    if (rowIndex !== -1) {
      const updatedData = table.filter((row) => row.id !== id);
      const updatedErrors = errorTable.filter((_, index) => index !== rowIndex);
      setTable(updatedData);
      setErrorTable(updatedErrors);
    }
  };

  const handleSalaryHeadChange = (row, index, event, type) => {
    const value = event.target.value;
    const selectedHead = salaryHeadsType.find((head) => head.heading === value);

    if (type === 'EARNING') {
      setEarningDetailsData((prev) => prev.map((r) => (r.id === row.id ? { ...r, heading: value, headId: selectedHead?.id || '' } : r)));

      setEarningDetailsDataErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = { ...newErrors[index], heading: !value ? 'Heading is required' : '' };
        return newErrors;
      });
    } else {
      setDetectionDetailsData((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, detectionHeading: value, headId: selectedHead?.id || '' } : r))
      );

      setDetectionDetailsDataErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = { ...newErrors[index], detectionHeading: !value ? 'Heading is required' : '' };
        return newErrors;
      });
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <div>
        <ToastComponent />
      </div>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} />
          </div>

          {!listView ? (
            <>
              <div className="row d-flex ml">
                <div className="col-md-3 mb-3">
                  <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.employeeName}>
                    <InputLabel id="employeeName-label">Employee Name</InputLabel>
                    <Select
                      labelId="employeeName-label"
                      label="Employee Name"
                      value={formData.employeeName}
                      onChange={handleSelectChange}
                      name="employeeName"
                    >
                      {empList.length > 0 &&
                        empList.map((emp, index) => (
                          <MenuItem key={index} value={emp.employeeName}>
                            {emp.employeeName} {/* Display employee code */}
                          </MenuItem>
                        ))}
                    </Select>
                    {fieldErrors.employeeName && <FormHelperText>{fieldErrors.employeeName}</FormHelperText>}
                  </FormControl>
                </div>

                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea-zip"
                    label="Employee Code"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="employeeCode"
                    value={formData.employeeCode}
                    onChange={handleInputChange}
                    disabled
                    inputProps={{ maxLength: 10 }}
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small" sx={{ minWidth: '120px' }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Date of Birth"
                        value={formData.dob ? dayjs(formData.dob) : null}
                        onChange={(date) => handleDateChange('dob', date)}
                        slotProps={{
                          textField: { size: 'small', clearable: true }
                        }}
                        format="DD-MM-YYYY"
                        error={fieldErrors.dob}
                        disabled
                      />
                    </LocalizationProvider>
                  </FormControl>
                </div>

                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea-zip"
                    label="Grade"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 40 }}
                    disabled
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea"
                    label="Department"
                    variant="outlined"
                    size="small"
                    name="department"
                    fullWidth
                    value={formData.department}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 15 }}
                    disabled
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea"
                    label="PanNo"
                    variant="outlined"
                    size="small"
                    name="panNo"
                    fullWidth
                    value={formData.panNo}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 15 }}
                    disabled
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea"
                    label="Bank Account No"
                    variant="outlined"
                    size="small"
                    name="bankAccountNo"
                    fullWidth
                    value={formData.bankAccountNo}
                    onChange={handleInputChange}
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.userName ? 'This field is required' : ''}</span>}
                    inputProps={{ maxLength: 15 }}
                    disabled
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea"
                    label="Position"
                    variant="outlined"
                    size="small"
                    name="position"
                    fullWidth
                    value={formData.position}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 15 }}
                    disabled
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small" sx={{ minWidth: '120px' }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Date of Joining"
                        value={formData.dateOfJoining ? dayjs(formData.dateOfJoining) : null}
                        onChange={(date) => handleDateChange('dateOfJoining', date)}
                        slotProps={{
                          textField: { size: 'small', clearable: true }
                        }}
                        format="DD-MM-YYYY"
                        error={fieldErrors.dateOfJoining}
                        disabled
                      />
                    </LocalizationProvider>
                  </FormControl>
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea"
                    label="Employee Salary"
                    variant="outlined"
                    size="small"
                    name="position"
                    fullWidth
                    value={employeeSalary}
                    inputProps={{ maxLength: 15 }}
                    disabled
                  />
                </div>
              </div>
              <div className="row mt-2">
                <Box sx={{ width: '100%' }}>
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    textColor="secondary"
                    indicatorColor="secondary"
                    aria-label="secondary tabs example"
                  >
                    <Tab value={0} label="Earning Details" />
                    <Tab value={1} label="Detection Details" />
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
                          <div className="col-lg-9">
                            <div className="table-responsive">
                              <table className="table table-bordered ">
                                <thead>
                                  <tr style={{ backgroundColor: '#673AB7' }}>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                                      Action
                                    </th>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                      S.No
                                    </th>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '250px' }}>
                                      Heading
                                    </th>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                                      Amount
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {earningDetailsData.map((row, index) => (
                                    <tr key={row.id}>
                                      <td className="border px-2 py-2 text-center">
                                        <ActionButton
                                          title="Delete"
                                          icon={DeleteIcon}
                                          onClick={() =>
                                            handleDeleteRow(
                                              row.id,
                                              earningDetailsData,
                                              setEarningDetailsData,
                                              earningDetailsDataErrors,
                                              setEarningDetailsDataErrors
                                            )
                                          }
                                        />
                                      </td>
                                      <td className="text-center">
                                        <div className="pt-2">{index + 1}</div>
                                      </td>
                                      <td className="border px-2 py-2">
                                        <select
                                          value={row.heading}
                                          onChange={(e) => handleSalaryHeadChange(row, index, e, 'EARNING')}
                                          className={earningDetailsDataErrors[index]?.heading ? 'error form-control' : 'form-control'}
                                        >
                                          <option value="">Select Option</option>
                                          {salaryHeadsType
                                            .filter((head) => head.type === 'EARNING')
                                            .map((head) => (
                                              <option key={head.id} value={head.heading}>
                                                {head.heading}
                                              </option>
                                            ))}
                                        </select>

                                        {earningDetailsDataErrors[index]?.heading && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {earningDetailsDataErrors[index].heading}
                                          </div>
                                        )}
                                      </td>
                                      <td>
                                        <input
                                          type="text"
                                          value={row.amount}
                                          onChange={(e) => {
                                            const amount = e.target.value;

                                            setEarningDetailsData((prev) => prev.map((r) => (r.id === row.id ? { ...r, amount } : r)));

                                            setEarningDetailsDataErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                amount: !amount ? 'Amount is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          }}
                                          className={earningDetailsDataErrors[index]?.amount ? 'error form-control' : 'form-control'}
                                          onKeyDown={(e) => handleKeyDown(e, row, earningDetailsData)}
                                        />
                                        {earningDetailsDataErrors[index]?.amount && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {earningDetailsDataErrors[index].amount}
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
                  {value === 1 && (
                    <>
                      <div className="row d-flex ml">
                        <div className="mb-1">
                          <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow1} />
                        </div>
                        <div className="row mt-2">
                          <div className="col-lg-9">
                            <div className="table-responsive">
                              <table className="table table-bordered ">
                                <thead>
                                  <tr style={{ backgroundColor: '#673AB7' }}>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                                      Action
                                    </th>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                      S.No
                                    </th>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '250px' }}>
                                      Heading
                                    </th>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                                      Amount111
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {detectionDetailsData.map((row, index) => (
                                    <tr key={row.id}>
                                      <td className="border px-2 py-2 text-center">
                                        <ActionButton
                                          title="Delete"
                                          icon={DeleteIcon}
                                          onClick={() =>
                                            handleDeleteRow(
                                              row.id,
                                              detectionDetailsData,
                                              setDetectionDetailsData,
                                              detectionDetailsDataErrors,
                                              setDetectionDetailsDataErrors
                                            )
                                          }
                                        />
                                      </td>
                                      <td className="text-center">
                                        <div className="pt-2">{index + 1}</div>
                                      </td>
                                      <td className="border px-2 py-2">
                                        <select
                                          value={row.detectionHeading}
                                          onChange={(e) => handleSalaryHeadChange(row, index, e, 'DEDUCTION')}
                                          className={
                                            detectionDetailsDataErrors[index]?.detectionHeading ? 'error form-control' : 'form-control'
                                          }
                                        >
                                          <option value="">Select Option</option>
                                          {salaryHeadsType
                                            .filter((head) => head.type === 'DEDUCTION')
                                            .map((head) => (
                                              <option key={head.id} value={head.heading}>
                                                {head.heading}
                                              </option>
                                            ))}
                                        </select>

                                        {detectionDetailsDataErrors[index]?.detectionHeading && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {detectionDetailsDataErrors[index].detectionHeading}
                                          </div>
                                        )}
                                      </td>
                                      <td>
                                        <input
                                          type="text"
                                          value={row.detectionAmount}
                                          onChange={(e) => {
                                            const detectionAmount = e.target.value;

                                            setDetectionDetailsData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, detectionAmount } : r))
                                            );

                                            setDetectionDetailsDataErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                detectionAmount: !detectionAmount ? 'Amount is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          }}
                                          className={
                                            detectionDetailsDataErrors[index]?.detectionAmount ? 'error form-control' : 'form-control'
                                          }
                                          onKeyDown={(e) => handleKeyDown(e, row, detectionDetailsData)}
                                        />
                                        {detectionDetailsDataErrors[index]?.detectionAmount && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {detectionDetailsDataErrors[index].detectionAmount}
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
            <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getSalaryStructureById} enableEditing={true} />
          )}
        </div>
      </div>
    </>
  );
};
export default SalaryMaster;
