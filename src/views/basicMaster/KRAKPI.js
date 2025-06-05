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
const KRAKPI = () => {
    const [listViewData, setListViewData] = useState([]);
    const [orgId] = useState(parseInt(localStorage.getItem('orgId')));
    const [createdBy] = useState(localStorage.getItem('userName'));
    const [value, setValue] = useState(0);
    const [editId, setEditId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [listView, setListView] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [fillGridData, setFillGridData] = useState([]);
    const [formData, setFormData] = useState({
        appraisalId: ''
    });

    const [fieldErrors, setFieldErrors] = useState({
        appraisalId: ''
    });

    const [goalsDetailsData, setGoalsDetailsData] = useState([
        { id: null, kpiId: '', kpiDescription: '' }
    ]);

    const [goalsDetailsErrors, setGoalsDetailsErrors] = useState([
        {  kpiId: '', kpiDescription: ''}
    ]);
    const [detailsTableData, setDetailsTableData] = useState([
        { id: null,kraId:'', kraDescription:'',ro:'', kpiId: '', kpiDescription: '' }
    ]);

    const [detailsTableErrors, setDetailsTableErrors] = useState([
        {kraId:'', kraDescription:'',ro:'', kpiId: '', kpiDescription: ''}
    ]);

    const listViewColumns = [
        { accessorKey: 'appraisalId', header: 'Appraisal ID', size: 140 },
        // { accessorKey: 'code', header: 'Code', size: 140 },
        // { accessorKey: 'name', header: 'Name', size: 140 },
        // { accessorKey: 'supervisorCode', header: 'Supv Code', size: 140 },
        // { accessorKey: 'supervisorName', header: 'Supv Name', size: 140 },
        // { accessorKey: 'active', header: 'Active', size: 140 }
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
        getAllKRAKPIs();
    }, []);

    const getAllKRAKPIs = async () => {
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
                    appraisalId: goal.appraisalId
                });

                // Preserve actual database IDs
                setGoalsDetailsData(
                    goal.preGoalsDetailsVO.map(detail => ({
                        id: detail.id, // Actual ID from database
                        area: detail.area,
                        keyPerformanceIndicator: detail.keyPerformanceIndicator,
                        goals: detail.goals
                    }))
                );

                // Initialize errors array
                setGoalsDetailsErrors(
                    goal.preGoalsDetailsVO.map(() => ({
                        area: '',
                        keyPerformanceIndicator: '',
                        goals: ''
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
        // if (!formData.code) errors.code = 'Code is required';
        // if (!formData.name) errors.name = 'Name is required';
        
        // Validate details
        const detailsErrors = goalsDetailsData.map(detail => {
            const error = {};
            if (!detail.area) error.area = 'Area is required';
            if (!detail.keyPerformanceIndicator) error.keyPerformanceIndicator = 'KPI is required';
            if (!detail.goals) error.goals = 'Goals is required';
            return error;
        });

        const hasDetailErrors = detailsErrors.some(err => 
            err.area || err.keyPerformanceIndicator || err.goals
        );

        if (Object.keys(errors).length > 0 || hasDetailErrors) {
            setFieldErrors(errors);
            setGoalsDetailsErrors(detailsErrors);
            showToast('error', 'Please fill all required fields');
            return;
        }

        setIsLoading(true);

        // Prepare details payload with IDs
        const preGoalsDetailsVo = goalsDetailsData.map(row => ({
            id: row.id, // Include existing ID for updates
            area: row.area,
            keyPerformanceIndicator: row.keyPerformanceIndicator,
            goals: row.goals
        }));

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
            preGoalsDetailsDTO: preGoalsDetailsVo,
        };

        try {
            const response = await apiCalls('put', '/goalsController/createUpdateGoals', payload);
            if (response.status) {
                showToast('success', editId ? 'KRAKPI updated successfully' : 'KRAKPI created successfully');
                handleClear();
                getAllKRAKPIs();
            } else {
                showToast('error', response.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving KRAKPI:', error);
            showToast('error', 'Failed to save KRAKPI');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            appraisalId: '',
            code: '',
            name: '',
            supervisorCode: '',
            supervisorName: '',
            active: true
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
    };

    const handleAddRow = () => {
        const lastRow = goalsDetailsData[goalsDetailsData.length - 1];
        
        // Validate last row before adding new one
        if (!lastRow.kpiDescription || !lastRow.kpiId) {
            const newErrors = [...goalsDetailsErrors];
            const lastIndex = newErrors.length - 1;
            newErrors[lastIndex] = {
                kpiDescription: !lastRow.kpiDescription ? 'KPI Description is required' : '',
                kpiId: !lastRow.kpiId ? 'KPI Id is required' : '',
            };
            setGoalsDetailsErrors(newErrors);
            showToast('warning', 'Please fill current row before adding new');
            return;
        }

        // Generate temporary negative ID for new rows
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
        if (detailsTableData.length <= 1) {
            showToast('warning', 'At least one detail is required');
            return;
        }

        const index = detailsTableData.findIndex(d => d.id === id);
        if (index === -1) return;

        const newData = detailsTableData.filter(d => d.id !== id);
        const newErrors = goalsDetailsErrors.filter((_, i) => i !== index);

        setDetailsTableData(newData);
        setDetailsTableErrors(newErrors);
    };
    const handleAddRow1 = () => {
        const lastRow = detailsTableData[detailsTableData.length - 1];
        
        // Validate last row before adding new one
        if (!lastRow.kpiId || !lastRow.kpiDescription || !lastRow.kraDescription || !lastRow.kraId) {
            const newErrors = [...goalsDetailsErrors];
            const lastIndex = newErrors.length - 1;
            newErrors[lastIndex] = {
                kpiId: !lastRow.kpiId ? 'KPI Id is required' : '',
                kpiDescription: !lastRow.kpiDescription ? 'KPI Desc is required' : '',
                kraDescription: !lastRow.kraDescription ? 'KRA Description is required' : '',
                kraId: !lastRow.kraId ? 'KRA Id is required' : ''
            };
            setDetailsTableErrors(newErrors);
            showToast('warning', 'Please fill current row before adding new');
            return;
        }

        // Generate temporary negative ID for new rows
        const newId = detailsTableData.length > 0
            ? Math.min(...detailsTableData.map(d => d.id)) - 1
            : -1;

        setDetailsTableData(prev => [
            ...prev,
            { id: newId,kraId:'', kraDescription:'',ro:'', kpiId: '', kpiDescription: '' }
        ]);

        setDetailsTableErrors(prev => [
            ...prev,
            { kraId:'', kraDescription:'',ro:'', kpiId: '', kpiDescription: '' }
        ]);
    };

    const handleDeleteRow1 = (id) => {
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

        // Update data
        const newData = [...goalsDetailsData];
        newData[index] = { ...newData[index], [field]: value };
        setGoalsDetailsData(newData);

        // Clear error for this field
        if (value) {
            const newErrors = [...goalsDetailsErrors];
            newErrors[index] = { ...newErrors[index], [field]: '' };
            setGoalsDetailsErrors(newErrors);
        }
    };

    const handleView = () => setListView(!listView);
    const handleTabChange = (_, newValue) => setValue(newValue);
    const handleFullGrid = () => {
      // if (formData.customerCode) {
        setModalOpen(true);
        getAllFillGrid();
      // }else{
      //   setModalOpen(false);
      //   showToast('warning', formData.customerName ? `${formData.customerCode} has No Data` : 'Please Select Customer Name');
      // }
    };
    const handleCloseModal = () => {
      setModalOpen(false);
    };
    const handleSelectAll = () => {
      if (selectAll) {
        setSelectedRows([]);
      } else {
        setSelectedRows(fillGridData.map((_, index) => index));
      }
      setSelectAll(!selectAll);
    };
    const handleSubmitSelectedRows = async () => {
      const selectedData = selectedRows.map((index) => fillGridData[index]);
      console.log("charge amt", selectedData);
      const newData = selectedData
        .filter((data) => {
          return !goalsDetailsData.some(
            (item) => item.invNo === data.vid && item.invDate === data.vdate
          );
        })
        .map((data) => ({
          id: Date.now() + Math.random(), 
          invNo: data.vid || '',
          invDate: data.vdate ? dayjs(data.vdate).format('YYYY-MM-DD') : null,
          amount: data.billamount || '',
          gstAmt: data.gstamount || '',
          chargeAmt: data.chargeAmt || '',
          currency: data.acccurrency || '',
          exRate: data.exrate || '',
          refDate: data.refate ? dayjs(data.refate).format('YYYY-MM-DD') : null,
          refNo: data.refNo || ''
        }));
      if (newData.length < selectedData.length) {
        showToast('warning', 'Some of the selected items are already added!');
      }
      if (newData.length === 0) {
        return;
      }
      setGoalsDetailsData((prev) => [...prev, ...newData]);
      setSelectedRows([]);
      setSelectAll(false);
      handleCloseModal();
    };    
  const getAllFillGrid = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/arreceivable/getReciptFillGrid?orgId=${orgId}&partyCode=${formData.customerCode}`
        );
      if (response.status === true) {
        setFillGridData(response.paramObjectsMap.reciptFillGrid);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
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
                                        label="Appraisal ID"
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
                            </div>

                            <div className="row mt-2">
                                <Box sx={{ width: '100%' }}>
                                    <Tabs
                                        value={value}
                                        onChange={handleTabChange}
                                        textColor="secondary"
                                        indicatorColor="secondary"
                                    >
                                        <Tab value={0} label="KPI's" />
                                        <Tab value={1} label="Details" />
                                    </Tabs>
                                </Box>
                                <Box sx={{ padding: 2 }}>
                                    {value === 0 && (
                                        <>
                                            <div className="mb-1">
                                                <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow} />
                                            </div>
                                            <div className="row mt-2">
                                                <div className="col-lg-12">
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered">
                                                            <thead>
                                                                <tr style={{
                                                                    background: 'linear-gradient(193deg, #3a6b6d 30%, #2a4b4d 90%)',
                                                                    color: 'white'
                                                                }}>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                                                                        Action
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                                                        S.No
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center">
                                                                        KPI ID
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center">
                                                                        KPI DESCRIPTION
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {goalsDetailsData.map((row, index) => (
                                                                    <tr key={row.id}>
                                                                        <td className="border px-2 py-2 text-center">
                                                                            <ActionButton
                                                                                title="Delete"
                                                                                icon={DeleteIcon}
                                                                                onClick={() => handleDeleteRow(row.id)}
                                                                            />
                                                                        </td>
                                                                        <td className="text-center pt-3">
                                                                            {index + 1}
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.kpiId}
                                                                                onChange={(e) =>
                                                                                    handleDetailChange(row.id, 'kpiId', e.target.value)
                                                                                }
                                                                                error={!!goalsDetailsErrors[index]?.kpiId}
                                                                                helperText={goalsDetailsErrors[index]?.kpiId}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.keyPerformanceIndicator}
                                                                                onChange={(e) =>
                                                                                    handleDetailChange(row.id, 'keyPerformanceIndicator', e.target.value)
                                                                                }
                                                                                error={!!goalsDetailsErrors[index]?.keyPerformanceIndicator}
                                                                                helperText={goalsDetailsErrors[index]?.keyPerformanceIndicator}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </Box>
                                <Box sx={{ padding: 2 }}>
                                    {value === 1 && (
                                        <>
                                            <div className="mb-1">
                                                <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow1} />
                                            </div>
                                            <div className="row mt-2">
                                                <div className="col-lg-12">
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered">
                                                            <thead>
                                                                <tr style={{
                                                                    background: 'linear-gradient(193deg, #3a6b6d 30%, #2a4b4d 90%)',
                                                                    color: 'white'
                                                                }}>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                                                                        Action
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                                                        S.No
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center">
                                                                        KRA ID
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center">
                                                                        KRA DESCRIPTION
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center">
                                                                        R/O
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center">
                                                                        KPI ID
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center">
                                                                        KPI DESCRIPTION
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {detailsTableData.map((row, index) => (
                                                                    <tr key={row.id}>
                                                                        <td className="border px-2 py-2 text-center">
                                                                            <ActionButton
                                                                                title="Delete"
                                                                                icon={DeleteIcon}
                                                                                onClick={() => handleDeleteRow1(row.id)}
                                                                            />
                                                                        </td>
                                                                        <td className="text-center pt-3">
                                                                            {index + 1}
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.kraId}
                                                                                onChange={(e) =>
                                                                                    handleDetailChange(row.id, 'kraId', e.target.value)
                                                                                }
                                                                                error={!!detailsTableErrors[index]?.kraId}
                                                                                helperText={detailsTableErrors[index]?.kraId}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.kraDescription}
                                                                                onChange={(e) =>
                                                                                    handleDetailChange(row.id, 'kraDescription', e.target.value)
                                                                                }
                                                                                error={!!detailsTableErrors[index]?.kraDescription}
                                                                                helperText={detailsTableErrors[index]?.kraDescription}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.goals}
                                                                                onChange={(e) =>
                                                                                    handleDetailChange(row.id, 'goals', e.target.value)
                                                                                }
                                                                                error={!!detailsTableErrors[index]?.goals}
                                                                                helperText={detailsTableErrors[index]?.goals}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.goals}
                                                                                onChange={(e) =>
                                                                                    handleDetailChange(row.id, 'goals', e.target.value)
                                                                                }
                                                                                error={!!detailsTableErrors[index]?.goals}
                                                                                helperText={detailsTableErrors[index]?.goals}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.goals}
                                                                                onChange={(e) =>
                                                                                    handleDetailChange(row.id, 'goals', e.target.value)
                                                                                }
                                                                                error={!!detailsTableErrors[index]?.goals}
                                                                                helperText={detailsTableErrors[index]?.goals}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </Box>
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

export default KRAKPI;