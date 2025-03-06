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

const LeaveRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [editId, setEditId] = useState('');
  const [branchList, setBranchList] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [leaveTypeList, setLeaveTypeList] = useState([]);
  const [formData, setFormData] = useState({
    leaveType: "",
    fromDate: dayjs(),
    toDate: dayjs(),
    totalDays: 1,
    notes: '',
    notify: '',
  });

  const [fieldErrors, setFieldErrors] = useState({
    leaveType: "",
    fromDate: '',
    toDate: '',
    totalDays: '',
    notes: '',
    notify: '',
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

  useEffect(() => {
    getLeaveRequestByOrgId();
    getNotifyList();
    getLeaveType();
    calculateTotalDays(); // Calculate total days on component mount and date changes
  }, [formData.fromDate, formData.toDate, orgId, loginUserName]); // Run useEffect only when these dependencies change

  // calculateTotalDays
  const calculateTotalDays = () => {
    if (formData.fromDate && formData.toDate) {
      const from = dayjs(formData.fromDate);
      const to = dayjs(formData.toDate);

      if (from.isValid() && to.isValid()) {
        const diff = to.diff(from, "day") + 1;
        setFormData((prev) => ({ ...prev, totalDays: diff > 0 ? diff : 1 })); // Ensure at least 1 day
      } else {
        setFormData((prev) => ({ ...prev, totalDays: 1 })); // Reset to 1 if dates are invalid
      }
    }
  };

  // List API
  const getLeaveRequestByOrgId = async () => {
    try {
      const response = await apiCalls('get', `/commonmaster/getLeaveRequestByOrgId?orgId=${orgId}`);

      if (response.status === true) {
        const formattedData = response.paramObjectsMap.leaveRequestVO.map((item) => {
          const fromDate = dayjs(item.fromDate).format('DD-MM-YYYY');
          const toDate = dayjs(item.toDate).format('DD-MM-YYYY');

          let totalDays = 1;

          if (dayjs(item.toDate).isValid() && dayjs(item.fromDate).isValid()) {
            totalDays = dayjs(item.toDate).diff(dayjs(item.fromDate), 'day') + 1;
          }

          return { ...item, fromDate, toDate, totalDays };
        });

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
  const getLeaveType = async (employeeId) => {
    try {
      const result = await apiCalls('get', `commonmaster/getAllLeaveTypeFromLeaveMaster?employeeId=${employeeId}&orgId=${orgId}`);
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
      const response = await apiCalls('get', `/commonmaster/getLeaveRequestById?id=${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true && response.paramObjectsMap.leaveRequestVO) {
        const leaveRequestDetails = response.paramObjectsMap.leaveRequestVO;

        console.log('LEAVE REQUEST DETAILS:', leaveRequestDetails);

        setFormData({
          leaveType: leaveRequestDetails.leaveType || "",
          fromDate: leaveRequestDetails.fromDate ? dayjs(leaveRequestDetails.fromDate) : dayjs(),
          toDate: leaveRequestDetails.toDate ? dayjs(leaveRequestDetails.toDate) : dayjs(),
          totalDays: leaveRequestDetails.totalDays || 1,
          notes: leaveRequestDetails.notes || '',
          notify: leaveRequestDetails.notify || '',
        });

        setListView(false);  // Switch back to form view
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  // handleInputChange
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

    // Branch Selection Handling (if applicable, remove if not)
    if (name === 'branch') {
      const selectedBranch = branchList.find((br) => br.branch === value);
      setFormData((prevData) => ({
        ...prevData,
        branch: value,
        branchCode: selectedBranch ? selectedBranch.branchCode : '',
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: inputValue,
      }));
    }

    // Update Errors
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errorMessage,
    }));
  };

  // handleClear
  const handleClear = () => {
    // Reset the form data state
    setFormData({
      leaveType: "",
      fromDate: dayjs(), // Reset to current date as dayjs object
      toDate: dayjs(),   // Reset to current date as dayjs object
      totalDays: 1,      // Reset to 1, as same day is 1 day
      notes: '',
      notify: '',
    });

    // Reset field errors state
    setFieldErrors({
      leaveType: "",
      fromDate: '',
      toDate: '',
      totalDays: '',
      notes: '',
      notify: '',
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

      const formattedFromDate = formData.fromDate && dayjs(formData.fromDate).isValid()
        ? dayjs(formData.fromDate).format('YYYY-MM-DD')
        : null;
      const formattedToDate = formData.toDate && dayjs(formData.toDate).isValid()
        ? dayjs(formData.toDate).format('YYYY-MM-DD')
        : null;

      const saveData = {
        ...(editId && { id: editId }),
        leaveType: formData.leaveType,
        fromDate: formattedFromDate,
        toDate: formattedToDate,
        totalDays: formData.totalDays,
        notes: formData.notes,
        notify: formData.notify,
        orgId: orgId,
        createdBy: loginUserName,
      };

      console.log('DATA TO SAVE IS:', saveData);

      try {
        const response = await apiCalls('put', '/commonmaster/createUpdateLeaveRequest', saveData);

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

  // handleView
  const handleView = () => {
    setListView(!listView);
  };

  // handleDateChange
  const handleDateChange = (field, newValue) => {
    if (newValue && dayjs(newValue).isValid()) {
      setFormData((prev) => ({
        ...prev,
        [field]: newValue, // Store as dayjs object
      }));
    }
  };

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
              blockEdit={false} // Ensure this allows editing
              toEdit={getLeaveRequestById}
            />

          </div>
        ) : (
          <>
            <div className="row">
              {/* Leave type */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  disablePortal
                  options={leaveTypeList.map((option) => ({ ...option, key: option.id }))}
                  getOptionLabel={(option) => option.leaveType || ''}
                  sx={{ width: '100%' }}
                  size="small"
                  value={leaveTypeList.find((c) => c.leaveType === formData?.leaveType) || null}
                  onChange={(event, newValue) => {
                    handleInputChange({
                      target: {
                        name: 'leaveType',
                        value: newValue?.leaveType || '',
                      },
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Leave Type"
                      name="leaveType"
                      error={Boolean(fieldErrors?.leaveType)}
                      helperText={fieldErrors?.leaveType || ''}
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 },
                      }}
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
                  options={companyList.map((option, index) => ({ ...option, key: index }))}
                  getOptionLabel={(option) => option.notify || ''}
                  sx={{ width: '100%' }}
                  size="small"
                  value={
                    companyList.find((c) => c.notify === formData.notify) || null
                  }
                  onChange={(event, newValue) => {
                    handleInputChange({
                      target: {
                        name: 'notify',
                        value: newValue ? newValue.notify : ''
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
    </>
  );
};

export default LeaveRequest;