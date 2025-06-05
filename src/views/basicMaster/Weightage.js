import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import {
    Button,
    TextField,
    Box,
    Tab,
    Tabs,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import dayjs from 'dayjs';
import GridOnIcon from '@mui/icons-material/GridOn';
import Paper from '@mui/material/Paper';
import Draggable from 'react-draggable';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import apiCalls from 'apicall';
import { useState, useEffect } from 'react';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}
const Weightage = () => {
    const [listViewData, setListViewData] = useState([]);
    const [orgId] = useState(parseInt(localStorage.getItem('orgId')));
    const [createdBy] = useState(localStorage.getItem('userName'));

    const [editId, setEditId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [listView, setListView] = useState(false);
    const [formData, setFormData] = useState({
            level: '',
            businessOperations: '',
            valueCreation: '',
            peopleEngagement: '',
            ivlId: '',
            remarks: ''
    });

    const [fieldErrors, setFieldErrors] = useState({
            level: '',
            businessOperations: '',
            valueCreation: '',
            peopleEngagement: '',
            ivlId: '',
            remarks: ''
    });
    const listViewColumns = [
        { accessorKey: 'appraisalId', header: 'Level', size: 140 },
        { accessorKey: 'code', header: 'Business Operations', size: 140 },
        { accessorKey: 'name', header: 'Value Creation', size: 140 },
        { accessorKey: 'supervisorCode', header: 'People Engagement', size: 140 }
    ];

    const handleInputChange = (e) => {
        const { name, value, checked, type } = e.target;
        const updatedValue = value;
        setFormData(prev => ({
            ...prev,
            [name]: updatedValue
        }));
        setFieldErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    useEffect(() => {
        getAllWeightage();
    }, []);

    const getAllWeightage = async () => {
        try {
            const response = await apiCalls('get', `/goalsController/getPreGoalsByOrgId?orgId=${orgId}`);
            if (response.status) {
                setListViewData(response.paramObjectsMap.preGoalsVO);
            } else {
                showToast('error', response.message || 'Failed to fetch goals');
            }
        } catch (error) {
            console.error('Error fetching goals:', error);
            showToast('error', 'Failed to fetch goals');
        }
    };
    const getGoalsById = async (row) => {
        setEditId(row.original.id);
        try {
            const response = await apiCalls('get', `/goalsController/getPreGoalsById?id=${row.original.id}`);
            if (response.status) {
                setListView(false);
                const goal = response.paramObjectsMap.preGoalsVO;
                setFormData({
                    appraisalId: goal.appraisalId,
                    code: goal.code,
                    name: goal.name,
                    supervisorCode: goal.supervisorCode,
                    supervisorName: goal.supervisorName,
                    active: goal.active
                });
            }
        } catch (error) {
            console.error('Error fetching goal details:', error);
            showToast('error', 'Failed to fetch goal details');
        }
    };

    const handleSave = async () => {
        // Validate main form fields
        const errors = {};
        if (!formData.level) errors.level = 'Level is required';
        if (!formData.code) errors.code = 'Code is required';
        if (!formData.name) errors.name = 'Name is required';
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            showToast('error', 'Please fill all required fields');
            return;
        }

        setIsLoading(true);
        const payload = {
            id: editId, // Always include main goal ID for updates
            active: formData.active,
            appraisalId: formData.appraisalId,
            code: formData.code,
            name: formData.name,
            supervisorCode: formData.supervisorCode,
            supervisorName: formData.supervisorName,
            orgId,
            createdBy,
        };

        try {
            const response = await apiCalls('put', '/goalsController/createUpdateGoals', payload);
            if (response.status) {
                showToast('success', editId ? 'Weightage updated successfully' : 'Weightage created successfully');
                handleClear();
                getAllWeightage();
            } else {
                showToast('error', response.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving Weightage:', error);
            showToast('error', 'Failed to save Weightage');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            level: '',
            businessOperations: '',
            valueCreation: '',
            peopleEngagement: '',
            ivlId: '',
            remarks: ''
        });

        setFieldErrors({
            level: '',
            businessOperations: '',
            valueCreation: '',
            peopleEngagement: '',
            ivlId: '',
            remarks: ''
        });
        setEditId('');
    };
    const handleView = () => setListView(!listView);
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
                                {/* Form Fields */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Level"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="level"
                                        value={formData.level}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.level}
                                        helperText={fieldErrors.level}
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Business Operations"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="businessOperations"
                                        value={formData.businessOperations}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.businessOperations}
                                        helperText={fieldErrors.businessOperations}
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Value Creation"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="valueCreation"
                                        value={formData.valueCreation}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.valueCreation}
                                        helperText={fieldErrors.valueCreation}
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="People Engagement"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="peopleEngagement"
                                        value={formData.peopleEngagement}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.peopleEngagement}
                                        helperText={fieldErrors.peopleEngagement}
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="IvlId"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="ivlId"
                                        value={formData.ivlId}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.ivlId}
                                        helperText={fieldErrors.ivlId}
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <TextField
                                        label="Remarks"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="remarks"
                                        value={formData.remarks}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.remarks}
                                        helperText={fieldErrors.remarks}
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

export default Weightage;