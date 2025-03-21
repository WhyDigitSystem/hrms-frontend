import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import apiCalls from 'apicall';
import { useState, useEffect } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import { Autocomplete } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

const LeaveRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [employeeCode, setEmployeeCode] = useState(localStorage.getItem('employeeCode'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [department, setDepartment] = useState(localStorage.getItem('department'));
  const [designation, setDesignation] = useState(localStorage.getItem('designation'));
  const [employeeName, setEmployeeName] = useState(localStorage.getItem('employeeName'));
  const [editId, setEditId] = useState('');
  const [branchList, setBranchList] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [leaveTypeList, setLeaveTypeList] = useState([]);
  const [formData, setFormData] = useState({
    leaveType: '',
    leaveTypeCode: '',
    fromDate: dayjs(),
    toDate: null,
    totalDays: '',
    notes: '',
    notify: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    leaveType: '',
    fromDate: '',
    toDate: '',
    totalDays: '',
    notes: '',
    notify: ''
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'id', header: 'S.No', size: 140 },
    { accessorKey: 'leaveType', header: 'Leave Type', size: 140 },
    { accessorKey: 'fromDate', header: 'From Date', size: 140 },
    { accessorKey: 'toDate', header: 'To Date', size: 140 },
    { accessorKey: 'totalDays', header: 'Total Days', size: 140 },
    { accessorKey: 'notes', header: 'Notes', size: 140 },
    { accessorKey: 'notify', header: 'Notify', size: 140 },
  ];
  const [listViewData, setListViewData] = useState([]);
  const [errorDialog, setErrorDialog] = useState({
    open: false,
    message: ''
  });

  // Function to open the error dialog
  const showErrorDialog = (message) => {
    setErrorDialog({ open: true, message });
  };

  // Function to close the error dialog
  const handleCloseErrorDialog = () => {
    setErrorDialog({ open: false, message: '' });
  };

  useEffect(() => {
    getLeaveRequestByOrgId();
    getNotifyList();
    getLeaveType();
  }, [formData.fromDate, formData.toDate, orgId, loginUserName]);


  // List API
  const getLeaveRequestByOrgId = async () => {
    try {
      const response = await apiCalls('get', `/leaveprocess/getLeaveRequestByOrgId?orgId=${orgId}&branchCode=${branchCode}`);
      console.log('API Response:', response);

      if (response.status === true) {
        const formattedData = response.paramObjectsMap.leaveRequestVO.map((item) => {
          console.log('Raw fromDate:', item.fromDate);
          console.log('Raw toDate:', item.toDate);

          // Convert fromDate and toDate to Dayjs objects
          const fromDate = item.fromDate && dayjs(item.fromDate, 'YYYY-MM-DD', true).isValid()
            ? dayjs(item.fromDate)
            : null;

          const toDate = item.toDate && dayjs(item.toDate, 'YYYY-MM-DD', true).isValid()
            ? dayjs(item.toDate)
            : null;



          return { ...item, fromDate, toDate, };
        });

        console.log('Formatted Data:', formattedData);
        setListViewData(formattedData);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };



  // getNotifyList
  const getNotifyList = async () => {
    try {
      const result = await apiCalls('get', `employeemaster/getReportingPerson?employeeCode=${loginUserName}&orgId=${orgId}`);
      setCompanyList(result.paramObjectsMap.PermisionRequestVO);
    } catch (error) {
      console.error('Error', error);
    }
  };

  // getLeaveType
  const getLeaveType = async () => {
    try {
      const result = await apiCalls('get', `leaveprocess/getAllLeaveTypeFromLeaveMaster?employeeCode=${employeeCode}&orgId=${orgId}`);
      setLeaveTypeList(result.paramObjectsMap.leaveRequestVO);
    } catch (error) {
      console.error('Error fetching leave types:', error);
    }
  };

  // Edit API
  const getLeaveRequestById = async (row) => {
    console.log('THE SELECTED LEAVE REQUEST ID IS:', row.original.id);
    setEditId(row.original.id);

    try {
      const response = await apiCalls('get', `/leaveprocess/getLeaveRequestById?id=${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true && response.paramObjectsMap.leaveRequestVO) {
        const leaveRequestDetails = response.paramObjectsMap.leaveRequestVO;

        console.log('LEAVE REQUEST DETAILS:', leaveRequestDetails);

        setFormData({
          leaveType: leaveRequestDetails.leaveType || '',
          fromDate: leaveRequestDetails.fromDate ? dayjs(leaveRequestDetails.fromDate) : dayjs(),
          toDate: leaveRequestDetails.toDate ? dayjs(leaveRequestDetails.toDate) : dayjs(),
          totalDays: leaveRequestDetails.totalDays,
          notes: leaveRequestDetails.notes || '',
          notify: leaveRequestDetails.notify || ''
        });

        setListView(false); // Switch back to form view
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    let inputValue = value;

    // Validation Rules
    const textRegex = /^[A-Za-z ]*$/;
    const codeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;

    // Convert to Uppercase for text fields
    if (type === 'text' || type === 'textarea') {
      inputValue = inputValue.toUpperCase();
    } else if (name === 'email') {
      inputValue = inputValue.toLowerCase();
    }

    // Checkbox Handling
    if (type === 'checkbox') {
      inputValue = checked;
    }

    // Validate Specific Fields
    let errorMessage = '';
    if (name === 'employeeName' && !textRegex.test(value)) {
      errorMessage = 'Invalid Format';
    } else if (name === 'employeeCode' && !codeRegex.test(value)) {
      errorMessage = 'Invalid Format';
    }

    // Branch Selection Handling
    if (name === 'branch') {
      const selectedBranch = branchList.find((br) => br.branch === value);
      setFormData((prevData) => ({
        ...prevData,
        branch: value,
        branchCode: selectedBranch ? selectedBranch.branchCode : ''
      }));
    }
    // Reset fromDate & toDate when leaveType is cleared
    else if (name === 'leaveType' && !value) {
      setFormData((prevData) => ({
        ...prevData,
        leaveType: '',
        leaveTypeCode: '',
        fromDate: null,
        toDate: null,
        totalDays: ''
      }));
    }
    // Prevent selecting toDate before fromDate
    else if (name === 'toDate') {
      if (!formData.fromDate) {
        showErrorDialog("Please select From Date first.");
        return;
      }

      // Calculate the difference between fromDate and toDate
      const fromDate = new Date(formData.fromDate);
      const selectedToDate = new Date(value);
      const timeDifference = selectedToDate - fromDate;
      const daysDifference = timeDifference / (1000 * 60 * 60 * 24) + 1; // Adding 1 to count inclusive

      // Check if the selected leave type has a limit
      if (formData.leaveType && formData.leaveCount) {
        if (daysDifference > formData.leaveCount) {
          showErrorDialog(`You can only select up to ${formData.leaveCount} day(s) for this leave.`);
          return;
        }
      }
    }

    // Update formData
    setFormData((prevData) => ({
      ...prevData,
      [name]: inputValue
    }));

    // Update Errors
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errorMessage
    }));
  };


  // handleClear
  const handleClear = () => {
    // Reset the form data state
    setFormData({
      leaveType: '',
      fromDate: dayjs(),
      toDate: null,
      totalDays: '',
      notes: '',
      notify: ''
    });

    // Reset field errors state
    setFieldErrors({
      leaveType: '',
      fromDate: '',
      toDate: '',
      totalDays: '',
      notes: '',
      notify: ''
    });

    // Reset the editId if it's set (for edit mode)
    setEditId('');

    // Optionally, reset listView to false if you want to hide the list view after clearing
    setListView(false);
  };

  // handleSave
  const handleSave = async () => {
    const errors = {};
    if (!formData.fromDate) {
      errors.fromDate = 'From Date is required';
    }
    if (!formData.toDate) {
      errors.toDate = 'To Date is required';
    }
    if (!formData.totalDays) {
      errors.totalDays = 'Total Days is required';
    }
    if (!formData.notes) {
      errors.notes = 'Notes is required';
    }
    if (!formData.leaveType) {
      errors.leaveType = 'Leave Type is required';
    }
    // if (!formData.notify) {
    //   errors.notify = 'Notify is required';
    // }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);

      const formattedFromDate =
        formData.fromDate && dayjs(formData.fromDate).isValid() ? dayjs(formData.fromDate).format('YYYY-MM-DD') : null;
      const formattedToDate = formData.toDate && dayjs(formData.toDate).isValid() ? dayjs(formData.toDate).format('YYYY-MM-DD') : null;

      const saveData = {
        ...(editId && { id: editId }),
        leaveType: formData.leaveType,
        leaveCode: formData.leaveTypeCode,
        fromDate: formattedFromDate,
        toDate: formattedToDate,
        totalDays: formData.totalDays,
        notes: formData.notes,
        notify: formData.notify,
        orgId: orgId,
        branchCode: branchCode,
        branch: branch,
        department: department,
        designation: designation,
        employeeCode: employeeCode,
        employeeName: employeeName,
        createdBy: loginUserName
      };

      console.log('DATA TO SAVE IS:', saveData);

      try {
        const response = await apiCalls('put', '/leaveprocess/createUpdateLeaveRequest', saveData);

        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? 'Leave Request Updated Successfully' : 'Leave Request created successfully');

          handleClear();
          getLeaveRequestByOrgId();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Leave Request creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Leave Request creation failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const calculateLeavedays = async (fromDate, toDate) => {
    try {
      if (!fromDate || !toDate) return;

      // Convert dates to API-friendly format
      const formattedFromDate = dayjs(fromDate).format("YYYY-MM-DD");
      const formattedToDate = dayjs(toDate).format("YYYY-MM-DD");

      const result = await apiCalls(
        'get',
        `/leaveprocess/calculateLeavedays?fromDate=${encodeURIComponent(formattedFromDate)}&orgId=${orgId}&toDate=${encodeURIComponent(formattedToDate)}`
      );

      if (result.workingDays !== undefined) {
        setFormData((prev) => ({ ...prev, totalDays: result.workingDays }));
      }
    } catch (error) {
      console.error("Error fetching leave days:", error);
    }
  };

  // handleView
  const handleView = () => {
    setListView(!listView);
  };

  const handleLeaveTypeChange = (event, newValue) => {
    if (!newValue) {
      setFormData((prevData) => ({ ...prevData, leaveType: '', leaveTypeCode: '' }));
      return;
    }

    const selectedLeave = leaveTypeList.find((leave) => leave.leaveType === newValue.leaveType);
    if (!selectedLeave) return;

    // Skip validation for "Loss Of Pay"
    if (selectedLeave.leaveType !== 'LOSS OF PAY' && selectedLeave.leaveDays === '0') {
      showErrorDialog(`You don't have leave in ${selectedLeave.leaveType}`);
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      leaveType: newValue.leaveType,
      leaveTypeCode: selectedLeave.leaveTypeCode // Ensure leaveTypeCode is updated
    }));
  };

  const handleDateChange = async (name, value) => {  // Add async here
    if (!value) {
      setFormData((prevData) => ({ ...prevData, [name]: null, totalDays: '' }));
      return;
    }

    const fromDate = name === 'fromDate' ? value : formData.fromDate;
    const toDate = name === 'toDate' ? value : formData.toDate;

    if (fromDate && name === 'toDate') {
      const diffDays = dayjs(value).diff(dayjs(fromDate), 'day') + 1;

      const selectedLeave = leaveTypeList.find((leave) => leave.leaveType === formData.leaveType);

      if (selectedLeave && selectedLeave.leaveType !== 'LOSS OF PAY' && parseInt(diffDays) > parseInt(selectedLeave.leaveDays)) {
        showErrorDialog(`You can only take ${selectedLeave.leaveDays} days for ${selectedLeave.leaveType}.`);
        return;
      }

      setFormData((prevData) => ({ ...prevData, toDate: value, totalDays: diffDays }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }

    // Call API to calculate leave days if both dates are selected
    const updatedFormData = { ...formData, [name]: value };  // Ensure updated state values
    if (updatedFormData.fromDate && updatedFormData.toDate) {
      await calculateLeavedays(updatedFormData.fromDate, updatedFormData.toDate);
    }
  };


  // const handleDateChange = async (name, value) => {
  //   if (!value) {
  //     setFormData((prevData) => ({ ...prevData, [name]: null, totalDays: "" }));
  //     return;
  //   }

  //   // Ensure Leave Type is selected before proceeding
  //   if (!formData.leaveType) {
  //     showErrorDialog("Please select a Leave Type.");
  //     return;
  //   }

  //   const updatedFormData = { ...formData, [name]: value };
  //   setFormData(updatedFormData);

  //   // Call API to calculate leave days if both dates are selected
  //   if (updatedFormData.fromDate && updatedFormData.toDate) {
  //     await calculateLeavedays(updatedFormData.fromDate, updatedFormData.toDate);
  //   }
  // };


  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px 0 10px" />
          </div>
        </div>
        {listView ? (
          <div className="mt-4">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              blockEdit={false}
              toEdit={getLeaveRequestById}
            // enableEditing={true}
            />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <Autocomplete
                  disablePortal
                  options={leaveTypeList}
                  getOptionLabel={(option) => option.leaveType || ''}
                  sx={{ width: '100%' }}
                  size="small"
                  value={leaveTypeList.find((c) => c.leaveType === formData?.leaveType) || null}
                  onChange={handleLeaveTypeChange} // Use new function for validation
                  renderOption={(props, option) => {
                    let textColor = '#888';
                    if (option.leaveDays === '0') textColor = 'red';
                    else if (parseInt(option.leaveDays) > 5) textColor = 'green';
                    else textColor = 'orange';

                    return (
                      <li {...props} style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span>{option.leaveType}</span>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: textColor }}>{option.leaveDays} Days</span>
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Leave Type"
                      name="leaveType"
                      error={Boolean(fieldErrors?.leaveType)}
                      helperText={fieldErrors?.leaveType || ''}
                      InputProps={{ ...params.InputProps, style: { height: 40 } }}
                    />
                  )}
                />
              </div>

              {/* From Time */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="From Date"
                      format="DD-MM-YYYY"
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      value={formData.fromDate}
                      onChange={(newValue) => handleDateChange('fromDate', newValue)}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>

              {/* To Time */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="To Date"
                      format="DD-MM-YYYY"
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      value={formData.toDate}
                      onChange={(newValue) => handleDateChange('toDate', newValue)}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>

              {/* Total Days */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Total Days"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={formData.totalDays}
                  error={!!fieldErrors.totalDays}
                  helperText={fieldErrors.totalDays}
                  disabled
                />
              </div>

              {/* Notes */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Notes"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  error={!!fieldErrors.notes}
                  helperText={fieldErrors.notes}
                />
              </div>

              {/* notify */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  disablePortal
                  options={companyList} // Ensure this is an array of objects with `reportingPerson`
                  getOptionLabel={(option) => option.reportingPerson || ''} // Use `reportingPerson`
                  sx={{ width: '100%' }}
                  size="small"
                  value={companyList.find((c) => c.reportingPerson === formData.notify) || null} // Match based on `reportingPerson`
                  onChange={(event, newValue) => {
                    handleInputChange({
                      target: {
                        name: 'notify',
                        value: newValue ? newValue.reportingPerson : '' // Update `formData.notify` with `reportingPerson`
                      }
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Notify"
                      name="notify"
                      error={Boolean(fieldErrors.notify)}
                      helperText={fieldErrors.notify || ''}
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 }
                      }}
                    />
                  )}
                />
              </div>

            </div>
          </>
        )}
      </div>
      <ToastContainer />
      <Dialog open={errorDialog.open} onClose={handleCloseErrorDialog}>
        <DialogTitle style={{ color: 'red' }}>⚠ Leave Request Error</DialogTitle>
        <DialogContent>
          <Typography>{errorDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseErrorDialog} color="primary" variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default LeaveRequest;
