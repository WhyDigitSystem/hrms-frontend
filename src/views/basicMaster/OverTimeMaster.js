import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from './CommonListViewTable';
import { Select, MenuItem, InputLabel, FormControl, FormHelperText } from '@mui/material';

export const OverTimeMaster = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    active: true,
    otType: '',
    amountPerHour: ''
  });
  const [editId, setEditId] = useState('');

  const [fieldErrors, setFieldErrors] = useState({
    active: true,
    otType: '',
    amountPerHour: ''
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'amountPerHour', header: 'Project Code', size: 140 },
    {
      accessorKey: 'otType',
      header: 'Project Name',
      size: 140
    },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];
  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    getAllProject();
  }, []);

  const getAllProject = async () => {
    try {
      const result = await apiCalls('get', `master/getProjectMasterByOrgId?orgId=${orgId}`);
      setListViewData(result.paramObjectsMap.projectMasterVO.reverse());
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getProjectById = async (row) => {
    console.log('THE SELECTED DESIGNATION ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `master/getProjectMasterById?id=${row.original.id}`);

      if (response.status === true) {
        const particularCountry = response.paramObjectsMap.projectMasterVO;
        setFormData({
          amountPerHour: particularCountry.amountPerHour,
          otType: particularCountry.otType,
          active: particularCountry.active === 'Active' ? true : false
        });
        setListView(false);
      } else {
        console.error('API Error');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleClear = () => {
    setFormData({
      active: true,
      otType: '',
      amountPerHour: ''
    });
    setFieldErrors({
      active: true,
      otType: '',
      amountPerHour: ''
    });
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.amountPerHour) {
      errors.amountPerHour = 'Designation Code is required';
    } else if (formData.amountPerHour.length < 2) {
      errors.amountPerHour = 'Min Length is 2';
    }
    if (!formData.otType) {
      errors.otType = 'Designation is required';
    } else if (formData.otType.length <= 2) {
      errors.otType = 'Min Length is 3';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        amountPerHour: formData.amountPerHour,
        otType: formData.otType,
        orgId: parseInt(orgId),
        createdBy: loginUserName
      };

      console.log('DATA TO SAVE IS:', saveFormData);

      try {
        const result = await apiCalls('put', `master/createUpdateProjectMaster`, saveFormData);

        if (result.status === true) {
          console.log('Response:', result);
          showToast('success', editId ? ' Project Updated Successfully' : 'Project created successfully');
          handleClear();
          getAllProject();
          setIsLoading(false);
        } else {
          showToast('error', result.paramObjectsMap.errorMessage || 'Project creation failed');
          setIsLoading(false);
        }
      } catch (err) {
        console.log('error', err);
        showToast('error', 'Project creation failed');
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
            <ActionButton
              title="Save"
              icon={SaveIcon}
              isLoading={isLoading}
              onClick={() => handleSave()}
              margin="0 10px 0 10px"
            /> &nbsp;{' '}
          </div>
        </div>
        {listView ? (
          <div className="mt-0">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              blockEdit={true} // DISAPLE THE MODAL IF TRUE
              toEdit={getProjectById}
              enableEditing={true}
            />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.otType}>
                  <InputLabel id="otType-label">OT Type</InputLabel>
                  <Select
                    labelId="otType-label"
                    id="otType"
                    name="otType"
                    value={formData.otType}
                    label="OT Type"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">
                      <em>Select OT Type</em>
                    </MenuItem>
                    <MenuItem value="General OT">General OT</MenuItem>
                    <MenuItem value="Emergency OT">Emergency OT</MenuItem>
                    <MenuItem value="Weekend OT">Weekend OT</MenuItem>
                    <MenuItem value="Holiday OT">Holiday OT</MenuItem>
                  </Select>
                  <FormHelperText>{fieldErrors.otType}</FormHelperText>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Amount Per/Hour"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="amountPerHour"
                  value={formData.amountPerHour}
                  onChange={handleInputChange}
                  error={!!fieldErrors.amountPerHour}
                  helperText={fieldErrors.amountPerHour}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControlLabel
                  control={<Checkbox checked={formData.active} onChange={handleCheckboxChange} />}
                  label="Active"
                  labelPlacement="end"
                />
              </div>
            </div>
          </>
        )}
      </div>
      <div>
        <ToastComponent />
      </div>
    </>
  );
};
export default OverTimeMaster;
