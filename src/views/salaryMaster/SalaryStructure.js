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
import { useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';

const SalaryMaster = () => {
  const [listViewData, setListViewData] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId')));
  const [value, setValue] = useState(0);
  const [editId, setEditId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [empList, setEmpList] = useState([]);

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
    { accessorKey: 'dob', header: 'DOB', size: 140 },
    { accessorKey: 'grade', header: 'Grade', size: 140 },
    { accessorKey: 'department', header: 'Department', size: 140 },
    { accessorKey: 'panNo', header: 'panNo', size: 140 },
    { accessorKey: 'bankAccountNo', header: 'Bank Account No', size: 140 },
    { accessorKey: 'position', header: 'Position', size: 140 },
    { accessorKey: 'dateOfJoining', header: 'Date of Joining', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];


  const [earningDetailsData, setEarningDetailsData] = useState([{ id: 1, heading: '', amount: '' }]);
  const [detectionDetailsDataErrors, setEarningDetailsDataErrors] = useState([
    {
      heading: '',
      amount: '',
    }
  ]);

  const [detectionDetailsData, setDetectionDetailsData] = useState([{ id: 1, detectionHeading: '', detectionAmount: '' }]);
  const [earningDetailsDataErrors, setDetectionDetailsDataErrors] = useState([
    {
      detectionHeading: '',
      detectionAmount: '',
    }
  ]);

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
    console.log('Selected employeeCode value:', value);
    console.log('Full empList:', empList);

    empList.forEach((emp, index) => {
      console.log(`Employee ${index}:`, emp);
    });

    const selectedEmp = empList.find((emp) => emp.employeeCode === value);

    if (selectedEmp) {
      console.log('Selected Employee:', selectedEmp);
      setFormData((prevData) => ({
        ...prevData,
        employeeCode: selectedEmp.employeeCode,
        employeeName: selectedEmp.employeeName,
        dob: selectedEmp.dob,
      }));
    } else {
      console.log('No employee found with the given code:', value);
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

  const getUserById = async (row) => {
    console.log('THE SELECTED EMPLOYEE ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `auth/getUserById?userId=${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const particularUser = response.paramObjectsMap.userVO;

        setFormData({
          employeeCode: particularUser.employeeCode || '',
          employeeName: particularUser.employeeName,
          dob: particularUser.dob,
          grade: particularUser.grade,
          department: particularUser.department,
          panNo: particularUser.panNo,
          dateOfJoining: particularUser.dateOfJoining,
          active: particularUser.active === 'Active' ? true : false
        });
        setEarningDetailsData(
          particularUser.roleAccessVO.map((role) => ({
            id: role.id,
            heading: role.heading,
            amount: role.amount,
          }))
        );
        setDetectionDetailsData(
          particularUser.roleAccessVO.map((role) => ({
            id: role.id,
            detectionHeading: role.detectionHeading,
            detectionAmount: role.detectionAmount,
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
    if (!formData.employeeCode) {
      errors.employeeCode = 'Employee Code is required';
    }
    if (!formData.employeeName) {
      errors.employeeName = 'Employee Name is required';
    }
    if (!formData.dob) {
      errors.dob = 'DOB is required';
    }
    if (!formData.department) {
      errors.department = 'Department is required';
    }
    if (!formData.panNo) {
      errors.panNo = 'Pan No is required';
    }
    if (!formData.position) {
      errors.position = 'Position is required';
    }
    if (!formData.dateOfJoining) {
      errors.dateOfJoining = 'Date of Joining is required';
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
    setDetectionDetailsDataErrors(newTableErrors);

    // let branchTableDataValid = true;
    // const newTableErrors1 = branchTableData.map((row) => {
    //   const rowErrors = {};
    //   if (!row.branchCode) {
    //     rowErrors.branchCode = 'Branch Code is required';
    //     branchTableDataValid = false;
    //   }
    //   return rowErrors;
    // });
    setFieldErrors(errors);

    // setBranchTableErrors(newTableErrors1);

    if (Object.keys(errors).length === 0 && earningDetailsDataValid) {
      setIsLoading(true);

      const roleVo = earningDetailsData.map((row) => ({
        // ...(editId && { id: row.id }),
        heading: row.heading,
        amount: row.amount,
      }));
      const roleTableVo = detectionDetailsData.map((row) => ({
        // ...(editId && { id: row.id }),
        heading: row.heading,
        amount: row.amount,
      }));

      const saveFormData = {
        ...(editId && { id: formData.docId }),
        employeeCode: formData.employeeCode,
        employeeName: formData.employeeName,
        dob: formData.dob,
        department: formData.department,
        panNo: formData.panNo,
        dateOfJoining: formData.dateOfJoining,
        active: formData.active === 'Active' ? true : false,
        orgId: orgId,
        roleAccessDTO: roleVo,
        // branchAccessDTOList: branchVo
      };
      console.log('DATA TO SAVE IS:', saveFormData);
      try {
        const response = await apiCalls('put', `auth/signup`, saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? 'User Updated Successfully' : 'User created successfully');
          handleClear();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'User creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'User creation failed');
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
      dateOfJoining: false,
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
      amount: '',
    };
    setEarningDetailsData([...earningDetailsData, newRow]);
    setEarningDetailsDataErrors([...earningDetailsDataErrors, { heading: '', amount: '' }]);
    setDetectionDetailsData([...detectionDetailsData, newRow]);
    setDetectionDetailsDataErrors([...detectionDetailsDataErrors, { detectionHeading: '', detectionAmount: '' }]);
  };


  const isLastRowEmpty = (table) => {
    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === earningDetailsData) {
      return !lastRow.heading || !lastRow.amount;
    }
    if (table === detectionDetailsData) {
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

  const handleRoleChange = (row, index, event) => {
    const value = event.target.value;
    const selectedRole = roleList.find((role) => role.role === value);
    setEarningDetailsData((prev) => prev.map((r) => (r.id === row.id ? { ...r, role: value, roleId: selectedRole.id } : r)));
    setEarningDetailsDataErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = {
        ...newErrors[index],
        role: !value ? 'Role is required' : ''
      };
      return newErrors;
    });
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
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.employeeCode ? 'This field is required' : ''}</span>}
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
                        helperText={fieldErrors.dob ? 'This field is required' : ''}
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
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.email ? 'This field is required' : ''}</span>}
                    inputProps={{ maxLength: 40 }}
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
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.userName ? 'This field is required' : ''}</span>}
                    inputProps={{ maxLength: 15 }}
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
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.userName ? 'This field is required' : ''}</span>}
                    inputProps={{ maxLength: 15 }}
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
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.userName ? 'This field is required' : ''}</span>}
                    inputProps={{ maxLength: 15 }}
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
                        helperText={fieldErrors.dateOfJoining ? 'This field is required' : ''}
                      />
                    </LocalizationProvider>
                  </FormControl>
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
                                              setEarningDetailsDataErrors,
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
                                          onChange={(e) => handleRoleChange(row, index, e)}
                                          className={earningDetailsDataErrors[index]?.heading ? 'error form-control' : 'form-control'}
                                        >
                                          <option value="">Select Option</option>
                                          {/* {getAvailableRoles(row.id).map((role) => (
                                            <option key={heading.id} value={heading.role}>
                                              {role.heading}
                                            </option>
                                          ))} */}
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

                                            setEarningDetailsData((prev) =>
                                              prev.map((r) =>
                                                r.id === row.id ? { ...r, amount } : r
                                              )
                                            );

                                            setEarningDetailsDataErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                amount: !amount ? 'Amount is required' : '',
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
                                          onChange={(e) => handleRoleChange(row, index, e)}
                                          className={detectionDetailsDataErrors[index]?.detectionHeading ? 'error form-control' : 'form-control'}
                                        >
                                          <option value="">Select Option</option>
                                          {/* {getAvailableRoles(row.id).map((role) => (
                                            <option key={detectionHeading.id} value={detectionHeading.role}>
                                              {role.detectionHeading}
                                            </option>
                                          ))} */}
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
                                            const amount = e.target.value;

                                            setEarningDetailsData((prev) =>
                                              prev.map((r) =>
                                                r.id === row.id ? { ...r, amount } : r
                                              )
                                            );

                                            setEarningDetailsDataErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                detectionAmount: !amount ? 'Amount is required' : '',
                                              };
                                              return newErrors;
                                            });
                                          }}
                                          className={earningDetailsDataErrors[index]?.detectionAmount ? 'error form-control' : 'form-control'}
                                          onKeyDown={(e) => handleKeyDown(e, row, earningDetailsData)}
                                        />
                                        {earningDetailsDataErrors[index]?.detectionAmount && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {earningDetailsDataErrors[index].detectionAmount}
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
            <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getUserById} />
          )}
        </div>
      </div>
    </>
  );
};
export default SalaryMaster;
