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
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Autocomplete } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

const PermissionRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [editId, setEditId] = useState('');
  const [branchList, setBranchList] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [shiftTime, setShiftTime] = useState({ shiftIn: '', shiftOut: '' });
  const [errorDialog, setErrorDialog] = useState({
    open: false,
    message: ''
  });
  const [formData, setFormData] = useState({
    formDate: null,
    fromTime: null,
    toTime: null,
    totalHours: '',
    notes: '',
    notify: '',
    permissionType: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    formDate: '',
    totalHours: '',
    fromTime: '',
    toTime: null,
    notes: '',
    notify: ''
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'id', header: 'S.No', size: 140 },
    { accessorKey: 'date', header: 'Date', size: 140 },
    { accessorKey: 'fromTime', header: 'From Time', size: 140 },
    { accessorKey: 'toTime', header: 'To Time', size: 140 },
    { accessorKey: 'totalHours', header: 'Total Hrs', size: 140 },
    { accessorKey: 'notes', header: 'Notes', size: 140 },
    { accessorKey: 'notify', header: 'Notify', size: 140 }
  ];

  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    getAllPermissionRequestByOrgId();
    getNotifyList();
    getCompanyDetails();
    setFormData((prev) => ({
      ...prev,
      formDate: dayjs()
    }));
  }, []);

  // List API
  const getAllPermissionRequestByOrgId = async () => {
    try {
      const response = await apiCalls('get', `/employeemaster/getAllPermissionRequestByOrgId?orgId=${orgId}&branchCode=${branchCode}`);

      if (response.status === true) {
        const formattedData = response.paramObjectsMap.permissionRequestVO.map((item) => {
          const formDate = dayjs(item.date);
          const fromTime = dayjs(`${item.date}T${dayjs(item.fromTime, 'HH:mm').format('HH:mm')}`);
          const toTime = dayjs(`${item.date}T${dayjs(item.toTime, 'HH:mm').format('HH:mm')}`);

          let totalHours = '00:00';

          if (toTime.isValid() && fromTime.isValid() && toTime.isAfter(fromTime)) {
            const durationInMinutes = toTime.diff(fromTime, 'minute');

            // Calculate hours and minutes
            const hours = Math.floor(durationInMinutes / 60);
            const minutes = durationInMinutes % 60;

            // Format as HH:mm
            totalHours = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
          }

          return { ...item, totalHours };
        });

        setListViewData(formattedData);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getCompanyDetails = async () => {
    try {
      const result = await apiCalls('get', `commonmaster/company/${orgId}`);
      const companyData = result.paramObjectsMap.companyVO[0];
      setShiftTime({
        shiftIn: companyData.shiftIn, // e.g., "10:00:00"
        shiftOut: companyData.shiftOut // e.g., "19:30:00"
      });
    } catch (error) {
      console.error('Error', error);
    }
  };

  const getNotifyList = async () => {
    try {
      const result = await apiCalls('get', `employeemaster/getReportingPerson?employeeCode=${loginUserName}&orgId=${orgId}`);
      setCompanyList(result.paramObjectsMap.PermisionRequestVO);
    } catch (error) {
      console.error('Error', error);
    }
  };

  // Edit API
  const getPermissionRequestById = async (row) => {
    console.log('THE SELECTED PERMISSION REQUEST ID IS:', row.original.id);
    setEditId(row.original.id);

    try {
      const response = await apiCalls('get', `/employeemaster/getPermissionRequestById?id=${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const permissionDetails = response.paramObjectsMap.permissionRequestVO;

        console.log('PERMISSION REQUEST DETAILS:', permissionDetails);
        // Calculate total hours from fromTime and toTime
        const fromTime = dayjs(permissionDetails.fromTime, 'HH:mm');
        const toTime = dayjs(permissionDetails.toTime, 'HH:mm');
        let totalHours = '00:00';

        if (toTime.isValid() && fromTime.isValid() && toTime.isAfter(fromTime)) {
          const durationInMinutes = toTime.diff(fromTime, 'minute');
          const hours = Math.floor(durationInMinutes / 60);
          const minutes = durationInMinutes % 60;
          totalHours = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        }

        setFormData({
          formDate: permissionDetails.date ? dayjs(permissionDetails.date) : dayjs(), // Use dayjs(permissionDetails.date) to create a dayjs object
          fromTime: permissionDetails.fromTime ? dayjs(permissionDetails.fromTime, 'HH:mm') : null,
          toTime: permissionDetails.toTime ? dayjs(permissionDetails.toTime, 'HH:mm') : null,
          totalHours: totalHours, // Set the formatted totalHours
          notes: permissionDetails.notes || '',
          notify: permissionDetails.notify || ''
        });
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleClear = () => {
    // Reset the form data state
    setFormData({
      formDate: dayjs(),
      fromTime: null,
      toTime: null,
      totalHours: '',
      notes: '',
      notify: ''
    });

    // Reset field errors state
    setFieldErrors({
      formDate: '',
      fromTime: '',
      toTime: '',
      totalHours: '',
      notes: '',
      notify: ''
    });

    // Reset the editId if it's set (for edit mode)
    setEditId('');

    // You can also set listView to false if you want to hide the list view after clearing
    setListView(false);
  };

  const handleSave = async () => {
    const errors = {};

    // Check if totalHours exceeds 2 hours
    if (formData.totalHours && formData.totalHours !== '00:00') {
      const [hours, minutes] = formData.totalHours.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;

      if (totalMinutes > 120) {
        errors.totalHours = 'Permission request cannot exceed 2 hours.';
      }
    }

    // Existing validation rules
    if (!formData.formDate) {
      errors.formDate = 'Date is required';
    }
    if (!formData.totalHours || formData.totalHours === '00:00') {
      errors.totalHours = 'Total Hours is required';
    }
    if (!formData.notes) {
      errors.notes = 'Notes is required';
    }
    if (!formData.fromTime) {
      errors.fromTime = 'From Time is required';
    }
    if (!formData.toTime) {
      errors.toTime = 'To Time is required';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);

      // Ensure totalHours is a string before using .replace()
      let sanitizedTotalHours = formData.totalHours;
      if (typeof sanitizedTotalHours !== 'string') {
        sanitizedTotalHours = sanitizedTotalHours.toString(); // Convert number to string
      }
      sanitizedTotalHours = sanitizedTotalHours.replace(/[^0-9.]/g, ''); // Clean out non-numeric characters

      setFormData({
        ...formData,
        totalHours: sanitizedTotalHours // Update formData with sanitized value
      });

      console.log('Sanitized Total Hours:', sanitizedTotalHours);

      // Handle date formatting or null case
      const formattedDate =
        formData.formDate && dayjs(formData.formDate).isValid()
          ? dayjs(formData.formDate).format('YYYY-MM-DD') // Convert the date to 'YYYY-MM-DD' format
          : null; // If formDate is invalid, set it as null

      const saveData = {
        ...(editId && { id: editId }),
        active: formData.active,
        date: formattedDate, // Save formatted date or null
        fromTime: formData.fromTime ? dayjs(formData.fromTime, 'HH:mm').format('HH:mm') : null,
        toTime: formData.toTime ? dayjs(formData.toTime, 'HH:mm').format('HH:mm') : null,
        totalHours: parseFloat(sanitizedTotalHours), // Use sanitized totalHours
        notes: formData.notes,
        notify: formData.notify,
        orgId: orgId,
        createdBy: loginUserName
      };

      console.log('DATA TO SAVE IS:', saveData);

      // Save API call
      try {
        const response = await apiCalls('put', '/employeemaster/createUpdatePermissionRequest', saveData);

        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? ' Permission Request Updated Successfully' : 'Permission Request created successfully');

          handleClear();
          getAllPermissionRequestByOrgId();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Permission Request creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Permission Request creation failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  const handleDateChange = (newValue) => {
    if (!newValue || !dayjs(newValue).isValid()) {
      setFieldErrors((prev) => ({ ...prev, formDate: 'Invalid Date' }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      formDate: dayjs(newValue) // Ensure it's a dayjs object directly
    }));

    setFieldErrors((prev) => ({ ...prev, formDate: '' }));
  };

  const handleTimeChange = (fieldName, newValue) => {
    if (!newValue) return;

    const timeFormat = 'HH:mm';
    const newTime = dayjs(newValue).format(timeFormat);

    if (fieldName === 'fromTime') {
      setFormData((prev) => ({
        ...prev,
        fromTime: newTime,
        toTime: null, // Reset toTime if fromTime is changed
        totalHours: '00:00'
      }));
    } else if (fieldName === 'toTime') {
      if (!formData.fromTime) {
        // Show error dialog if user tries to select toTime without fromTime
        setErrorDialog({
          open: true,
          message: "Please select 'From Time' before choosing 'To Time'."
        });
        return;
      }

      const fromTime = dayjs(formData.fromTime, timeFormat);
      const toTime = dayjs(newTime, timeFormat);

      const diffInMinutes = toTime.diff(fromTime, 'minute');
      const maxAllowedMinutes = 120; // 2 hours

      if (diffInMinutes > maxAllowedMinutes || diffInMinutes <= 0) {
        // Show error dialog if the difference is more than 2 hours or invalid (negative or zero)
        setErrorDialog({
          open: true,
          message: "Invalid selection! Please choose a 'To Time' within 2 hours of 'From Time'."
        });
        return;
      }

      // Calculate total hours and minutes
      const totalHours = Math.floor(diffInMinutes / 60)
        .toString()
        .padStart(2, '0');
      const totalMinutes = (diffInMinutes % 60).toString().padStart(2, '0');

      setFormData((prev) => ({
        ...prev,
        toTime: newTime,
        totalHours: `${totalHours}:${totalMinutes}`
      }));
    }
  };

  const handleCloseErrorDialog = () => {
    setErrorDialog({ open: false, message: '' });
    setFormData((prevData) => ({
      ...prevData,
      toTime: null,
      totalHours: ""
    }));
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
              // editCallback={editEmployee}
              blockEdit={true} // DISAPLE THE MODAL IF TRUE
              toEdit={getPermissionRequestById}
            />
          </div>
        ) : (
          <>
            <div className="row">
              {/* Date */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date"
                      format="DD-MM-YYYY"
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      value={formData.formDate ? dayjs(formData.formDate) : null} // Ensure the date is a dayjs object
                      onChange={handleDateChange}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>

              {/* From Time */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label="From Time"
                      value={formData.fromTime ? dayjs(formData.fromTime, 'HH:mm') : null}
                      onChange={(newValue) => handleTimeChange('fromTime', newValue)}
                      ampm={false}
                      minTime={dayjs(shiftTime.shiftIn, 'HH:mm:ss')}
                      maxTime={dayjs(shiftTime.shiftOut, 'HH:mm:ss')}
                      slots={{
                        openPickerIcon: AccessTimeIcon
                      }}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>

              {/* To Time */}
              <div className="col-md-3 mb-3">
                {' '}
                {/* To Time */}
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label="To Time"
                      value={formData.toTime ? dayjs(formData.toTime, 'HH:mm') : null}
                      onChange={(newValue) => handleTimeChange('toTime', newValue)}
                      ampm={false}
                      minTime={dayjs(shiftTime.shiftIn, 'HH:mm:ss')}
                      maxTime={dayjs(shiftTime.shiftOut, 'HH:mm:ss')}
                      slots={{
                        openPickerIcon: AccessTimeIcon
                      }}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>

              {/* Total Hours */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Total Hours"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={formData.totalHours || '00:00'}
                  error={!!fieldErrors.totalHours}
                  helperText={fieldErrors.totalHours}
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
                  value={companyList.find((c) => c.notify === formData.notify) || null}
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
      <Dialog open={errorDialog.open} onClose={handleCloseErrorDialog}>
        <DialogTitle style={{ color: 'red' }}>⚠ Permission Request Error</DialogTitle>
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

export default PermissionRequest;
