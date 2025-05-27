import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import apiCalls from 'apicall';
import { useState, useEffect } from 'react';
import CommonBulkUpload from 'utils/CommonBulkUpload';
import { TableCell, TableContainer, TableHead, TablePagination, Tooltip, Typography } from '@mui/material';
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
import Box from '@mui/material/Box';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Paper, Table, TableRow, TableBody, TextField } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import handleSampleFileAttendence from "../../../src/assets/sample-files/Attendance_Process_Sample.xlsx"
import handleSampleFileCheckOut from "../../assets/sample-files/Uploadcheckin_Sample_File.xlsx"

const AttendenceProcess = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [value, setValue] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCodeQuery, setSearchCodeQuery] = useState('');
  const [uploadFile, setUploadFile] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openMissingDialog, setOpenMissingDialog] = useState(false);
  const [selectedMissingDates, setSelectedMissingDates] = useState([]);
  // const [isHidden, setIsHidden] = useState(false);
  const [formData, setFormData] = useState({
    fromDate: null,
    toDate: null
  });

  const [fieldErrors, setFieldErrors] = useState({
    fromDate: null,
    toDate: null
  });
  const [errorDialog, setErrorDialog] = useState({
    open: false,
    message: ''
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'employeeName', header: 'Employe Name', size: 140 },
    { accessorKey: 'employeeCode', header: 'Employe Code', size: 140 },
    { accessorKey: 'totalCompanyWorkingDays', header: 'Total Company Working Days', size: 140 },
    { accessorKey: 'totalLeave', header: 'Total Leave', size: 140 },
    { accessorKey: 'empTotalWorkingDays', header: 'Emp Total Working Days', size: 140 },
    { accessorKey: 'empSalaryDays', header: 'Emp Salary Days', size: 140 },
    { accessorKey: 'month', header: 'Month', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
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
  //     setFieldErrors({
  //       fromDate: !formData.fromDate ? 'From Date is required' : '',
  //       toDate: !formData.toDate ? 'To Date is required' : ''
  //     });
  //     return;
  //   }

  //   try {
  //     const response = await apiCalls(
  //       'get',
  //       `leaveprocess/getLeaveDetailsForLeaveProcess?fromDate=${formData.fromDate}&orgId=${orgId}&toDate=${formData.toDate}`
  //     );

  //     if (response.status === true && Array.isArray(response.paramObjectsMap.leaveProcessVO)) {
  //       const formattedData = response.paramObjectsMap.leaveProcessVO.map((item) => ({
  //         ...item,
  //         totalLeave: parseFloat(item.totalLeave).toString(),
  //         lopLeave: parseFloat(item.lopLeave).toString(),
  //         empSalaryDays: parseFloat(item.empSalaryDays).toString(),
  //         empTotalWorkingDays: parseFloat(item.empTotalWorkingDays).toString()
  //       }));

  //       setAllLeave(formattedData);
  //       setListViewData(formattedData);
  //     } else {
  //       setFieldErrors({
  //         fromDate: '',
  //         toDate: response.paramObjectsMap?.errorMessage || 'No leave data found'
  //       });
  //     }
  //   } catch (error) {
  //     setFieldErrors({
  //       fromDate: '',
  //       toDate: 'Failed to fetch leave details. Please try again later.'
  //     });
  //   }
  // };

  const getAllLeaveProcess = async () => {
    if (!formData.fromDate || !formData.toDate) {
      setFieldErrors({
        fromDate: !formData.fromDate ? 'From Date is required' : '',
        toDate: !formData.toDate ? 'To Date is required' : ''
      });
      return;
    }

    try {
      const response = await apiCalls(
        'get',
        `leaveprocess/getLeaveDetailsForLeaveProcess?fromDate=${formData.fromDate}&orgId=${orgId}&toDate=${formData.toDate}`
      );

      if (response.status === true && Array.isArray(response.paramObjectsMap.leaveProcessVO)) {
        const baseLeaveData = response.paramObjectsMap.leaveProcessVO;

        // Fetch EmpcheckInOutDays for each employee
        const enrichedLeaveData = await Promise.all(
          baseLeaveData.map(async (item) => {
            try {
              const empResponse = await apiCalls(
                'get',
                `leaveprocess/getCheckInAndOutDaysForLeaveProcess?branchCode=${branchCode}&empCode=${item.employeeCode}&fromDate=${formData.fromDate}&orgId=${orgId}&toDate=${formData.toDate}`
              );

              const empTotalWorkingDays =
                empResponse?.paramObjectsMap?.checkInOutDetailsList?.[0]?.EmpcheckInOutDays?.toString() || '0';

              const empStatus =
                empResponse?.paramObjectsMap?.checkInOutDetailsList?.[0]?.status?.toString() || '';

              const missing =
                empResponse?.paramObjectsMap?.checkInOutDetailsList?.[0]?.missingDates?.toString() || '';

              return {
                ...item,
                totalLeave: parseFloat(item.totalLeave).toString(),
                lopLeave: parseFloat(item.lopLeave).toString(),
                empSalaryDays: parseFloat(item.empSalaryDays).toString(),
                empTotalWorkingDays,
                empStatus,
                missing
              };
            } catch (innerError) {
              console.error(`Failed to fetch working days for ${item.employeeCode}`, innerError);
              return {
                ...item,
                totalLeave: parseFloat(item.totalLeave).toString(),
                lopLeave: parseFloat(item.lopLeave).toString(),
                empSalaryDays: parseFloat(item.empSalaryDays).toString(),
                empTotalWorkingDays: '0',
                empStatus: '',
                missing: null
              };
            }
          })
        );

        setAllLeave(enrichedLeaveData);
        console.log('Status', allLeave)
        setListViewData(enrichedLeaveData);
      } else {
        setFieldErrors({
          fromDate: '',
          toDate: response.paramObjectsMap?.errorMessage || 'No leave data found'
        });
      }
    } catch (error) {
      setFieldErrors({
        fromDate: '',
        toDate: 'Failed to fetch leave details. Please try again later.'
      });
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
    setAllLeave([]);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleSave = async () => {
    const errors = {};

    if (!formData.fromDate) {
      errors.fromDate = 'From Date is required';
    }
    if (!formData.toDate) {
      errors.toDate = 'To Date is required';
    }

    if (allLeave.length === 0) {
      errors.table = 'No data available in the table. Please add employees before saving.';
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
        branchCode: branchCode
      }));

      console.log('DATA TO SAVE IS:', saveData);

      try {
        const response = await apiCalls('put', '/leaveprocess/createUpdateLeaveProcess', saveData);

        if (response.status === true) {
          console.log('Response:', response);

          // Ensure correct toast usage
          showToast('success', 'Attendance Process created successfully');

          handleClear(); // Clear form after success
          getAllLeaveProcess();
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

  const filteredData = allLeave.filter((row) =>
    row.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) &&
    row.employeeCode?.toLowerCase().includes(searchCodeQuery.toLowerCase())
  );

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
            {/* <ActionButton title="Search" icon={SearchIcon} onClick={getAllLeaveProcess} /> */}
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} />
            <ActionButton
              title="Upload"
              icon={UploadIcon}
              isLoading={isLoading}
              // onClick={handleBulkUploadOpen}
              onClick={() => {
                setUploadFile({
                  title: "Upload Attendance Process",
                  apiUrl: "/leaveprocess/uploadLeaveProcess",
                  sampleFileDownload: handleSampleFileAttendence,
                  sampleFileName: "AttendenceProcess Sample File",
                  loginUser: loginUserName
                });
                setUploadOpen(true);
              }}
            />
            <Box sx={{ display: 'flex' }}>
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                sx={{
                  background: 'linear-gradient(90deg, #3f51b5, #5c6bc0)',
                  color: '#fff',
                  fontWeight: 'bold',
                  height: '40px',
                  px: 2,
                  py: 1,
                  borderRadius: 3,
                  boxShadow: '0px 4px 8px rgba(63, 81, 181, 0.2)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #3949ab, #536dfe)',
                    boxShadow: '0px 6px 12px rgba(63, 81, 181, 0.3)'
                  }
                }}
                // onClick={handleBulkUploadOpen}
                onClick={() => {
                  setUploadFile({
                    title: "Upload Check Out",
                    apiUrl: "/leaveprocess/uploadcheckin",
                    sampleFileDownload: handleSampleFileCheckOut,
                    sampleFileName: "CheckOut Sample File"
                  });
                  setUploadOpen(true);
                }}
              >
                Check In&out
              </Button>
            </Box>
          </div>
        </div>
        {listView && (
          <div className="mt-4">
            <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={true} enableEditing={true} />
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
                      slotProps={{
                        textField: {
                          size: 'small',
                          error: !!fieldErrors.fromDate,
                          helperText: fieldErrors.fromDate
                        }
                      }}
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
                      minDate={formData.fromDate ? dayjs(formData.fromDate) : null}
                      disabled={!formData.fromDate}
                      slotProps={{
                        textField: {
                          size: 'small',
                          error: !!fieldErrors.toDate,
                          helperText: fieldErrors.toDate
                        }
                      }}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <Tooltip title="Add">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={getAllLeaveProcess}
                    sx={{
                      borderRadius: '8px',
                      boxShadow: '0px 3px 5px rgba(0,0,0,0.2)',
                      textTransform: 'none'
                    }}
                  >
                    Go
                  </Button>
                </Tooltip>
              </div>
            </div>

            {uploadOpen && (
              <CommonBulkUpload
                open={uploadOpen}
                handleClose={handleBulkUploadClose}
                dialogTitle="Upload Files"
                uploadText="Upload File"
                onSubmit={handleSubmit}
                sampleFileDownload={uploadFile.sampleFileDownload}
                fileName={uploadFile.sampleFileName}
                downloadText="Download File"
                handleFileUpload={handleFileUpload}
                apiUrl={uploadFile.apiUrl}
                screen="AttendenceProcess"
                loginUser={uploadFile.loginUser}
                includeCreatedBy={uploadFile.includeCreatedBy}
                orgId={orgId}
              />
            )}
            <div className="row">
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
                                {allLeave[0]?.year} - Company working days {allLeave[0]?.totalCompanyWorkingDays}
                              </strong>
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="row mt-2">
                        <div className="col-lg-12">
                          <div className="table-responsive">
                            <TableContainer component={Paper}>
                              <Table>
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                  {/* search */}
                                  {/* <TableRow>
                                    <TableCell />
                                    <TableCell>
                                      <TextField
                                        placeholder="Search Name"
                                        variant="standard"
                                        fullWidth
                                        value={searchQuery}
                                        onChange={(e) => {
                                          setSearchQuery(e.target.value);
                                          setPage(0);
                                        }}
                                        sx={{
                                          '& .MuiInputBase-input': {
                                            color: 'white', // input text color
                                            '&::placeholder': {
                                              color: 'white', // placeholder color
                                              opacity: 1,
                                            },
                                          },
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <TextField
                                        placeholder="Search Code"
                                        variant="standard"
                                        fullWidth
                                        value={searchCodeQuery}
                                        onChange={(e) => {
                                          setSearchCodeQuery(e.target.value);
                                          setPage(0);
                                        }}
                                        sx={{
                                          '& .MuiInputBase-input': {
                                            color: 'white', // input text color
                                            '&::placeholder': {
                                              color: 'white', // placeholder color
                                              opacity: 1,
                                            },
                                          },
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell colSpan={5} />
                                  </TableRow> */}
                                  {/* Header Row */}
                                  <TableRow>
                                    <TableCell><strong>S.No</strong></TableCell>
                                    <TableCell><strong>Employee</strong></TableCell>
                                    <TableCell><strong>Code</strong></TableCell>
                                    <TableCell><strong>Total Leave</strong></TableCell>
                                    <TableCell><strong>LOP</strong></TableCell>
                                    <TableCell><strong>Working Days</strong></TableCell>
                                    <TableCell><strong>Total Working Days</strong></TableCell>
                                    <TableCell><strong>Missing</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                  </TableRow>
                                </TableHead>

                                <TableBody>
                                  {filteredData.length > 0 ? (
                                    filteredData
                                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                      .map((row, index) => (
                                        <TableRow key={row.id || index} hover>
                                          <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                          <TableCell>{row.employeeName}</TableCell>
                                          <TableCell>{row.employeeCode}</TableCell>
                                          <TableCell>{row.totalLeave}</TableCell>
                                          <TableCell>{row.lopLeave}</TableCell>
                                          <TableCell>{row.empTotalWorkingDays}</TableCell>
                                          <TableCell>{row.empSalaryDays}</TableCell>
                                          <TableCell
                                            sx={{
                                              color: 'blue',
                                              cursor: row.missing ? 'pointer' : 'default',
                                              textDecoration: row.missing ? 'underline' : 'none'
                                            }}
                                            onClick={() => {
                                              if (row.missing) {
                                                const datesArray = row.missing.split(',').map(d => d.trim());
                                                setSelectedMissingDates(datesArray);
                                                setOpenMissingDialog(true);
                                              }
                                            }}
                                          >
                                            {row.missing ? 'Dates' : '-'}
                                          </TableCell>
                                          <TableCell
                                            sx={{ color: row.empStatus === 'Matched' ? 'green' : 'red' }}
                                          >
                                            {row.empStatus}
                                          </TableCell>
                                        </TableRow>
                                      ))
                                  ) : (
                                    <TableRow>
                                      <TableCell colSpan={8} align="center">
                                        No data available
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>

                              <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={filteredData.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={(e, newPage) => setPage(newPage)}
                                onRowsPerPageChange={(e) => {
                                  setRowsPerPage(parseInt(e.target.value, 10));
                                  setPage(0);
                                }}
                              />
                            </TableContainer>
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
      <Dialog open={errorDialog.open} onClose={() => setErrorDialog({ open: false, message: '' })}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <DialogContentText>{errorDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialog({ open: false, message: '' })} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openMissingDialog}
        onClose={() => setOpenMissingDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(to right, #f0f2f5, #e3f2fd)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            p: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
            color: 'white',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Missing Dates
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          {selectedMissingDates.length > 0 ? (
            <ul style={{ paddingLeft: '20px' }}>
              {selectedMissingDates.map((date, index) => (
                <li
                  key={index}
                  style={{
                    marginBottom: '8px',
                    color: '#1a237e',
                    fontWeight: 500,
                    background: '#e3f2fd',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    listStyleType: 'disc',
                  }}
                >
                  {date}
                </li>
              ))}
            </ul>
          ) : (
            <Typography color="textSecondary" align="center">
              No missing dates
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button
            onClick={() => setOpenMissingDialog(false)}
            variant="contained"
            sx={{
              background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: 2,
              px: 4,
              py: 1,
              '&:hover': {
                background: 'linear-gradient(90deg, #303f9f, #1976d2)',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </>
  );
};

export default AttendenceProcess;
