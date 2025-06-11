import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';

import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Checkbox, FormControl, FormControlLabel, FormHelperText, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import apiCalls from 'apicall';

const HR_Review = () => {
    const [listViewData, setListViewData] = useState([]);
    const [orgId] = useState(parseInt(localStorage.getItem('orgId')));
    const [createdBy] = useState(localStorage.getItem('userName'));
    const [value, setValue] = useState(0);
    const [editId, setEditId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [listView, setListView] = useState(false);
    const [isFetchingEmployee, setIsFetchingEmployee] = useState(false);

    const [formData, setFormData] = useState({
        appraisalId: '',
        code: localStorage.getItem('employeeCode') || '',
        name: '',
        supervisorCode: '',
        supervisorName: '',
        finYear: '',
        // active: true
    });

    const [fieldErrors, setFieldErrors] = useState({
        appraisalId: '',
        code: '',
        name: '',
        supervisorCode: '',
        supervisorName: ''
    });

    const [goalsDetailsData, setGoalsDetailsData] = useState([
        { id: null, area: '', keyPerformanceIndicator: '', goals: '' }
    ]);

    const [goalsDetailsErrors, setGoalsDetailsErrors] = useState([
        { area: '', keyPerformanceIndicator: '', goals: '' }
    ]);

    const [countryList, setCountryList] = useState([]);

    const listViewColumns = [
        { accessorKey: 'appraisalId', header: 'Appraisal ID', size: 140 },
        { accessorKey: 'code', header: 'Code', size: 140 },
        { accessorKey: 'name', header: 'Name', size: 140 },
        { accessorKey: 'supervisorCode', header: 'Supv Code', size: 140 },
        { accessorKey: 'supervisorName', header: 'Supv Name', size: 140 },
        // { accessorKey: 'active', header: 'Active', size: 140 }
    ];


    useEffect(() => {
        const fetchInitialData = async () => {
            await getAllGoals();
            if (formData.code) {
                await fetchEmployeeDetails(formData.code);
            }
        };
        fetchInitialData();
    }, []);

    const getAllGoals = async () => {
        try {
            const response = await apiCalls('get', `/goalsController/getSelfGoalsByOrgId?orgId=${orgId}`);
            if (response.status) {
                setListViewData(response.paramObjectsMap.selfGoalsVO);
            } else {
                showToast('error', response.message || 'Failed to fetch goals');
            }
        } catch (error) {
            console.error('Error fetching goals:', error);
            showToast('error', 'Failed to fetch goals');
        }
    };

    const fetchEmployeeDetails = async (employeeCode) => {
        if (!employeeCode || !orgId) return;

        setIsFetchingEmployee(true);
        try {
            const response = await apiCalls('get', `goalsController/getEmployeeDetails?employeeCode=${employeeCode}&orgId=${orgId}`);
            console.log('Employee details response:', response); // Debug log

            if (response?.status) {
                // Try different response structures
                const employeeData = response.paramObjectsMap?.employeeVO?.[0] ||
                    response.paramObjectsMap?.employeeDetails ||
                    response.data;

                if (employeeData) {
                    setFormData(prev => ({
                        ...prev,
                        name: employeeData.empName || employeeData.name || '',
                        supervisorCode: employeeData.reportingPersonCode || employeeData.supervisorCode || '',
                        supervisorName: employeeData.reportingPerson || employeeData.supervisorName || ''
                    }));

                    setFieldErrors(prev => ({
                        ...prev,
                        name: '',
                        supervisorCode: '',
                        supervisorName: ''
                    }));

                    showToast('success', `Employee details loaded`);
                } else {
                    // showToast('warning', 'Employee details not found in response');
                }
            } else {
                showToast('error', response.message || 'Failed to fetch employee details');
            }
        } catch (error) {
            console.error('Error fetching employee details:', error);
            showToast('error', 'Failed to fetch employee details');
        } finally {
            setIsFetchingEmployee(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, checked, type } = e.target;
        const updatedValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: updatedValue
        }));

        setFieldErrors(prev => ({
            ...prev,
            [name]: ''
        }));

        // Fetch employee details when code changes
        if (name === 'code' && value.length > 3) {
            fetchEmployeeDetails(value);
        }
    };

    useEffect(() => {
        getAllGoals();
        // Set default employee code on component mount
        const defaultEmployeeCode = localStorage.getItem('employeeCode') || '';
        if (defaultEmployeeCode) {
            setFormData(prev => ({
                ...prev,
                code: defaultEmployeeCode
            }));
            fetchEmployeeDetails(defaultEmployeeCode);
        }
    }, []);

    const getGoalsById = async (row) => {
        setEditId(row.original.id);
        try {
            const response = await apiCalls('get', `/goalsController/getSelfGoalsById?id=${row.original.id}`);
            if (response.status) {
                setListView(false);
                const goal = response.paramObjectsMap.selfGoalsVO;
                setFormData({
                    appraisalId: goal.appraisalId,
                    code: goal.code,
                    name: goal.name,
                    supervisorCode: goal.supervisorCode,
                    supervisorName: goal.supervisorName,
                    // active: goal.active === true
                });

                // Preserve actual database IDs
                setGoalsDetailsData(
                    goal.selfGoalsDetailsVO.map(detail => ({
                        id: detail.id,
                        area: detail.area,
                        keyPerformanceIndicator: detail.keyPerformanceIndicator,
                        goals: detail.goals,
                    }))
                );
            }
        } catch (error) {
            console.error('Error fetching goal details:', error);
            showToast('error', 'Failed to fetch goal details');
        }
    };

    const handleSave = async () => {
        // Validate main form fields
        const errors = {};
        if (!formData.appraisalId) errors.appraisalId = 'Appraisal ID is required';
        if (!formData.code) errors.code = 'Code is required';
        if (!formData.name) errors.name = 'Name is required';

        // Validate details
        const detailsErrors = goalsDetailsData.map(detail => {
            const error = {};
            if (!detail.area) error.area = 'Area is required';
            if (!detail.keyPerformanceIndicator) error.keyPerformanceIndicator = 'KPI is required';
            if (!detail.goals) error.goals = 'Goals is required';
            return error;
        });

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setGoalsDetailsErrors(detailsErrors);
            showToast('error', 'Please fill all required fields');
            return;
        }

        setIsLoading(true);

        // Prepare details payload with IDs
        const selfGoalsDetailsVo = goalsDetailsData.map(row => ({
            // ...(editId && { id: editId }),
            ...(row.id && { id: row.id }),
            // id: row.id,
            area: row.area,
            keyPerformanceIndicator: row.keyPerformanceIndicator,
            goals: row.goals
        }));

        const payload = {
            ...(editId && { id: editId }),
            // active: formData.active,
            appraisalId: formData.appraisalId,
            code: formData.code,
            name: formData.name,
            finYear: formData.finYear,
            supervisorCode: formData.supervisorCode,
            supervisorName: formData.supervisorName,
            orgId,
            createdBy,
            selfGoalsDetailsDTO: selfGoalsDetailsVo,
        };

        try {
            const response = await apiCalls('put', '/goalsController/createUpdateSelfGoals', payload);
            if (response.status) {
                showToast('success', editId ? 'Self Goal updated successfully' : 'Self Goal created successfully');
                handleClear();
                getAllGoals();
            } else {
                showToast('error', response.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving goal:', error);
            showToast('error', 'Failed to save goal');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            appraisalId: '',
            code: localStorage.getItem('employeeCode') || '',
            name: '',
            supervisorCode: '',
            supervisorName: '',
            // active: true
        });

        setFieldErrors({
            appraisalId: '',
            code: '',
            name: '',
            supervisorCode: '',
            supervisorName: ''
        });

        setGoalsDetailsData([
            { id: null, area: '', keyPerformanceIndicator: '', goals: '' }
        ]);

        setGoalsDetailsErrors([
            { area: '', keyPerformanceIndicator: '', goals: '' }
        ]);

        setEditId('');

        // Fetch employee details again if code exists
        if (formData.code) {
            fetchEmployeeDetails(formData.code);
        }
    };

    const handleAddRow = () => {
        const lastRow = goalsDetailsData[goalsDetailsData.length - 1];

        if (!lastRow.area || !lastRow.keyPerformanceIndicator || !lastRow.goals) {
            const newErrors = [...goalsDetailsErrors];
            const lastIndex = newErrors.length - 1;
            newErrors[lastIndex] = {
                area: !lastRow.area ? 'Area is required' : '',
                keyPerformanceIndicator: !lastRow.keyPerformanceIndicator ? 'KPI is required' : '',
                goals: !lastRow.goals ? 'Goals is required' : ''
            };
            setGoalsDetailsErrors(newErrors);
            showToast('warning', 'Please fill current row before adding new');
            return;
        }

        const newId = goalsDetailsData.length > 0
            ? Math.min(...goalsDetailsData.map(d => d.id)) - 1
            : -1;

        setGoalsDetailsData(prev => [
            ...prev,
            { id: newId, area: '', keyPerformanceIndicator: '', goals: '' }
        ]);

        setGoalsDetailsErrors(prev => [
            ...prev,
            { area: '', keyPerformanceIndicator: '', goals: '' }
        ]);
    };

    const handleDeleteRow = (id) => {
        if (goalsDetailsData.length <= 1) {
            showToast('warning', 'At least one goal detail is required');
            return;
        }

        const index = goalsDetailsData.findIndex(d => d.id === id);
        if (index === -1) return;

        const newData = goalsDetailsData.filter(d => d.id !== id);
        const newErrors = goalsDetailsErrors.filter((_, i) => i !== index);

        setGoalsDetailsData(newData);
        setGoalsDetailsErrors(newErrors);
    };

    const handleDetailChange = (id, field, value) => {
        const index = goalsDetailsData.findIndex(d => d.id === id);
        if (index === -1) return;

        const newData = [...goalsDetailsData];
        newData[index] = { ...newData[index], [field]: value };
        setGoalsDetailsData(newData);

        if (value) {
            const newErrors = [...goalsDetailsErrors];
            newErrors[index] = { ...newErrors[index], [field]: '' };
            setGoalsDetailsErrors(newErrors);
        }
    };

    const handleView = () => setListView(!listView);
    const handleTabChange = (_, newValue) => setValue(newValue);

    return (
        <>
            <div>
                <ToastComponent />
            </div>
            <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
                <div className="row d-flex ml">
                    <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
                        <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
                        <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                        <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
                        <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} disabled={isLoading} />
                    </div>

                    {!listView ? (
                        <>
                            <div className="row d-flex ml">

                                {/* Code */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Code"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.code}
                                        helperText={fieldErrors.code}
                                        disabled

                                    />
                                </div>

                                {/* Name */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Name"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.name}
                                        helperText={fieldErrors.name}
                                        disabled
                                    />
                                </div>
                            </div>
                            {/* Supervisor 1 Feedback */}
                            <div className="row d-flex ml">
                                <div className='mt-0 pb-3 fw-bold'>Supervisor 1 Feedback</div>
                                {/* Eligibility for Promption */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Eligibility for Promption"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="appraisalId"
                                        value={formData.appraisalId}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.appraisalId}
                                        helperText={fieldErrors.appraisalId}
                                    />
                                </div>

                                {/* Eligibility for Increment */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Eligibility for Increment"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="appraisalId"
                                        value={formData.appraisalId}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.appraisalId}
                                        helperText={fieldErrors.appraisalId}
                                    />
                                </div>
                                {/* Score */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Score"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="appraisalId"
                                        value={formData.appraisalId}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.appraisalId}
                                        helperText={fieldErrors.appraisalId}
                                    />
                                </div>

                                {/* Adherance to Employee Engagement Plan */}
                                <div className="col-md-3 mb-3">
                                    <FormControl variant="outlined" size="small" fullWidth error={!!fieldErrors.country}>
                                        <InputLabel id="country-label">Adherance to Employee Engagement Plan</InputLabel>
                                        <Select labelId="country-label" label="Adherance to Employee Engagement Plan" value={formData.country} onChange={handleInputChange} name="country">
                                            {countryList?.map((row) => (
                                                <MenuItem key={row.id} value={row.countryName}>
                                                    {row.countryName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {fieldErrors.country && <FormHelperText>{fieldErrors.country}</FormHelperText>}
                                    </FormControl>
                                </div>

                                {/* Promation Status */}
                                <div className="col-md-3 mb-3">
                                    <FormControl variant="outlined" size="small" fullWidth error={!!fieldErrors.country}>
                                        <InputLabel id="country-label">Promation Status</InputLabel>
                                        <Select labelId="country-label" label="Promation Status" value={formData.country} onChange={handleInputChange} name="country">
                                            {countryList?.map((row) => (
                                                <MenuItem key={row.id} value={row.countryName}>
                                                    {row.countryName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {fieldErrors.country && <FormHelperText>{fieldErrors.country}</FormHelperText>}
                                    </FormControl>
                                </div>


                                {/* HR Remarks */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="HR Remarks"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="hrRemarks"
                                        value={formData.hrRemarks}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.hrRemarks}
                                        helperText={fieldErrors.hrRemarks}
                                        multiline
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <CommonListViewTable
                            data={listViewData}
                            columns={listViewColumns}
                            enableEditing={true}
                            toEdit={getGoalsById}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default HR_Review;