import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import apiCalls from 'apicall';
import { useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import { encryptPassword } from 'views/utilities/encryptPassword';
import { FormHelperText } from '@mui/material';

const AttendenceProcess = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [editId, setEditId] = useState('');
  const [formData, setFormData] = useState({
    employeName: '',
    employeCode: '',
    fromDate: '',
    toDate: '',
    noOfWorkingDays: '',
    noOfLeaves: '',
    month: '',
    active: true
  });

  const [fieldErrors, setFieldErrors] = useState({
    employeName: '',
    employeCode: '',
    fromDate: '',
    toDate: '',
    noOfWorkingDays: '',
    noOfLeaves: '',
    month: '',
    active: ''
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'employeName', header: 'Employe Name', size: 140 },
    { accessorKey: 'employeCode', header: 'Employe Code', size: 140 },
    { accessorKey: 'fromDate', header: 'From Date', size: 140 },
    { accessorKey: 'toDate', header: 'To Date', size: 140 },
    { accessorKey: 'noOfWorkingDaye', header: 'No of Working Days', size: 140 },
    { accessorKey: 'noOfLeaves', header: 'No of Leaves', size: 140 },
    // { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  const [listViewData, setListViewData] = useState([]);


  const getCompanyById = async (row) => {
    console.log('THE SELECTED COMPANY ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `commonmaster/company/${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const particularCompany = response.paramObjectsMap.companyVO[0];
        console.log('THE PARTICULAR COMPANY DETAILS ARE:', particularCompany);

        setFormData({
          employeName: particularCompany.employeName,
          employeCode: particularCompany.employeCode,
          fromDate: particularCompany.employeeName,
          toDate: particularCompany.email,
          noOfWorkingDays: particularCompany.noOfWorkingDays,
          noOfLeaves: particularCompany.noOfLeaves,
          month: particularCompany.month,
          active: particularCompany.active === 'Active' ? true : false
        });
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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

    // Perform additional validation if both dates are set
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

  const handleInputChange = (e) => {
    const { name, value, checked, selectionStart, selectionEnd, type } = e.target;

    let updatedValue = type === 'checkbox' ? checked : value;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: updatedValue,
    }));

    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));

    if (type === 'text' || type === 'email' || type === 'textarea') {
      setTimeout(() => {
        const inputElement = document.getElementsByName(name)[0];
        if (inputElement) {
          inputElement.setSelectionRange(selectionStart, selectionEnd);
        }
      }, 0);
    }
  };


  const handleClear = () => {
    setFormData({
      employeName: '',
      employeCode: '',
      fromDate: '',
      toDate: '',
      noOfWorkingDays: '',
      noOfLeaves: '',
      month: '',
      active: true
    });
    setFieldErrors({
      employeName: '',
      employeCode: '',
      fromDate: '',
      toDate: '',
      noOfWorkingDays: '',
      noOfLeaves: '',
      month: ''
    });
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.employeName) {
      errors.employeName = 'Employe Code is required';
    }
    if (!formData.employeCode) {
      errors.employeCode = 'Employe Code is required';
    }
    if (!formData.fromDate) {
      errors.fromDate = 'From Date is required';
    }
    if (!formData.toDate) {
      errors.toDate = 'To Date is required';
    }
    if (!formData.noOfWorkingDays) {
      errors.noOfWorkingDays = 'No of Working Days is required';
    }
    if (!formData.noOfLeaves) {
      errors.noOfLeaves = 'No of Leaves is required';
    }
    if (!formData.month) {
      errors.month = 'Month is required';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);

      const saveData = {
        ...(editId && { id: editId }),
        active: formData.active,
        employeName: formData.employeName,
        employeCode: formData.employeCode,
        createdBy: loginUserName,
        noOfWorkingDays: formData.noOfWorkingDays,
        toDate: formData.toDate,
        fromDate: formData.fromDate,
        noOfLeaves: formData.noOfLeaves,
        month: formData.month,
        orgId: orgId
      };
      console.log('DATA TO SAVE IS:', saveData);

      try {
        const method = editId ? 'put' : 'post';
        const url = editId ? 'commonmaster/updateCompany' : 'commonmaster/company';

        const response = await apiCalls(method, url, saveData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? ' Company Updated Successfully' : 'Company created successfully');

          handleClear();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Company creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Company creation failed');

        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleView = () => {
    setListView(!listView);
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
              toEdit={getCompanyById}
            />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.employeName}>
                  <InputLabel id="employeName-label">Employe Name</InputLabel>
                  <Select labelId="employeName-label" label="Employe Name" value={formData.employeName} onChange={handleInputChange} name="employeName">
                    {/* {Array.isArray(employeNameList) &&
                      employeNameList?.map((row) => (
                        <MenuItem key={row.id} value={row.employeName}>
                          {row.employeName}
                        </MenuItem>
                      ))} */}
                  </Select>
                  {fieldErrors.employeName && <FormHelperText>{fieldErrors.employeName}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Employee Code"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="employeCode"
                  value={formData.employeCode || ''}
                  onChange={handleInputChange}
                  error={!!fieldErrors.employeCode}
                  helperText={fieldErrors.employeCode}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled" size="small" sx={{ minWidth: '120px' }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="From Date"
                      value={formData.fromDate ? dayjs(formData.fromDate) : null}
                      onChange={(date) => handleDateChange('fromDate', date)}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD-MM-YYYY"
                      error={fieldErrors.fromDate}
                      helperText={fieldErrors.fromDate ? 'This field is required' : ''}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled" size="small">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="To Date"
                      value={formData.toDate ? dayjs(formData.toDate) : null}
                      onChange={(date) => handleDateChange('toDate', date)}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD-MM-YYYY"
                      error={fieldErrors.toDate}
                      helperText={fieldErrors.toDate ? 'This field is required' : ''}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="No of Working Days"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="noOfWorkingDays"
                  value={formData.noOfWorkingDays}
                  onChange={handleInputChange}
                  error={!!fieldErrors.noOfWorkingDays}
                  helperText={fieldErrors.noOfWorkingDays}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="No of Leaves"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="noOfLeaves"
                  value={formData.noOfLeaves}
                  onChange={handleInputChange}
                  error={!!fieldErrors.noOfLeaves}
                  helperText={fieldErrors.noOfLeaves}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Month"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  error={!!fieldErrors.month}
                  helperText={fieldErrors.month}
                />
              </div>
              {/* <div className="col-md-3 mb-3">
                <FormControlLabel
                  control={<Checkbox checked={formData.active} onChange={handleInputChange} name="active" />}
                  label="Active"
                />
              </div> */}
            </div>
          </>
        )}
      </div>
      <ToastContainer />
    </>
  );
};

export default AttendenceProcess;
