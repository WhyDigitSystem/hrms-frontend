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
import {Checkbox, FormHelperText, FormControlLabel, MenuItem } from '@mui/material';

const LeaveType = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [editId, setEditId] = useState('');
  const [formData, setFormData] = useState({
    leaveType: '',
    leaveCode: '',
    leaveApplicable: '',
    totalLeave: '',
    effective: '',
    active: true
  });

  const [fieldErrors, setFieldErrors] = useState({
    leaveType: '',
    leaveCode: '',
    leaveApplicable: '',
    totalLeave: '',
    effective: '',
    active: ''
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'leaveType', header: 'Employe Name', size: 140 },
    { accessorKey: 'leaveCode', header: 'Employe Code', size: 140 },
    { accessorKey: 'noOfWorkingDaye', header: 'Leave Applicable', size: 140 },
    { accessorKey: 'totalLeave', header: 'No of Leaves', size: 140 },
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
          leaveType: particularCompany.leaveType,
          leaveCode: particularCompany.leaveCode,
          leaveApplicable: particularCompany.leaveApplicable,
          totalLeave: particularCompany.totalLeave,
          effective: particularCompany.effective,
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

  const handleCheckboxChange = (event) => {
    setFormData({
      ...formData,
      active: event.target.checked
    });
  };


  const handleClear = () => {
    setFormData({
      leaveType: '',
      leaveCode: '',
      leaveApplicable: '',
      totalLeave: '',
      effective: '',
      active: true
    });
    setFieldErrors({
      leaveType: '',
      leaveCode: '',
      leaveApplicable: '',
      totalLeave: '',
      effective: ''
    });
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.leaveType) {
      errors.leaveType = 'Employe Code is required';
    }
    if (!formData.leaveCode) {
      errors.leaveCode = 'Employe Code is required';
    }
    if (!formData.leaveApplicable) {
      errors.leaveApplicable = 'Leave Applicable is required';
    }
    if (!formData.totalLeave) {
      errors.totalLeave = 'No of Leaves is required';
    }
    if (!formData.effective) {
      errors.effective = 'effective is required';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);

      const saveData = {
        ...(editId && { id: editId }),
        active: formData.active,
        leaveType: formData.leaveType,
        leaveCode: formData.leaveCode,
        createdBy: loginUserName,
        leaveApplicable: formData.leaveApplicable,
        totalLeave: formData.totalLeave,
        effective: formData.effective,
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
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.leaveType}>
                  <InputLabel id="leaveType-label">Leave Type</InputLabel>
                  <Select labelId="leaveType-label" label="Employe Name" value={formData.leaveType} onChange={handleInputChange} name="leaveType">
                    {/* {Array.isArray(leaveTypeList) &&
                      leaveTypeList?.map((row) => (
                        <MenuItem key={row.id} value={row.leaveType}>
                          {row.leaveType}
                        </MenuItem>
                      ))} */}
                  </Select>
                  {fieldErrors.leaveType && <FormHelperText>{fieldErrors.leaveType}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Leave Code"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="leaveCode"
                  value={formData.leaveCode || ''}
                  onChange={handleInputChange}
                  error={!!fieldErrors.leaveCode}
                  helperText={fieldErrors.leaveCode}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.leaveApplicable}>
                  <InputLabel id="working-days-label">Leave Applicable</InputLabel>
                  <Select
                    labelId="working-days-label"
                    id="working-days"
                    name="leaveApplicable"
                    value={formData.leaveApplicable || ''}
                    onChange={handleInputChange}
                    label="Leave Applicable"  // Add this line
                  >
                    <MenuItem value="SICK">All</MenuItem>
                    <MenuItem value="CASUAL">Male</MenuItem>
                    <MenuItem value="EARNED">Female</MenuItem>
                  </Select>
                  {fieldErrors.leaveApplicable && <FormHelperText>{fieldErrors.leaveApplicable}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Total Leave"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="totalLeave"
                  value={formData.totalLeave || ''}
                  onChange={handleInputChange}
                  error={!!fieldErrors.totalLeave}
                  helperText={fieldErrors.totalLeave}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.effective}>
                  <InputLabel id="working-days-label">Effective</InputLabel>
                  <Select
                    labelId="working-days-label"
                    id="working-days"
                    name="effective"
                    value={formData.effective || ''}
                    onChange={handleInputChange}
                    label="Leave Applicable"  // Add this line
                  >
                    <MenuItem value="SICK">Monthly</MenuItem>
                    <MenuItem value="CASUAL">Quartely</MenuItem>
                    <MenuItem value="EARNED">Halfly</MenuItem>
                    <MenuItem value="EARNED">Yearly</MenuItem>
                  </Select>
                  {fieldErrors.effective && <FormHelperText>{fieldErrors.effective}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControlLabel
                  control={<Checkbox checked={formData.active} onChange={handleCheckboxChange} />}
                  label="Active"
                  labelPlacement="end"
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

export default LeaveType;
