import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Checkbox, FormControlLabel, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import dayjs from 'dayjs';

export const AppraiseeDetails = () => {
    const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
    const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
    const [isLoading, setIsLoading] = useState(false);
    const [listLoading, setListLoading] = useState(false);
    const [listView, setListView] = useState(false);
    const [editId, setEditId] = useState('');
    const [formData, setFormData] = useState({
        active: true,
        code: '',
        designation: '',
        name: '',
        department: '',
        branch: '',
        reportingHead: '',
        reportingHeadCode: '',
        reportingHeadDesignation: '',
        finYear: new Date().getFullYear()
    });

    const [fieldErrors, setFieldErrors] = useState({
        name: '',
        code: '',
        designation: '',
        department: '',
        branch: '',
        reportingHead: '',
        reportingHeadCode: '',
        reportingHeadDesignation: '',
        finYear: ''
    });

    const [listViewData, setListViewData] = useState([]);
    const listViewColumns = [
        { accessorKey: 'name', header: 'Name', size: 140 },
        { accessorKey: 'code', header: 'Code', size: 140 },
        { accessorKey: 'designation', header: 'Designation', size: 140 },
        { accessorKey: 'reportingHead', header: 'Reporting Head', size: 140 },
        { accessorKey: 'reportingHeadCode', header: 'Reporting Head Code', size: 140 },
        { accessorKey: 'reportingHeadDesignation', header: 'Reporting Head Designation', size: 140 },
        { accessorKey: 'active', header: 'Active', size: 140 }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setFieldErrors({ ...fieldErrors, [name]: '' });
    };

    const fetchEmployeeDetails = async (employeeCode) => {
        if (!employeeCode || !orgId) return;

        try {
            const response = await apiCalls('get', `goalsController/getEmployeeDetails?employeeCode=${employeeCode}&orgId=${orgId}`);

            if (response?.status && response?.paramObjectsMap?.PermisionRequestVO?.length > 0) {
                const data = response.paramObjectsMap.PermisionRequestVO[0];

                setFormData((prev) => ({
                    ...prev,
                    code: data.empCode || '',
                    name: data.empName || '',
                    designation: data.empDesignation || '',
                    reportingHead: data.reportingPerson || '',
                    reportingHeadCode: data.reportingPersonCode || '',
                    reportingHeadDesignation: data.reportingPersonRole || '',
                    department: data.department || '',
                    // branch: data.branch || ''
                }));

                setFieldErrors({
                    ...fieldErrors,
                    name: '',
                    code: '',
                    designation: '',
                    reportingHead: '',
                    reportingHeadCode: '',
                    reportingHeadDesignation: ''
                });

                showToast('success', `Employee ${data.empName} details fetched`);
            } else {
                showToast('error', 'Employee details not found');
            }
        } catch (error) {
            console.error('Error fetching employee details:', error);
            // showToast('error', 'Failed to fetch employee details');
        }
    };

    const fetchAppraiseeList = async () => {
        try {
            const response = await apiCalls('get', `/goalsController/getAppraiseeByOrgId?orgId=${orgId}`);
            console.log("Appraisee List Response:", response); // Log response for debugging

            if (response?.status) {
                // Find the correct property name regardless of case
                const appraiseeKey = Object.keys(response.paramObjectsMap || {}).find(
                    key => key.toLowerCase() === 'appraiseevo'
                );

                if (appraiseeKey && Array.isArray(response.paramObjectsMap[appraiseeKey])) {
                    setListViewData(response.paramObjectsMap[appraiseeKey]);
                } else {
                    setListViewData([]);
                    showToast('info', 'No appraisee data found');
                }
            } else {
                setListViewData([]);
                showToast('error', 'Failed to fetch appraisee list');
            }
        } catch (error) {
            console.error('Fetch List Error:', error);
            // showToast('error', 'Error fetching appraisee list');
        }
    };

    const handleClear = () => {
        setFormData({
            name: '',
            code: '',
            designation: '',
            department: '',
            branch: '',
            reportingHead: '',
            reportingHeadCode: '',
            reportingHeadDesignation: '',
            finYear: new Date().getFullYear(),
            active: true
        });
        setFieldErrors({
            name: '',
            code: '',
            designation: '',
            department: '',
            branch: '',
            reportingHead: '',
            reportingHeadCode: '',
            reportingHeadDesignation: '',
            finYear: ''
        });
        setEditId('');
    };

    const handleSave = async () => {
        console.log("Saving formData:", formData);

        const errors = {};
        if (!formData.name) errors.name = 'Name is required';
        if (!formData.code) errors.code = 'Code is required';
        if (!formData.designation) errors.designation = 'Designation is required';
        if (!formData.department) errors.department = 'Department is required';
        // if (!formData.branch) errors.branch = 'Branch is required';
        if (!formData.reportingHead) errors.reportingHead = 'Reporting Head is required';
        if (!formData.reportingHeadCode) errors.reportingHeadCode = 'Reporting Head Code is required';
        if (!formData.reportingHeadDesignation) errors.reportingHeadDesignation = 'Reporting Head Designation is required';

        if (Object.keys(errors).length > 0) {
            console.warn("Validation Errors:", errors);
            setFieldErrors(errors);
            showToast('error', 'Please fill all required fields');
            return;
        }

        setIsLoading(true);

        const saveFormData = {
            ...(editId && { id: editId }),
            active: formData.active,
            code: formData.code,
            designation: formData.designation,
            name: formData.name,
            department: formData.department,
            branch: formData.branch,
            reportingHead: formData.reportingHead,
            reportingHeadCode: formData.reportingHeadCode,
            reportingHeadDesignation: formData.reportingHeadDesignation,
            finYear: formData.finYear,
            orgId: parseInt(orgId),
            createdBy: loginUserName
        };

        try {
            const response = await apiCalls('put', `goalsController/createUpdateAppraisee`, saveFormData);

            if (response?.status === true) {
                showToast('success', editId ? 'Updated successfully' : 'Created successfully');
                handleClear();
                fetchAppraiseeList();
            } else {
                const message = response?.message || 'Operation failed';
                showToast('error', message);
            }
        } catch (error) {
            console.error("API Error:", error);
            showToast('error', 'Failed to save data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    // Update handleView function
    const handleView = () => {
        const newState = !listView;
        setListView(newState);

        if (newState) {
            setListLoading(true);
            fetchAppraiseeList().finally(() => setListLoading(false));
        }
    };

    const handleCheckboxChange = (event) => {
        setFormData({
            ...formData,
            active: event.target.checked
        });
    };

    useEffect(() => {
        const defaultEmployeeCode = localStorage.getItem('employeeCode') || '';
        if (defaultEmployeeCode) {
            setFormData((prev) => ({
                ...prev,
                code: defaultEmployeeCode
            }));
            fetchEmployeeDetails(defaultEmployeeCode);
        }
    }, []);

    const isSaveDisabled = !formData.name || !formData.code || !formData.designation ||
        // !formData.department || !formData.branch || !formData.reportingHead ||
        !formData.reportingHeadCode || !formData.reportingHeadDesignation;

    return (
        <>
            <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
                <div className="d-flex flex-wrap justify-content-start mb-4">
                    <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
                    <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                    <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} disabled={isSaveDisabled} margin="0 10px 0 10px" />
                </div>

                {listView ? (
                    <div className="mt-0">
                        {listLoading ? (
                            <div className="text-center py-4">Loading appraisee list...</div>
                        ) : listViewData.length > 0 ? (
                            <CommonListViewTable
                                data={listViewData}
                                columns={listViewColumns}
                                blockEdit={true}
                                enableEditing={false}
                            />
                        ) : (
                            <div className="text-center py-4">No appraisee data available</div>
                        )}
                    </div>
                ) : (
                    <div className="row">
                        <div className="col-md-3 mb-3">
                            <TextField label="Code *" variant="outlined" size="small" fullWidth name="code" value={formData.code} onChange={handleInputChange} onBlur={(e) => fetchEmployeeDetails(e.target.value)} error={!!fieldErrors.code} helperText={fieldErrors.code} disabled />
                        </div>
                        <div className="col-md-3 mb-3">
                            <TextField label="Name *" variant="outlined" size="small" fullWidth name="name" value={formData.name} onChange={handleInputChange} error={!!fieldErrors.name} helperText={fieldErrors.name} disabled />
                        </div>
                        <div className="col-md-3 mb-3">
                            <TextField label="Designation *" variant="outlined" size="small" fullWidth name="designation" value={formData.designation} onChange={handleInputChange} error={!!fieldErrors.designation} helperText={fieldErrors.designation}  disabled/>
                        </div>
                        <div className="col-md-3 mb-3">
                            <TextField label="Department *" variant="outlined" size="small" fullWidth name="department" value={formData.department} onChange={handleInputChange} error={!!fieldErrors.department} helperText={fieldErrors.department} disabled />
                        </div>
                        {/* <div className="col-md-3 mb-3">
                            <TextField label="Branch *" variant="outlined" size="small" fullWidth name="branch" value={formData.branch} onChange={handleInputChange} error={!!fieldErrors.branch} helperText={fieldErrors.branch} />
                        </div> */}
                        <div className="col-md-3 mb-3">
                            <TextField label="Reporting Head *" variant="outlined" size="small" fullWidth name="reportingHead" value={formData.reportingHead} onChange={handleInputChange} error={!!fieldErrors.reportingHead} helperText={fieldErrors.reportingHead} disabled />
                        </div>
                        <div className="col-md-3 mb-3">
                            <TextField label="Reporting Head Code *" name="reportingHeadCode" value={formData.reportingHeadCode} onChange={handleInputChange} error={!!fieldErrors.reportingHeadCode} helperText={fieldErrors.reportingHeadCode} variant="outlined" size="small" fullWidth disabled />
                        </div>
                        <div className="col-md-3 mb-3">
                            <TextField label="Reporting Head Designation *" variant="outlined" size="small" fullWidth name="reportingHeadDesignation" value={formData.reportingHeadDesignation} onChange={handleInputChange} error={!!fieldErrors.reportingHeadDesignation} helperText={fieldErrors.reportingHeadDesignation} disabled />
                        </div>
                        <div className="col-md-3 mb-3">
                            <FormControlLabel control={<Checkbox checked={formData.active} onChange={handleCheckboxChange} />} label="Active" />
                        </div>
                    </div>
                )}
            </div>
            <ToastComponent />
        </>
    );
};

export default AppraiseeDetails;
