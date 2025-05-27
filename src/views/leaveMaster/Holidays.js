import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import apiCalls from 'apicall';
import { useState, useEffect } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import UploadIcon from '@mui/icons-material/Upload';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import CommonBulkUpload from 'utils/CommonBulkUpload';
import { FormHelperText, MenuItem, Autocomplete } from '@mui/material';
import { date } from 'yup';

const Holidays = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [editId, setEditId] = useState('');
  const [branchList, setBranchList] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [formData, setFormData] = useState({
    holidayDate: '',
    day: '',
    festival: '',
    branchName: '',
  });

  const [fieldErrors, setFieldErrors] = useState({
    holidayDate: '',
    day: '',
    festival: '',
    branchName: '',
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'holidayDate', header: 'Holiday Date', size: 140 }, // Check correct field name
    { accessorKey: 'day', header: 'Day', size: 140 },
    { accessorKey: 'festival', header: 'Festival', size: 140 },
    { accessorKey: 'branchName', header: 'Branch Name', size: 140 }
  ];

  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    getAllHolidayByOrgId();
    getAllBranches();
  }, []);

  const getAllBranches = async () => {
    try {
      const branchData = await getAllActiveBranches(orgId);
      setBranchList(branchData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };
  // List API
  const getAllHolidayByOrgId = async () => {
    try {
      const response = await apiCalls('get', `/basicmaster/getAllHolidayByOrgId?orgId=${orgId}`);

      if (response.status === true) {
        const formattedData = response.paramObjectsMap.holidayVO.map((holiday) => ({
          ...holiday,
          holidayDate: holiday.holidayDate ? dayjs(holiday.holidayDate).format('YYYY-MM-DD') : '',
        }));

        setListViewData(formattedData);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };




  // Edit API
  const getHolidayById = async (row) => {
    console.log('THE SELECTED HOLIDAY ID IS:', row.original.id);
    setEditId(row.original.id);

    try {
      const response = await apiCalls('get', `/basicmaster/getHolidayById?id=${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const holidayDetails = response.paramObjectsMap.holidayVO;
        console.log('HOLIDAY DETAILS:', holidayDetails);

        setFormData({
          holidayDate: holidayDetails.holidayDate ? dayjs(holidayDetails.holidayDate).format('YYYY-MM-DD') : '', // Ensure correct format
          day: holidayDetails.day,
          festival: holidayDetails.festival,
          branchName: holidayDetails.branchName,
        });
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  const handleInputChange = (e) => {
    const { name, value, checked, type, selectionStart, selectionEnd } = e.target;
    const nameRegex = /^[A-Za-z ]*$/;
    const codeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;
    setFormData((prevData) => ({ ...prevData, [name]: value.toUpperCase() }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));

    let errorMessage = '';

    if (name === 'employeeName' && !codeRegex.test(value)) {
      errorMessage = 'Invalid Format';
    } else if (name === 'employeeCode' && !codeRegex.test(value)) {
      errorMessage = 'Invalid Format';
    }

    if (errorMessage) {
      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }));
    } else {
      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));

      if (name === 'branch') {
        const selectedBranch = branchList.find((br) => br.branch === value);
        setFormData((prevData) => ({
          ...prevData,
          branch: value,
          branchCode: selectedBranch ? selectedBranch.branchCode : ''
        }));
      } else if (type === 'checkbox') {
        setFormData((prevData) => ({ ...prevData, [name]: checked }));
      } else {
        let inputValue = value;

        if (name === 'email') {
          inputValue = value.toLowerCase();
        } else if (type === 'text' || type === 'textarea') {
          inputValue = value.toUpperCase();
        }

        setFormData((prevData) => ({ ...prevData, [name]: inputValue }));

        // Check if input type is text or textarea before calling setSelectionRange
        if (type === 'text' || type === 'textarea') {
          setTimeout(() => {
            const inputElement = document.getElementsByName(name)[0];
            if (inputElement && inputElement.setSelectionRange) {
              inputElement.setSelectionRange(selectionStart, selectionEnd);
            }
          }, 0);
        }
      }
    }
  };

  const handleClear = () => {
    setFormData({
      holidayDate: '',
      day: '',
      festival: '',
      branchName: '',
    });
    setFieldErrors({
      holidayDate: '',
      day: '',
      festival: '',
      branchName: '',
    });
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};

    if (!formData.branchName) {
      errors.branchName = 'Branch Name is required';
    }
    if (!formData.holidayDate) {
      errors.holidayDate = 'Holiday Date is required';
    }
    if (!formData.day) {
      errors.day = 'Day is required';
    }
    if (!formData.festival) {
      errors.festival = 'Festival is required';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveData = {
        ...(editId && { id: editId }),
        active: formData.active,
        branchName: formData.branchName,
        holidayDate: formData.holidayDate, // Fix: Ensure correct field name
        createdBy: loginUserName,
        day: formData.day,
        festival: formData.festival,
        orgId: orgId
      };

      console.log('DATA TO SAVE IS:', saveData);

      // save API
      try {
        const response = await apiCalls('put', '/basicmaster/createUpdateHolidays', saveData);

        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? ' Holidays Updated Successfully' : 'Holidays created successfully');

          handleClear();
          getAllHolidayByOrgId();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Holidays creation failed');
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

  const handleDateChange = (newValue) => {
    if (!newValue || !dayjs(newValue).isValid()) {
      setFieldErrors((prev) => ({ ...prev, holidayDate: 'Invalid Date' }));
      return;
    }

    const selectedDate = dayjs(newValue);
    const formattedDate = selectedDate.format('YYYY-MM-DD'); // Ensure correct storage format

    setFormData((prev) => ({
      ...prev,
      holidayDate: formattedDate,
      day: selectedDate.format('dddd') // Extract day name correctly
    }));

    setFieldErrors((prev) => ({ ...prev, holidayDate: '' })); // Clear error if valid
  };

  const handleBulkUploadOpen = () => {
    setUploadOpen(true);
  };

  const handleBulkUploadClose = () => {
    setUploadOpen(false);
  };
  const handleSubmit = async () => {
    console.log('Submit clicked');
    handleBulkUploadClose();
  };

  const handleFileUpload = (event) => {
    console.log(event.target.files[0]);
  };


  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} />
            <ActionButton title="Save" icon={UploadIcon} isLoading={isLoading} onClick={handleBulkUploadOpen} margin="0 10px 0 10px" />
            {uploadOpen && (
              <CommonBulkUpload
                open={uploadOpen}
                handleClose={handleBulkUploadClose}
                dialogTitle="Upload Files"
                uploadText="Upload File"
                onSubmit={handleSubmit}
                handleFileUpload={handleFileUpload}
                apiUrl="/basicmaster/excelUploadForHolidays"
                screen="HolidayReport"
                loginUser={loginUserName}
                orgId={orgId}
              />
            )}
          </div>
        </div>
        {listView ? (
          <div className="mt-0">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              // editCallback={editEmployee}
              blockEdit={true} // DISAPLE THE MODAL IF TRUE
              toEdit={getHolidayById}
              enableEditing={true}
            />
          </div>
        ) : (
          <>
            <div className="row">

              {/* Holiday Date  */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date"
                      format="DD-MM-YYYY"
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      value={formData.holidayDate ? dayjs(formData.holidayDate, 'YYYY-MM-DD') : null}
                      onChange={handleDateChange}
                    // onChange={(newValue) => setFormData({ ...formData, date: newValue })}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>


              {/* Day */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Day"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="day"
                  value={formData.day}
                  onChange={handleInputChange}
                  error={!!fieldErrors.day}
                  helperText={fieldErrors.day}
                />
              </div>

              {/* Festival */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Festival"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="festival"
                  value={formData.festival}
                  onChange={handleInputChange}
                  error={!!fieldErrors.festival}
                  helperText={fieldErrors.festival}
                />
              </div>
              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={branchList}
                  getOptionLabel={(option) => option.branch || ""}
                  sx={{ width: "100%" }}
                  size="small"
                  value={branchList.find((c) => c.branch === formData.branchName) || null}
                  onChange={(event, newValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      branchName: newValue ? newValue.branch : "",
                    }));
                    setFieldErrors((prevErrors) => ({
                      ...prevErrors,
                      branchName: "",
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Branch"
                      name="branchName"
                      error={Boolean(fieldErrors.branchName)}
                      helperText={fieldErrors.branchName || ""}
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 },
                      }}
                    />
                  )}
                />
              </div>
              {/* <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.branchName}>
                  <InputLabel id="branchName-label">Branch</InputLabel>
                  <Select labelId="branchName-label" label="Branch" value={formData.branchName} onChange={handleInputChange} name="branchName">
                    {branchList?.map((row) => (
                      <MenuItem key={row.id} value={row.branch}>
                        {row.branch}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.branchName && <FormHelperText>{fieldErrors.branchName}</FormHelperText>}
                </FormControl>
              </div> */}
            </div>
          </>
        )}
      </div>
      <ToastContainer />
    </>
  );
};

export default Holidays;
