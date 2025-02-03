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

const LeaveRequest = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    leaveType: '',
    fromDate: null,
    toDate: null,
    totalDays: '',
    notes: '',
    leave: ''
  });
  const [editId, setEditId] = useState('');

  const [fieldErrors, setFieldErrors] = useState({
    leaveType: '',
    fromDate: '',
    toDate: '',
    totalDays: '',
    notes: '',
    leave: ''
  });

  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'fromDate', header: 'From Date', size: 140 },
    {
      accessorKey: 'toDate',
      header: 'To Date',
      size: 140
    },
    // { accessorKey: 'date', header: 'Date', size: 140 }
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
          leaveType: particularDepartment.leaveType,
          leave: particularDepartment.departmentCode,
          fromDate: particularDepartment.departmentCode,
          toDate: particularDepartment.departmentCode,
          totalDays: particularDepartment.departmentCode,
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
      leaveType: '',
      fromDate: '',
      toDate: '',
      totalDays: '',
      notes: '',
      leave: ''
    });
    setFieldErrors({
      leaveType: '',
      fromDate: '',
      toDate: '',
      totalDays: '',
      notes: '',
      leave: ''
    });
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.leave) {
      errors.leave = 'leave is required';
    }
    if (!formData.leaveType) {
      errors.leaveType = 'Leave Type Code is required';
    }
    if (!formData.fromDate) {
      errors.fromDate = 'From Date is required';
    }
    if (!formData.totalDays) {
      errors.totalDays = 'Total Date is required';
    }
    if (!formData.notes) {
      errors.notes = 'Notes is required';
    }
    if (!formData.toDate) {
      errors.toDate = 'To Date is required';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveFormData = {
        ...(editId && { id: editId }),
        toTime: formData.toDate,
        departmentName: formData.fromDate,
        departmentName: formData.totalDays,
        departmentName: formData.leave,
        departmentName: formData.leaveType,
        departmentName: formData.notes,
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
      const to = dayjs(updatedFormData.toDate);
  
      if (to.isAfter(from) || to.isSame(from)) {
        const totalDays = to.diff(from, 'day') + 1; // Include the start date
        updatedFormData.totalDays = totalDays;
      } else {
        updatedFormData.totalDays = ''; // Clear if invalid range
      }
    }
  
    setFormData(updatedFormData);
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
                <TextField
                  label="Leave Type"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="LeaveType"
                  value={formData.leaveType}
                  onChange={handleInputChange}
                  error={!!fieldErrors.leaveType}
                  helperText={fieldErrors.leaveType}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="From Date"
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

              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="To Date"
                      format="DD-MM-YYYY"
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      value={formData.toDate ? dayjs(formData.toDate) : null}
                      onChange={(newValue) => handleDateChange('toDate', newValue)}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <TextField
                  label="Total Days"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={formData.totalDays || ''}
                  disabled // Prevent manual input
                />
              </div>

              <div className="col-md-3 mb-3">
                <TextField
                  label="Leave Type"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="leave"
                  value={formData.leave}
                  onChange={handleInputChange}
                  error={!!fieldErrors.leave}
                  helperText={fieldErrors.leave}
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
export default LeaveRequest;
