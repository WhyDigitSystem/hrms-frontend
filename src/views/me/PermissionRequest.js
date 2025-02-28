import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import TextField from '@mui/material/TextField';
import apiCalls from 'apicall';
import Autocomplete from '@mui/material/Autocomplete';
import { useEffect, useRef, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from '../basicMaster/CommonListViewTable';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import FormControl from '@mui/material/FormControl';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker'; // Import TimePicker
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // Import Time icon


const PermissionRequest = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fromDate: null,
    fromTime: null, // Add fromTime
    toTime: null,     // Add toTime
    totalHours: '',
    notes: '',
  });
  const [editId, setEditId] = useState('');

  const [fieldErrors, setFieldErrors] = useState({
    fromDate: '',
    totalHours: '',
    fromTime: '', // Add fromTime error
    toTime: null,     // Add toTime
    notes: '',
  });

  const companyList = [
    { label: 'Company A', id: 1 },
    { label: 'Company B', id: 2 },
  ];

  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'date', header: 'S.No', size: 140 },
    { accessorKey: 'Date', header: 'Date', size: 140 },
    { accessorKey: 'Date', header: 'From Time', size: 140 },
    { accessorKey: 'Date', header: 'To Time', size: 140 },
    { accessorKey: 'Date', header: 'Total Hrs', size: 140 },
    { accessorKey: 'Date', header: 'Notes', size: 140 },
    { accessorKey: 'Date', header: 'Status', size: 140 },
  ];
  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    getAllLeaveRequest();
  }, []);

  const getAllLeaveRequest = async () => {
    try {
      const result = await apiCalls('get', `commonmaster/getDepartmentByOrgId?orgid=${orgId}`);
      setListViewData(result.paramObjectsMap.departmentVO.reverse());
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getLeaveRequestById = async (row) => {
    console.log('THE SELECTED LEAVE REQUEST ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `/commonmaster/getLeaveRequestById?id=${row.original.id}`);
      console.log('API Response:', response);
      if (response.status === true) {
        setListView(false);
        const particularDepartment = response.paramObjectsMap.departmentVO;
        setFormData({
          fromDate: particularDepartment.departmentCode,
          totalHours: particularDepartment.departmentCode,
          notes: particularDepartment.departmentCode,
        });

      } else {
        console.error('API Error');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, selectionStart, selectionEnd, type } = e.target;
    const codeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;
    const nameRegex = /^[A-Za-z ]*$/;

    if (name === 'department' && !codeRegex.test(value)) {
      setFieldErrors({ ...fieldErrors, [name]: 'Invalid Format' });
    } else if (name === 'departmentCode' && !nameRegex.test(value)) {
      setFieldErrors({ ...fieldErrors, [name]: 'Invalid Format' });
    } else {
      setFormData({ ...formData, [name]: value.toUpperCase() });
      setFieldErrors({ ...fieldErrors, [name]: '' });

      // Update the cursor position after the input change
      if (type === 'text' || type === 'textarea') {
        setTimeout(() => {
          const inputElement = document.getElementsByName(name)[0];
          if (inputElement) {
            inputElement.setSelectionRange(selectionStart, selectionEnd);
          }
        }, 0);
      }
    }
  };

  const handleClear = () => {
    setFormData({
      fromDate: '',
      totalHours: '',
      notes: '',
      fromTime: null,
      toTime: null,
    });
    setFieldErrors({
      fromDate: '',
      fromTime: '',
      toTime: '',
      totalHours: '',
      notes: '',
    });
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};

    if (!formData.fromDate) {
      errors.fromDate = 'From Date is required';
    }
    if (!formData.totalHours) {
      errors.totalHours = 'Total Hours is required';
    }
    if (!formData.notes) {
      errors.notes = 'Notes is required';
    }
    // ... (Existing validation)
    if (!formData.fromTime) {
      errors.fromTime = 'From Time is required';
    }
    if (!formData.toTime) {
      errors.toTime = 'To Time is required';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveFormData = {
        ...(editId && { id: editId }),
        departmentName: formData.fromDate,
        departmentName: formData.totalHours,
        departmentName: formData.notes,
        fromTime: formData.fromTime ? dayjs(formData.fromTime).format('HH:mm') : null, // Format time
        toTime: formData.toTime ? dayjs(formData.toTime).format('HH:mm') : null,     // Format time
        orgId: orgId,
        createdBy: loginUserName
      };

      console.log('DATA TO SAVE IS:', saveFormData);

      try {
        const result = await apiCalls('post', `commonmaster/createUpdateDepartment`, saveFormData);

        if (result.status === true) {
          console.log('Response:', result);
          showToast('success', editId ? 'Permission Request Updated Successfully' : 'Permission Request created successfully');
          handleClear();
          getAllLeaveRequest();
          setIsLoading(false);
        } else {
          showToast('error', result.paramObjectsMap.errorMessage || 'Permission Request creation failed');
          setIsLoading(false);
        }
      } catch (err) {
        console.log('error', err);
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

  const handleDateChange = (field, newValue) => {
    const updatedFormData = { ...formData, [field]: newValue };

    if (updatedFormData.fromDate && updatedFormData.toDate) {
      const from = dayjs(updatedFormData.fromDate);

    }

    setFormData(updatedFormData);
  };

  const handleTimeChange = (field, newValue) => {
    setFormData({ ...formData, [field]: newValue });
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            {/* <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} /> */}
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton
              title="Save"
              icon={SaveIcon}
              isLoading={isLoading}
              onClick={() => handleSave()}
              margin="0 10px 0 10px"
            /> &nbsp;{' '}
          </div>
        </div>
        {listView ? (
          <div className="mt-4">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              blockEdit={true} // DISAPLE THE MODAL IF TRUE
              toEdit={getLeaveRequestById}
            />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date"
                      format="DD-MM-YYYY"
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      value={formData.fromDate ? dayjs(formData.fromDate) : null}
                      onChange={(newValue) => handleDateChange('fromDate', newValue)}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>


              <div className="col-md-3 mb-3"> {/* From Time */}
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label="From Time"
                      value={formData.fromTime}
                      onChange={(newValue) => handleTimeChange('fromTime', newValue)}
                      ampm={false} // 24-hour format
                      slots={{
                        openPickerIcon: AccessTimeIcon,
                      }}
                      slotProps={{
                        textField: { size: 'small', clearable: true },
                      }}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>


              <div className="col-md-3 mb-3"> {/* To Time */}
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label="To Time"
                      value={formData.toTime}
                      onChange={(newValue) => handleTimeChange('toTime', newValue)}
                      ampm={false} // 24-hour format
                      slots={{
                        openPickerIcon: AccessTimeIcon,
                      }}
                      slotProps={{
                        textField: { size: 'small', clearable: true },
                      }}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <TextField
                  label="Total Hours"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={formData.totalHours || ''}
                  disabled // Prevent manual input
                />
              </div>

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

              {/* <div className="col-md-3 mb-3">
                <TextField
                  label="Notify"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="notify"
                  value={formData.notify}
                  onChange={handleInputChange}
                  error={!!fieldErrors.notify}
                  helperText={fieldErrors.notify}
                />
              </div> */}
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
      <div>
        <ToastComponent />
      </div>
    </>
  );
};
export default PermissionRequest;
