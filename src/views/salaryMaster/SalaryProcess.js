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
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import { Button } from '@mui/material';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import { FormHelperText, MenuItem } from '@mui/material';
import { date } from 'yup';

const SalaryProcess = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [editId, setEditId] = useState('');
  const [branchList, setBranchList] = useState([]);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    holidayDate: '',
    day: '',
    festival: '',
    branchName: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    holidayDate: '',
    day: '',
    festival: '',
    branchName: ''
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'holidayDate', header: 'Holiday Date', size: 140 }, // Check correct field name
    { accessorKey: 'day', header: 'Day', size: 140 },
    { accessorKey: 'festival', header: 'Festival', size: 140 },
    { accessorKey: 'branchName', header: 'Branch Name', size: 140 }
  ];

  const [listViewData, setListViewData] = useState([]);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const years = Array.from({ length: 10 }, (_, index) => currentYear - index);

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const handleSearch = () => {
    console.log('Search button clicked');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('File uploaded:', file.name);
      // Handle file processing here
    }
  };

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
          holidayDate: holiday.holidayDate ? dayjs(holiday.holidayDate).format('YYYY-MM-DD') : ''
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
          branchName: holidayDetails.branchName
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
      branchName: ''
    });
    setFieldErrors({
      holidayDate: '',
      day: '',
      festival: '',
      branchName: ''
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
          {/* Select Month */}
          <div className="col-md-3 mb-3">
            <FormControl fullWidth size="small">
              <InputLabel>Select Month</InputLabel>
              <Select label="Select Month" value={month} onChange={handleMonthChange}>
                {months.map((m, index) => (
                  <MenuItem key={index} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          {/* Select Year */}
          <div className="col-md-3 mb-3">
            <FormControl fullWidth size="small">
              <InputLabel>Select Year</InputLabel>
              <Select label="Select Year" value={year} onChange={handleYearChange}>
                {years.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>

        {/* Search and Upload Buttons */}
        <div className="col-md-3 mb-3 d-flex align-items-center gap-2">
          <Button variant="contained" color="primary" onClick={handleSearch}>
            Search
          </Button>
          <Button variant="contained" color="primary" component="label">
            Upload File
            <input type="file" hidden onChange={handleFileUpload} />
          </Button>
        </div>

        <>
          <div className="row d-flex ml">
            <div className="row mt-2">
              <div className="col-lg-12">
                <div className="table-responsive">
                  <table className="table table-bordered ">
                    <thead>
                      <tr style={{ backgroundColor: '#673AB7' }}>
                        <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                          Employee Name
                        </th>
                        <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                          Employee Code
                        </th>
                        <th className="px-2 py-2 text-white text-center" style={{ width: '250px' }}>
                          Days in Month
                        </th>
                        <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                          Total Working Days
                        </th>
                        <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                          No of Leaves
                        </th>
                        <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                          LOP
                        </th>
                        <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                          Gross pay
                        </th>
                        <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                          Net pay
                        </th>
                      </tr>
                    </thead>
                    {/* <tbody>
                                  {earningDetailsData.map((row, index) => (
                                    <tr key={row.id}>
                                      <td className="border px-2 py-2 text-center">
                                        <ActionButton
                                          title="Delete"
                                          icon={DeleteIcon}
                                          onClick={() =>
                                            handleDeleteRow(
                                              row.id,
                                              earningDetailsData,
                                              setEarningDetailsData,
                                              earningDetailsDataErrors,
                                              setEarningDetailsDataErrors
                                            )
                                          }
                                        />
                                      </td>
                                      <td className="text-center">
                                        <div className="pt-2">{index + 1}</div>
                                      </td>
                                      <td className="border px-2 py-2">
                                        <select
                                          value={row.heading}
                                          onChange={(e) => handleSalaryHeadChange(row, index, e, 'EARNING')}
                                          className={earningDetailsDataErrors[index]?.heading ? 'error form-control' : 'form-control'}
                                        >
                                          <option value="">Select Option</option>
                                          {salaryHeadsType
                                            .filter((head) => head.type === 'EARNING')
                                            .map((head) => (
                                              <option key={head.id} value={head.heading}>
                                                {head.heading}
                                              </option>
                                            ))}
                                        </select>

                                        {earningDetailsDataErrors[index]?.heading && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {earningDetailsDataErrors[index].heading}
                                          </div>
                                        )}
                                      </td>
                                      <td>
                                        <input
                                          type="text"
                                          value={row.amount}
                                          onChange={(e) => {
                                            const amount = e.target.value;

                                            setEarningDetailsData((prev) => prev.map((r) => (r.id === row.id ? { ...r, amount } : r)));

                                            setEarningDetailsDataErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                amount: !amount ? 'Amount is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          }}
                                          className={earningDetailsDataErrors[index]?.amount ? 'error form-control' : 'form-control'}
                                          onKeyDown={(e) => handleKeyDown(e, row, earningDetailsData)}
                                        />
                                        {earningDetailsDataErrors[index]?.amount && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {earningDetailsDataErrors[index].amount}
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody> */}
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      </div>
      <ToastContainer />
    </>
  );
};

export default SalaryProcess;
