import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import apiCalls from 'apicall';
import { useState, useEffect } from 'react';
import CommonBulkUpload from 'utils/CommonBulkUpload';
import { Typography } from '@mui/material';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
// import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';


const AttendenceProcess = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [value, setValue] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  // const [isHidden, setIsHidden] = useState(false);
  const [formData, setFormData] = useState({
    fromDate: null,
    toDate: null
  });

  const [fieldErrors, setFieldErrors] = useState({
    fromDate: null,
    toDate: null
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'employeeName', header: 'Employe Name', size: 140 },
    { accessorKey: 'employeeCode', header: 'Employe Code', size: 140 },
    { accessorKey: 'totalCompanyWorkingDays', header: 'Total Company Working Days', size: 140 },
    { accessorKey: 'totalLeave', header: 'Total Leave', size: 140 },
    { accessorKey: 'empTotalWorkingDays', header: 'Emp Total Working Days', size: 140 },
    { accessorKey: 'empSalaryDays', header: 'Emp Salary Days', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 },
  ];
  const [allLeave, setAllLeave] = useState([]);

  useEffect(() => {
    getLeaveProcessByOrgId();
  }, []);

  const getLeaveProcessByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/leaveprocess/getLeaveProcessByOrgId?orgId=${orgId}&branchCode=${branchCode}`);
      if (result && result.paramObjectsMap && result.paramObjectsMap.leaveProcessVO.reverse()) {
        setListViewData(result.paramObjectsMap.leaveProcessVO.reverse());
      } else {
        setListViewData([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setListViewData([]);
    }
  };

  // const getAllLeaveProcess = async () => {
  //   if (!formData.fromDate || !formData.toDate) {
  //     setFieldErrors({ fromDate: !formData.fromDate, toDate: !formData.toDate });
  //     return;
  //   }

  //   try {
  //     const response = await apiCalls(
  //       'get',
  //       `leaveprocess/getLeaveDetailsForLeaveProcess?fromDate=${formData.fromDate}&orgId=${orgId}&toDate=${formData.toDate}`
  //     );

  //     if (response.status === true) {
  //       setAllLeave(response.paramObjectsMap.leaveProcessVO);
  //       setListViewData(response.paramObjectsMap.leaveProcessVO);
  //     } else {
  //       console.error('API Error:', response);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //   }
  // };

  const getAllLeaveProcess = async () => {
    if (!formData.fromDate || !formData.toDate) {
      setFieldErrors({ fromDate: !formData.fromDate, toDate: !formData.toDate });
      return;
    }
  
    try {
      const response = await apiCalls(
        'get',
        `leaveprocess/getLeaveDetailsForLeaveProcess?fromDate=${formData.fromDate}&orgId=${orgId}&toDate=${formData.toDate}`
      );
  
      if (response.status === true && Array.isArray(response.paramObjectsMap.leaveProcessVO)) {
        const formattedData = response.paramObjectsMap.leaveProcessVO.map(item => ({
          ...item,
          totalLeave: parseFloat(item.totalLeave).toString(),
          lopLeave: parseFloat(item.lopLeave).toString(),
          empSalaryDays: parseFloat(item.empSalaryDays).toString(),
          empTotalWorkingDays: parseFloat(item.empTotalWorkingDays).toString()
        }));
  
        setAllLeave(formattedData);
        setListViewData(formattedData);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };  

  const handleDateChange = (name, date) => {
    if (date && dayjs(date).isValid()) {
      const dateString = dayjs(date).format('YYYY-MM-DD'); // Ensure correct format
      setFormData((prev) => ({ ...prev, [name]: dateString }));
      setFieldErrors((prev) => ({ ...prev, [name]: false }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: null }));
      setFieldErrors((prev) => ({ ...prev, [name]: true }));
    }
  };

  const handleClear = () => {
    setFormData({
      fromDate: null,
      toDate: null
    });
    setFieldErrors({
      fromDate: null,
      toDate: null
    });
    setAllLeave([])
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleSave = async () => {
    const errors = {};

    // Validate required fields
    if (!formData.fromDate) {
      errors.fromDate = 'From Date is required';
    }
    if (!formData.toDate) {
      errors.toDate = 'To Date is required';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);

      const saveData = allLeave.map((leave) => ({
        active: true,
        createdBy: loginUserName,
        empSalaryDays: leave.empSalaryDays,
        empTotalWorkingDays: leave.empTotalWorkingDays,
        employeeCode: leave.employeeCode,
        employeeName: leave.employeeName,
        lopLeave: leave.lopLeave,
        month: leave.month,
        orgId: orgId,
        totalCompanyWorkingDays: leave.totalCompanyWorkingDays,
        totalLeave: leave.totalLeave,
        year: leave.year,
        branch: branch,
        branchCode: branchCode,
      }));

      console.log('DATA TO SAVE IS:', saveData);

      try {
        const response = await apiCalls('put', '/leaveprocess/createUpdateLeaveProcess', saveData);

        if (response.status === true) {
          console.log('Response:', response);

          // Ensure correct toast usage
          showToast('success', 'Attendance Process created successfully');

          handleClear(); // Clear form after success
        } else {
          showToast('error', response.paramObjectsMap?.errorMessage || 'Attendance Process creation failed');
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Attendance Process creation failed');
      } finally {
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleView = () => {
    // setIsHidden(!isHidden);
    setListView(!listView);
    if (!listView) {
      getAllLeaveProcess(); // Fetch data when switching to List View
    }
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
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px 0 10px" />
          </div>
        </div>
        {listView && (
          <div className="mt-4">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              blockEdit={true} // Disable modal if true
              toEdit={true}
              enableEditing={true}
            />
          </div>
        )}
        {!listView && (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled" size="small">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="From Date"
                      value={formData.fromDate ? dayjs(formData.fromDate) : null}
                      onChange={(date) => handleDateChange('fromDate', date)}
                      format="DD-MM-YYYY"
                      slotProps={{ textField: { size: 'small', clearable: true } }}
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
                      format="DD-MM-YYYY"
                      slotProps={{ textField: { size: 'small', clearable: true } }}
                      error={fieldErrors.toDate}
                      helperText={fieldErrors.toDate ? 'This field is required' : ''}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-2">
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={getAllLeaveProcess}
                  disabled={!formData.fromDate || !formData.toDate}
                >
                  Search
                </Button>
              </div>
              <div className="col-md-2">
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={() => {
                    setFormData({ ...formData, fromDate: null, toDate: null });
                    setFieldErrors({ ...fieldErrors, fromDate: false, toDate: false });
                    setAllLeave([]);
                  }}
                >
                  Cancel
                </Button>
              </div>
              <div className="col-md-3">
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
                    <Button
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                      sx={{
                        background: 'linear-gradient(90deg, #3f51b5, #5c6bc0)',
                        color: '#fff',
                        fontWeight: 'bold',
                        height: '40px',
                        px: 4,
                        py: 1,
                        borderRadius: 2,
                        boxShadow: '0px 4px 8px rgba(63, 81, 181, 0.2)',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #3949ab, #536dfe)',
                          boxShadow: '0px 6px 12px rgba(63, 81, 181, 0.3)',
                        },
                      }}
                      onClick={handleBulkUploadOpen}
                    >
                      Upload Excel
                    </Button>
                  </Typography>
                </Box>
              </div>
            </div>
            {uploadOpen && (
              <CommonBulkUpload
                open={uploadOpen}
                handleClose={handleBulkUploadClose}
                dialogTitle="Upload Files"
                uploadText="Upload File"
                onSubmit={handleSubmit}
                handleFileUpload={handleFileUpload}
                apiUrl="/leaveprocess/uploadLeaveProcess"
                screen="AttendenceProcess"
                loginUser={loginUserName}
                orgId={orgId}
              />
            )}
            <div className="row">
              <Box sx={{ width: '100%' }}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  textColor="secondary"
                  indicatorColor="secondary"
                  aria-label="secondary tabs example"
                >
                  <Tab value={0} label="Leave" />
                </Tabs>
              </Box>
              <Box sx={{ padding: 2 }}>
                {value === 0 && (
                  <>
                    <div className="row d-flex ml">
                      {allLeave.length > 0 && allLeave[0] && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <p className="font-weight-bold" style={{ fontSize: '20px' }}>
                              <strong>
                                {dayjs()
                                  .month(allLeave[0]?.month - 1)
                                  .format('MMMM')}{' '}
                                {allLeave[0]?.year} - The company working days is {allLeave[0]?.totalCompanyWorkingDays}
                              </strong>
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="row mt-2">
                        <div className="col-lg-12">
                          <div className="table-responsive">
                            <table className="table table-bordered">
                              <thead>
                                <tr style={{ backgroundColor: '#673AB7' }}>
                                  <th className="px-2 py-2 text-white text-center">S.No</th>
                                  <th className="px-2 py-2 text-white text-center">Employee Name</th>
                                  <th className="px-2 py-2 text-white text-center">Employee Code</th>
                                  <th className="px-2 py-2 text-white text-center">Total Leave</th>
                                  <th className="px-2 py-2 text-white text-center">LOP (Loss of Pay)</th>
                                  <th className="px-2 py-2 text-white text-center">Total Employee Working Days</th>
                                  <th className="px-2 py-2 text-white text-center">Total Working Days</th>
                                </tr>
                              </thead>
                              <tbody>
                                {allLeave.length > 0 ? (
                                  allLeave.map((leave, index) => (
                                    <tr key={index}>
                                      <td className="text-center">{index + 1}</td>
                                      <td className="text-center">{leave.employeeName}</td>
                                      <td className="text-center">{leave.employeeCode}</td>
                                      <td className="text-center">{leave.totalLeave}</td>
                                      <td className="text-center">{leave.lopLeave}</td>
                                      <td className="text-center">{leave.empTotalWorkingDays}</td>
                                      <td className="text-center">{leave.empSalaryDays}</td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="7" className="text-center">
                                      No data available
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </Box>
            </div>
          </>
        )}
      </div>

      <ToastContainer />
    </>
  );
};

export default AttendenceProcess;
