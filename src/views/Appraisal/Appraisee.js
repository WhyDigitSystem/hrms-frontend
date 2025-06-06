import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Checkbox, FormControl, FormControlLabel, FormHelperText, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { getAllActiveCountries } from 'utils/CommonFunctions';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonBulkUpload from 'utils/CommonBulkUpload';
import COASample from '../../assets/sample-files/COASample.xlsx';
import { FaFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaFilePdf } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

export const AppraiseeDetails = () => {
    const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
    const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(true);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        active: true,
        appraiseeCode: '',
        designation: '',
        appraiseeName: '',
        department: '',
        branch: '',
        joinDate: null,
        promotedOn: '',
        supervisorOne: '',
        designationOne: '',
        supervisorTwo: '',
        designationTwo: '',
        periodFrom: null,
        periodTo: null,
    });
    const [editId, setEditId] = useState('');
    const [countryList, setCountryList] = useState([]);

    const theme = useTheme();
    const anchorRef = useRef(null);

    const [fieldErrors, setFieldErrors] = useState({
        appraiseeCode: '',
        designation: '',
        appraiseeName: '',
        department: '',
        branch: '',
        joinDate: null,
        promotedOn: '',
        supervisorOne: '',
        designationOne: '',
        supervisorTwo: '',
        designationTwo: '',
        periodFrom: null,
        periodTo: null,
    });
    const [listView, setListView] = useState(false);
    const listViewColumns = [
        { accessorKey: 'appraiseeName', header: 'Name', size: 140 },
        { accessorKey: 'appraiseeCode', header: 'Code', size: 140 },
        { accessorKey: 'appraiseeCode', header: 'Goal Status', size: 140 },
        { accessorKey: 'appraiseeCode', header: 'New', size: 140 },
        { accessorKey: 'appraiseeCode', header: 'Load', size: 140 },
        { accessorKey: 'appraiseeCode', header: 'Self Status', size: 140 },
        { accessorKey: 'appraiseeCode', header: 'New', size: 140 },
        { accessorKey: 'appraiseeCode', header: 'Load', size: 140 },
        { accessorKey: 'appraiseeCode', header: 'Self Status', size: 140 },
        { accessorKey: 'active', header: 'Active', size: 140 }
    ];
    const [listViewData, setListViewData] = useState([]);

    // const getStateById = async (row) => {
    //     setEditId(row.original.id);
    //     try {
    //         const response = await apiCalls('get', `commonmaster/state/${row.original.id}`);
    //         if (response.status === true) {
    //             const particularState = response.paramObjectsMap.stateVO;

    //             setFormData({
    //                 appraiseeCode: particularState.appraiseeCode,
    //                 designation: particularState.stateNumber,
    //                 appraiseeName: particularState.appraiseeName,
    //                 country: particularState.country,
    //                 active: particularState.active === 'Active' ? true : false
    //             });
    //             setListView(false);
    //         } else {
    //             console.error('API Error:', response.data);
    //         }
    //     } catch (error) {
    //         console.error('Error fetching data:', error);
    //     }
    // };

    const handleInputChange = (e) => {
        const { name, value, selectionStart, selectionEnd, type } = e.target;

        setFormData({ ...formData, [name]: value });
        setFieldErrors({ ...fieldErrors, [name]: '' });

        // Optional: Preserve cursor position after uppercase transformation
        if (type === 'text' || type === 'textarea') {
            setTimeout(() => {
                const inputElement = document.getElementsByName(name)[0];
                if (inputElement) {
                    inputElement.setSelectionRange(selectionStart, selectionEnd);
                }
            }, 0);
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
            appraiseeCode: '',
            designation: '',
            appraiseeName: '',
            department: '',
            branch: '',
            joinDate: '',
            promotedOn: '',
            supervisorOne: '',
            designationOne: '',
            supervisorTwo: '',
            designationTwo: '',
            periodFrom: '',
            periodTo: '',
            active: true
        });
        setFieldErrors({
            appraiseeCode: '',
            designation: '',
            appraiseeName: '',
            department: '',
            branch: '',
            joinDate: '',
            promotedOn: '',
            supervisorOne: '',
            designationOne: '',
            supervisorTwo: '',
            designationTwo: '',
            periodFrom: '',
            periodTo: '',
        });
        setEditId('');
    };

    const handleSave = async () => {
        const errors = {};

        if (!formData.appraiseeName) {
            errors.appraiseeName = 'Name is required';
        }
        if (!formData.appraiseeCode) {
            errors.appraiseeCode = 'Code is required';
        }
        if (!formData.designation) {
            errors.designation = 'Designation is required';
        }
        if (!formData.department) {
            errors.department = 'Department is required';
        }
        if (!formData.branch) {
            errors.branch = 'Branch is required';
        }
        if (!formData.joinDate) {
            errors.joinDate = 'Date of Join is required';
        }
        if (!formData.promotedOn) {
            errors.promotedOn = 'Promoted On is required';
        }
        if (!formData.supervisorOne) {
            errors.supervisorOne = 'Supervisor 1 is required';
        }
        if (!formData.designationOne) {
            errors.designationOne = 'Designation is required';
        }
        if (!formData.supervisorTwo) {
            errors.supervisorTwo = 'supervisor 2 is required';
        }
        if (!formData.designationTwo) {
            errors.designationTwo = 'Designation is required';
        }
        if (!formData.periodFrom) {
            errors.periodFrom = 'Period From is required';
        }
        if (!formData.periodTo) {
            errors.periodTo = 'To is required';
        }

        if (Object.keys(errors).length === 0) {
            setIsLoading(true);

            const saveFormData = {
                ...(editId && { id: editId }),
                active: formData.active,
                appraiseeCode: formData.appraiseeCode,
                designation: formData.designation,
                department: formData.department,
                appraiseeName: formData.appraiseeName,
                branch: formData.branch,
                joinDate: formData.joinDate,
                promotedOn: formData.promotedOn,
                supervisorOne: formData.supervisorOne,
                designationOne: formData.designationOne,
                supervisorTwo: formData.supervisorTwo,
                designationTwo: formData.designationTwo,
                periodFrom: formData.periodFrom,
                periodTo: formData.periodTo,
                orgId: orgId,
                createdBy: loginUserName
            };
            try {
                const response = await apiCalls('post', `commonmaster/state`, saveFormData);
                if (response.status === true) {
                    setIsLoading(false);
                    handleClear();
                    showToast('success', editId ? ' State Updated Successfully' : 'State created successfully');
                } else {
                    showToast('error', response.paramObjectsMap.errorMessage || 'State creation failed');
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('error', 'State creation failed');
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
                        {/* <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} /> */}
                        <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
                        <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                        <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={() => handleSave()} margin="0 10px 0 10px" />
                    </div>
                </div>

                {listView ? (
                    <div className="mt-0">
                        <CommonListViewTable
                            data={listViewData}
                            columns={listViewColumns}
                            blockEdit={true}
                            // toEdit={getStateById}
                            enableEditing={true}
                        />
                    </div>
                ) : (
                    <div className="row">
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Name"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="appraiseeName"
                                value={formData.appraiseeName}
                                onChange={handleInputChange}
                                error={!!fieldErrors.appraiseeName}
                                helperText={fieldErrors.appraiseeName}
                            />
                        </div>
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Code"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="appraiseeCode"
                                value={formData.appraiseeCode}
                                onChange={handleInputChange}
                                error={!!fieldErrors.appraiseeCode}
                                helperText={fieldErrors.appraiseeCode}
                            />
                        </div>
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Designation"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="designation"
                                value={formData.designation}
                                onChange={handleInputChange}
                                error={!!fieldErrors.designation}
                                helperText={fieldErrors.designation}
                            />
                        </div>
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Department"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="department"
                                value={formData.department}
                                onChange={handleInputChange}
                                error={!!fieldErrors.department}
                                helperText={fieldErrors.department}
                            />
                        </div>
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Branch"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="branch"
                                value={formData.branch}
                                onChange={handleInputChange}
                                error={!!fieldErrors.branch}
                                helperText={fieldErrors.branch}
                            />
                        </div>
                        <div className="col-md-3 mb-3">
                            <FormControl fullWidth variant="filled" size="small">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Date of Join"
                                        value={formData.joinDate ? dayjs(formData.joinDate) : null}
                                        onChange={(date) => handleDateChange('joinDate', date)}
                                        format="DD-MM-YYYY"
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                error: !!fieldErrors.joinDate,
                                                helperText: fieldErrors.joinDate
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </div>
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Promoted On"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="promotedOn"
                                value={formData.promotedOn}
                                onChange={handleInputChange}
                                error={!!fieldErrors.promotedOn}
                                helperText={fieldErrors.promotedOn}
                            />
                        </div>
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Supervisor 1"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="supervisorOne"
                                value={formData.supervisorOne}
                                onChange={handleInputChange}
                                error={!!fieldErrors.supervisorOne}
                                helperText={fieldErrors.supervisorOne}
                            />
                        </div>
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Designation"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="designationOne"
                                value={formData.designationOne}
                                onChange={handleInputChange}
                                error={!!fieldErrors.designationOne}
                                helperText={fieldErrors.designationOne}
                            />
                        </div>
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Supervisor 2"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="supervisorTwo"
                                value={formData.supervisorTwo}
                                onChange={handleInputChange}
                                error={!!fieldErrors.supervisorTwo}
                                helperText={fieldErrors.supervisorTwo}
                            />
                        </div>
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Designation"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="designationTwo"
                                value={formData.designationTwo}
                                onChange={handleInputChange}
                                error={!!fieldErrors.designationTwo}
                                helperText={fieldErrors.designationTwo}
                            />
                        </div>
                        <div className="col-md-3 mb-3">
                            <FormControl fullWidth variant="filled" size="small">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Period From"
                                        value={formData.periodFrom ? dayjs(formData.periodFrom) : null}
                                        onChange={(date) => handleDateChange('periodFrom', date)}
                                        format="DD-MM-YYYY"
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                error: !!fieldErrors.periodFrom,
                                                helperText: fieldErrors.periodFrom
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
                                        label="To"
                                        value={formData.periodTo ? dayjs(formData.periodTo) : null}
                                        onChange={(date) => handleDateChange('periodTo', date)}
                                        format="DD-MM-YYYY"
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                error: !!fieldErrors.periodTo,
                                                helperText: fieldErrors.periodTo
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </div>
                        {/* <div className="col-md-3 mb-3">
                            <FormControlLabel
                                control={<Checkbox checked={formData.active} onChange={handleCheckboxChange} />}
                                label="Active"
                                labelPlacement="end"
                            />
                        </div> */}
                    </div>
                )}
            </div>
            <ToastComponent />
        </>
    );
};

export default AppraiseeDetails;
