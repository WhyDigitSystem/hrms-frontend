import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import TextField from '@mui/material/TextField';
import apiCalls from 'apicall';
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
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DemoItem } from '@mui/x-date-pickers/internals/demo';

const today = dayjs();
dayjs.extend(duration);
const todayEndOfTheDay = today.endOf('day');

const CustomTimePicker = ({ label, value, onChange }) => (
  <TimePicker
    label={label}
    value={value}
    size="small"
    onChange={onChange}
    sx={{
      '& .MuiInputBase-root': {
        height: '40px', // Match other fields
      },
    }}
  />
);

const PermissionRequest = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    date: dayjs(),
    fromTime: '',
    toTime: '',
    totalHours: '',
    notes: '',
    notify: ''
  });
  const [editId, setEditId] = useState('');

  const [fieldErrors, setFieldErrors] = useState({
    date: '',
    fromTime: '',
    toTime: '',
    totalHours: '',
    notes: '',
    notify: ''
  });

const handleTimeChange = (field, newValue) => {
  const updatedFormData = { ...formData, [field]: newValue };

  if (updatedFormData.fromTime && updatedFormData.toTime) {
    const from = dayjs(updatedFormData.fromTime);
    const to = dayjs(updatedFormData.toTime);

    if (to.isAfter(from)) {
      const diff = dayjs.duration(to.diff(from)); // Difference in duration format
      const totalHours = `${diff.hours()}h ${diff.minutes()}m`; // Format as "Xh Ym"

      updatedFormData.totalHours = totalHours;
    } else {
      updatedFormData.totalHours = ''; // Clear if invalid range
    }
  }

  setFormData(updatedFormData);
};

  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'fromTime', header: 'From Time', size: 140 },
    {
      accessorKey: 'toTime',
      header: 'To Time',
      size: 140
    },
    { accessorKey: 'date', header: 'Date', size: 140 }
  ];
  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    getAllPermissionRequest();
  }, []);

  const getAllPermissionRequest = async () => {
    try {
      const result = await apiCalls('get', `commonmaster/getDepartmentByOrgId?orgid=${orgId}`);
      setListViewData(result.paramObjectsMap.departmentVO.reverse());
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getPermissionRequestById = async (row) => {
    console.log('THE SELECTED PERMISSION REQUEST ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `/commonmaster/getPermissionRequestById?id=${row.original.id}`);
      console.log('API Response:', response);
      if (response.status === true) {
        setListView(false);
        const particularDepartment = response.paramObjectsMap.departmentVO;
        setFormData({
          department: particularDepartment.departmentName,
          departmentCode: particularDepartment.departmentCode,
          active: particularDepartment.active === 'Active' ? true : false
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
      date: dayjs(),
      fromTime: '',
      toTime: '',
      totalHours: '',
      notes: '',
      notify: ''
    });
    setFieldErrors({
      date: '',
      fromTime: '',
      toTime: '',
      totalHours: '',
      notes: '',
      notify: ''
    });
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.date) {
      errors.date = 'Date is required';
    }
    if (!formData.toTime) {
      errors.toTime = 'To Time Code is required';
    }
    if (!formData.fromTime) {
      errors.fromTime = 'From Time is required';
    }
    if (!formData.totalHours) {
      errors.totalHours = 'Total Hours is required';
    }
    if (!formData.notes) {
      errors.notes = 'Notes is required';
    }
    if (!formData.notify) {
      errors.notify = 'Notify is required';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        toTime: formData.toTime,
        departmentName: formData.department,
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
          getAllPermissionRequest();
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

  const handleCheckboxChange = (event) => {
    setFormData({
      ...formData,
      active: event.target.checked
    });
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
              toEdit={getPermissionRequestById}
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
                        disabled
                        slotProps={{
                          textField: { size: 'small', clearable: true }
                        }}
                        value={formData.date ? dayjs(formData.date) : null}
                        onChange={(newValue) => setFormData({ ...formData, date: newValue })}
                      />
                    </LocalizationProvider>
                  </FormControl>
                </div>
                <div className="col-md-3 mb-3">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label="From Time"
                      value={formData.fromTime ? dayjs(formData.fromTime) : null}
                      size="small"
                      onChange={(newValue) => handleTimeChange('fromTime', newValue)}
                      disableFuture
                      sx={{
                        '& .MuiInputBase-root': { height: '40px' },
                      }}
                    />
                  </LocalizationProvider>
                </div>

                <div className="col-md-3 mb-3">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label="To Time"
                      value={formData.toTime ? dayjs(formData.toTime) : null}
                      size="small"
                      onChange={(newValue) => handleTimeChange('toTime', newValue)}
                      disableFuture
                      sx={{
                        '& .MuiInputBase-root': { height: '40px' },
                      }}
                    />
                  </LocalizationProvider>
                </div>  
              <div className="col-md-3 mb-3">
                <TextField
                  label="Total Hours"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="totalHours"
                  value={formData.totalHours}
                  onChange={handleInputChange}
                  error={!!fieldErrors.totalHours}
                  helperText={fieldErrors.totalHours}
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
              <div className="col-md-3 mb-3">
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
