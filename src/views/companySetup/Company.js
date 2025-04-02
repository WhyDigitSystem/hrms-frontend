import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import {
  Avatar,
  ButtonBase,
  FormHelperText,
  ListItemText,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import CommonListViewTable from '../basicMaster/CommonListViewTable';
import axios from 'axios';
import { useRef, useState, useMemo, useEffect } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import { getAllActiveCitiesByState, getAllActiveCountries, getAllActiveStatesByCountry, getAllActiveCurrency } from 'utils/CommonFunctions';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import apiCalls from 'apicall';
import dayjs from 'dayjs';

const Company = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [currencyList, setCurrencyList] = useState([]);
  const [editId, setEditId] = useState('');

  const [formData, setFormData] = useState({
    companyCode: '',
    companyName: '',
    ceo: '',
    address: '',
    currency: '',
    country: '',
    state: '',
    city: '',
    pincode: '',
    mobileNo: '',
    gstIn: '',
    panNo: '',
    leaveCreditControl: '',
    autoCreditDate: null,
    leavePolicy: '',
    weekOff: '',
    gstRegistered: true,
    active: true
  });

  const [fieldErrors, setFieldErrors] = useState({
    companyCode: '',
    ceo: '',
    address: '',
    currency: '',
    country: '',
    state: '',
    city: '',
    pincode: '',
    mobileNo: '',
    gstIn: '',
    panNo: '',
    leaveCreditControl: '',
    autoCreditDate: null,
    leavePolicy: '',
    weekOff: '',
    gstRegistered: true,
    active: true
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'companyCode', header: 'Company Code', size: 140 },
    {
      accessorKey: 'companyName',
      header: 'Company',
      size: 140
    },
    {
      accessorKey: 'ceo',
      header: 'CEO',
      size: 140
    },
    {
      accessorKey: 'gstIn',
      header: 'GST',
      size: 140
    },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  const [listViewData, setListViewData] = useState([]);
  useEffect(() => {
    getCompanyDetails();
    getAllCurrency();
    // getCompany();
    getAllCountries();
    if (formData.country) {
      getAllStates();
    }
    if (formData.state) {
      getAllCities();
    }
  }, [formData.country, formData.state]);

  const getAllCurrency = async () => {
    try {
      const currencyData = await getAllActiveCurrency(orgId);
      setCurrencyList(currencyData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };
  const getAllCountries = async () => {
    try {
      const countryData = await getAllActiveCountries(orgId);
      setCountryList(countryData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };
  const getAllStates = async () => {
    try {
      const stateData = await getAllActiveStatesByCountry(formData.country, orgId);
      setStateList(stateData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };
  const getAllCities = async () => {
    try {
      const cityData = await getAllActiveCitiesByState(formData.state, orgId);
      setCityList(cityData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked, selectionStart, selectionEnd, type } = e.target;

    if (name === 'weekOff') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: typeof value === 'string' ? value.split(',') : value // Ensure array format
      }));
      return;
    }

    // Regular expressions for validation
    const nameRegex = /^[A-Za-z ]*$/; // Allows only alphabetic characters and spaces
    const numericRegex = /^[0-9]*$/; // Allows only numeric characters
    const alphanumericRegex = /^[A-Za-z0-9]*$/; // Allows only alphanumeric characters

    let error = '';

    // Validation logic
    if (name === 'ceo') {
      if (!nameRegex.test(value)) {
        error = 'Only alphabetic characters are allowed';
      }
    } else if (name === 'pincode') {
      if (!numericRegex.test(value)) {
        error = 'Only numeric characters are allowed';
      } else if (value.length > 6) {
        error = 'Only 6 digits are allowed';
      }
    } else if (name === 'mobileNo') {
      if (!alphanumericRegex.test(value)) {
        error = 'Special characters are not allowed';
      } else if (value.length > 10) {
        error = 'Only 10 characters are allowed';
      }
    }

    // Handle errors if validation fails
    if (error) {
      setFieldErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error
      }));
    } else {
      // Clear previous error if input is valid
      setFieldErrors((prevErrors) => ({
        ...prevErrors,
        [name]: ''
      }));

      // Update the form data
      let updatedValue = value;

      if (name !== 'active') {
        updatedValue = value.toUpperCase();
      }

      if (type === 'checkbox') {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: checked
        }));
      } else {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: updatedValue
        }));
      }

      // Handle cursor position reset after input change (for text, email, and textarea)
      if (type === 'text' || type === 'textarea' || type === 'email') {
        setTimeout(() => {
          const inputElement = document.getElementsByName(name)[0];
          if (inputElement) {
            inputElement.setSelectionRange(selectionStart, selectionEnd);
          }
        }, 0);
      }
    }
  };

  const getCompanyById = async (row) => {
    console.log('THE SELECTED BRANCH ID IS:', row.original.id);
    setEditId(row.original.id);

    try {
      const response = await apiCalls('get', `commonmaster/company/${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const particularCompany = response.paramObjectsMap.companyVO[0];
        console.log('PARTICULAR COMPANY IS:', particularCompany);

        // Extract weekOffDays as an array
        const weekOffDays = particularCompany.companyWeekOffVO ? particularCompany.companyWeekOffVO.map((item) => item.weekOffDays) : [];

        setFormData({
          companyCode: particularCompany.companyCode,
          companyName: particularCompany.companyName,
          ceo: particularCompany.ceo,
          address: particularCompany.address,
          country: particularCompany.country,
          currency: particularCompany.currency,
          state: particularCompany.state,
          city: particularCompany.city,
          pincode: particularCompany.zip,
          mobileNo: particularCompany.phone,
          gstIn: particularCompany.gstIn,
          panNo: particularCompany.panNo,
          leaveCreditControl: particularCompany.leaveCreditControl,
          // autoCreditDate: particularCompany.autoCreditDate,
          autoCreditDate: particularCompany.autoCreditDate
            ? dayjs(particularCompany.autoCreditDate) // Convert to Dayjs object
            : null,
          leavePolicy: particularCompany.leavePolicy,
          gstRegistered: particularCompany.gstregistered === 'Active',
          active: particularCompany.active === 'Active',
          weekOff: weekOffDays // Setting week off days in form data
        });

        console.log('WEEK OFF DAYS:', weekOffDays);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // const getCompanyDetails = async () => {
  //   try {
  //     const response = await apiCalls('get', `commonmaster/company`);
  //     console.log('API Response:', response);

  //     if (response.status === true) {
  //       const particularCompany = response.paramObjectsMap.companyVO[0];
  //       setListViewData(response.paramObjectsMap.companyVO);
  //       console.log('THE LISTVIEW COMPANY IS:', particularCompany);

  //       setFormData({ ...formData, companyCode: particularCompany.companyCode, companyName: particularCompany.companyName });
  //     } else {
  //       console.error('API Error:', response);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //   }
  // };

  const getCompanyDetails = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/company`);
      console.log('API Response:', response);
  
      if (response.status === true) {
        const companyList = response.paramObjectsMap.companyVO;
        setListViewData(companyList);
  
        console.log('THE LISTVIEW COMPANY IS:', companyList);
  
        // Check if orgId exists and matches any company's id
        const matchedCompany = companyList.find(company => company.id === parseInt(orgId));
  
        if (matchedCompany) {
          console.log('MATCHED COMPANY ID FOUND:', matchedCompany.id);
          await getCompanyById({ original: { id: matchedCompany.id } }); // Call getCompanyById if match is found
        } else {
          console.log('No matching company found for the given orgId.');
        }
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleClear = () => {
    setFormData({
      // companyCode: '',
      ceo: '',
      address: '',
      currency: '',
      country: '',
      state: '',
      city: '',
      pincode: '',
      mobileNo: '',
      gstIn: '',
      panNo: '',
      leaveCreditControl: '',
      autoCreditDate: null,
      leavePolicy: '',
      weekOff: '',
      gstRegistered: true,
      active: true
    });
    setFieldErrors({
      // companyCode: '',
      ceo: '',
      address: '',
      currency: '',
      country: '',
      state: '',
      city: '',
      pincode: '',
      mobileNo: '',
      gstIn: '',
      panNo: '',
      leaveCreditControl: '',
      autoCreditDate: null,
      leavePolicy: '',
      weekOff: '',
    });
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.ceo) {
      errors.ceo = 'CEO is required';
    }
    if (!formData.address) {
      errors.address = 'Address is required';
    }
    if (!formData.country) {
      errors.country = 'Country is required';
    }
    if (!formData.state) {
      errors.state = 'State is required';
    }
    if (!formData.city) {
      errors.city = 'City is required';
    }
    if (!formData.mobileNo) {
      errors.mobileNo = 'Mobile No is required';
    } else if (formData.mobileNo.length < 10) {
      errors.mobileNo = 'Invalid mobileNo No';
    }
    if (formData.pincode.length < 6 && formData.pincode.length >= 1) {
      errors.pincode = 'Invalid Pincode';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveFormData = {
        // ...(editId && { id: editId }),
        id: orgId,
        active: formData.active,
        address: formData.address,
        cancel: true,
        ceo: formData.ceo,
        city: formData.city,
        companyCode: formData.companyCode,
        companyName: formData.companyName,
        companyWeekOffDTO: formData.weekOff?.map((day) => ({ weekOffDays: day })) || [],
        country: formData.country,
        createdBy: loginUserName,
        currency: formData.currency,
        gstIn: formData.gstIn,
        gstRegistered: formData.gstRegistered,
        leaveCreditControl: formData.leaveCreditControl,
        // autoCreditDate: formData.autoCreditDate,
        autoCreditDate: formData.autoCreditDate
          ? dayjs(formData.autoCreditDate).format('YYYY-MM-DD') // Convert to YYYY-MM-DD
          : null,
        leavePolicy: formData.leavePolicy,
        panNo: formData.panNo,
        phone: formData.mobileNo,
        state: formData.state,
        zip: formData.pincode
      };
      console.log('THE SAVE FORM DATA IS:', saveFormData);

      try {
          const response = await apiCalls('put', `commonmaster/updateCompany`, saveFormData);
          
        // if (editId) {
        //   // PUT request (update)
        //   response = await apiCalls('put', `commonmaster/updateCompany`, saveFormData);
        // } 
        // else {
        //   // POST request (create)
        //   response = await apiCalls('post', `commonmaster/company`, saveFormData);
        // }

        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', 'Company updated Successfully');
          handleClear();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Company updation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Company updation failed');

        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleView = () => {
    console.log('LIST VIEW DATAS ARE:', listViewData);

    setListView(!listView);
  };

  const handleDateChange = (field, newValue) => {
    if (newValue.isValid()) {
      setFormData((prev) => ({
        ...prev,
        [field]: newValue
      }));
    }
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            {/* <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} /> */}
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={() => handleSave()} margin="0 10px 0 10px" />
          </div>
        </div>
        {listView ? (
          <div className="mt-4">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              // editCallback={editEmployee}
              enableEditing={true}
              blockEdit={true} // DISAPLE THE MODAL IF TRUE
              toEdit={getCompanyById}
            />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <TextField
                  label="Company Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="companyName"
                  value={formData.companyName}
                  disabled
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Code"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="companyCode"
                  value={formData.companyCode}
                  onChange={handleInputChange}
                  // error={!!fieldErrors.companyCode}
                  // helperText={fieldErrors.companyCode}
                  disabled
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="CEO"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="ceo"
                  value={formData.ceo}
                  onChange={handleInputChange}
                  error={!!fieldErrors.ceo}
                  helperText={fieldErrors.ceo}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Address"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  error={!!fieldErrors.address}
                  helperText={fieldErrors.address}
                />
              </div>

              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.country}>
                  <InputLabel id="country-label">Country</InputLabel>
                  <Select labelId="country-label" label="Country" value={formData.country} onChange={handleInputChange} name="country">
                    {Array.isArray(countryList) &&
                      countryList?.map((row) => (
                        <MenuItem key={row.id} value={row.countryName}>
                          {row.countryName}
                        </MenuItem>
                      ))}
                  </Select>
                  {fieldErrors.country && <FormHelperText>{fieldErrors.country}</FormHelperText>}
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.state}>
                  <InputLabel id="state-label">State</InputLabel>
                  <Select labelId="state-label" label="State" value={formData.state} onChange={handleInputChange} name="state">
                    {stateList?.map((row) => (
                      <MenuItem key={row.id} value={row.stateName}>
                        {row.stateName}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.state && <FormHelperText>{fieldErrors.state}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.state}>
                  <InputLabel id="city-label">City</InputLabel>
                  <Select labelId="city-label" label="City" value={formData.city} onChange={handleInputChange} name="city">
                    {cityList?.map((row) => (
                      <MenuItem key={row.id} value={row.cityName}>
                        {row.cityName}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.city && <FormHelperText>{fieldErrors.city}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.currency}>
                  <InputLabel id="currency-label">Currency</InputLabel>
                  <Select labelId="currency-label" label="currency" value={formData.currency} onChange={handleInputChange} name="currency">
                    {currencyList?.map((row) => (
                      <MenuItem key={row.id} value={row.currency}>
                        {row.currency}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.currency && <FormHelperText>{fieldErrors.currency}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Pincode"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="pincode"
                  value={formData.pincode}
                  maxLength={6}
                  onChange={handleInputChange}
                  error={!!fieldErrors.pincode}
                  helperText={fieldErrors.pincode}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Mobile No"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleInputChange}
                  error={!!fieldErrors.mobileNo}
                  helperText={fieldErrors.mobileNo}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="GST In"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="gstIn"
                  value={formData.gstIn}
                  onChange={handleInputChange}
                  error={!!fieldErrors.gstIn}
                  helperText={fieldErrors.gstIn}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="PAN No"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="panNo"
                  value={formData.panNo}
                  onChange={handleInputChange}
                  error={!!fieldErrors.panNo}
                  helperText={fieldErrors.panNo}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.leaveCreditControl}>
                  <InputLabel id="leaveCreditControl">Leave Credit Control</InputLabel>
                  <Select
                    labelId="leaveCreditControl"
                    id="leaveCreditControl"
                    name="leaveCreditControl"
                    value={formData.leaveCreditControl || ''}
                    onChange={handleInputChange}
                    label="Leave Credit Control" // Add this line
                  >
                    <MenuItem value="MONTHLY">MONTHLY</MenuItem>
                    <MenuItem value="QUARTERLY">QUARTERLY</MenuItem>
                    <MenuItem value="HALF YEARLY">HALF YEARLY</MenuItem>
                    <MenuItem value="YEARLY">YEARLY</MenuItem>
                  </Select>
                  {fieldErrors.leaveCreditControl && <FormHelperText>{fieldErrors.leaveCreditControl}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Auto Credit Date"
                      format="DD-MM-YYYY"
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      value={formData.autoCreditDate}
                      onChange={(newValue) => handleDateChange('autoCreditDate', newValue)}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.leavePolicy}>
                  <InputLabel id="leavePolicy">Leave Policy</InputLabel>
                  <Select
                    labelId="leavePolicy"
                    id="leavePolicy"
                    name="leavePolicy"
                    value={formData.leavePolicy || ''}
                    onChange={handleInputChange}
                    label="Leave Policy" // Add this line
                  >
                    <MenuItem value="REGULAR">REGULAR</MenuItem>
                    <MenuItem value="SANDWICH ">SANDWICH</MenuItem>
                  </Select>
                  {fieldErrors.leavePolicy && <FormHelperText>{fieldErrors.leavePolicy}</FormHelperText>}
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.weekOff}>
                  <InputLabel id="weekOff">Week Off</InputLabel>
                  <Select
                    labelId="weekOff"
                    label="Week Off"
                    id="weekOff"
                    name="weekOff"
                    multiple // Enable multi-select
                    value={formData.weekOff || []} // Ensure it's an array
                    onChange={handleInputChange}
                    renderValue={(selected) => selected.join(', ')} // Display selected values as comma-separated
                  >
                    {['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map((day) => (
                      <MenuItem key={day} value={day}>
                        {day}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.weekOff && <FormHelperText>{fieldErrors.weekOff}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControlLabel
                  control={<Checkbox checked={formData.gstRegistered} onChange={handleInputChange} name="gstRegistered" />}
                  label="Gst Registered"
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControlLabel
                  control={<Checkbox checked={formData.active} onChange={handleInputChange} name="active" />}
                  label="Active"
                />
              </div>
            </div>
          </>
        )}
      </div>
      <ToastComponent />
    </>
  );
};

export default Company;
