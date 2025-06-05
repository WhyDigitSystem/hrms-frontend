import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Avatar, ButtonBase, FormHelperText, Tooltip, TextField, Checkbox, FormControlLabel } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import CommonListViewTable from './CommonListViewTable';
import axios from 'axios';
import { useRef, useState, useMemo, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';
import { getAllActiveCountries, getAllActiveStatesByCountry } from 'utils/CommonFunctions';
import CommonBulkUpload from 'utils/CommonBulkUpload';
import COASample from '../../assets/sample-files/COASample.xlsx';
import { FaFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaFilePdf } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const City = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [editId, setEditId] = useState('');
    const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
    const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
    const [finyearList, setFinyearList] = useState([]);
    const [typeList, setTypeList] = useState([]);
    const [countryList, setCountryList] = useState([]);
    const [stateList, setStateList] = useState([]);
    const [showForm, setShowForm] = useState(true);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        finYear:'',
        type: '',
        appraiseId: '',
        effectiveFrom: '',
        effectiveTo: '',
        active: true
    });

    const [fieldErrors, setFieldErrors] = useState({
        finYear:'',
        type: '',
        appraiseId: '',
        effectiveFrom: '',
        effectiveTo: ''
    });
    const [listView, setListView] = useState(false);
    const [listViewData, setListViewData] = useState([]);

    const handleInputChange = (e) => {
        const { name, value, checked, selectionStart, selectionEnd, type } = e.target;
        const codeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;
        const nameRegex = /^[A-Za-z ]*$/;

        if (name === 'cityCode' && !codeRegex.test(value)) {
            setFieldErrors({ ...fieldErrors, [name]: 'Only AlphaNumerics are Allowed' });
        } else if (name === 'cityCode' && value.length > 3) {
            setFieldErrors({ ...fieldErrors, [name]: 'Max Length is 3' });
        } else if (name === 'cityName' && !nameRegex.test(value)) {
            setFieldErrors({ ...fieldErrors, [name]: 'Only Alphabets Allowed' });
        } else if (name === 'cityName' && value.length > 40) {
            setFieldErrors({ ...fieldErrors, [name]: 'Exceeded Max Length' });
        } else {
            setFormData({
                ...formData,
                [name]: name === 'active' ? checked : value.toUpperCase()
            });
            setFieldErrors({ ...fieldErrors, [name]: '' });

            // Update the cursor position after the input change
            if (type === 'text' || type === 'textarea') {
                setTimeout(() => {
                    const inputElement = document.getElementsByName(name)[0];
                    if (inputElement) {
                        inputElement.setSelectionRange(selectionStart, selectionEnd);
                    }
                }, 0);
            }
        }
    };

    const handleClear = () => {
        setFormData({
        finYear:'',
        type: '',
        appraiseId: '',
        effectiveFrom: '',
        effectiveTo: '',
        active: true
        });
        setFieldErrors({
        finYear:'',
        type: '',
        appraiseId: '',
        effectiveFrom: '',
        effectiveTo: ''
        });
        setEditId('');
    };
    const getCityById = async (row) => {
        console.log('THE SELECTED CITY ID IS:', row.original.id);
        setEditId(row.original.id);
        try {
            const response = await apiCalls('get', `commonmaster/city/${row.original.id}`);
            console.log('API Response:', response);

            if (response.status === true) {
                setListView(false);
                const particularCity = response.paramObjectsMap.cityVO;

                setFormData({
                    cityCode: particularCity.cityCode,
                    cityName: particularCity.cityName,
                    country: particularCity.country,
                    finYear: particularCity.finYear,
                    state: particularCity.state,
                    active: particularCity.active === 'Active' ? true : false
                });
            } else {
                console.error('API Error:', response);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSave = async () => {
        const errors = {};
        // if (!formData.cityCode) {
        //     errors.cityCode = 'City Code is required';
        // } else if (formData.cityCode.length <= 1) {
        //     errors.cityCode = 'Min Length is 2';
        // }

        // if (!formData.cityName) {
        //     errors.cityName = 'City Name is required';
        // } else if (formData.cityName.length <= 2) {
        //     errors.cityName = 'Min Length is 3';
        // }

        // if (!formData.state) {
        //     errors.state = 'State is required';
        // }
        // if (!formData.country) {
        //     errors.country = 'Country is required';
        // }

        if (Object.keys(errors).length === 0) {
            setIsLoading(true);
            const saveData = {
                ...(editId && { id: editId }),
                active: formData.active,
                cityCode: formData.cityCode,
                cityName: formData.cityName,
                state: formData.state,
                country: formData.country,
                orgId: orgId,
                createdBy: loginUserName
            };

            console.log('DATA TO SAVE', saveData);

            try {
                const response = await apiCalls('post', `commonmaster/createUpdateCity`, saveData);
                if (response.status === true) {
                    console.log('Response:', response);
                    showToast('success', editId ? ' Appraisal Period Updated Successfully' : 'Appraisal Period created successfully');
                    handleClear();
                    setIsLoading(false);
                } else {
                    showToast('error', response.paramObjectsMap.errorMessage || 'Appraisal Period creation failed');
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('error', 'Appraisal Period creation failed');
                setIsLoading(false);
            }
        } else {
            setFieldErrors(errors);
        }
    };

    const handleView = () => {
        setListView(!listView);
    };

    const listViewColumns = [
        { accessorKey: 'cityCode', header: 'Fin Year', size: 140 },
        { accessorKey: 'cityName', header: 'Type', size: 140 },
        { accessorKey: 'state', header: 'Appraise Id', size: 140 },
        { accessorKey: 'country', header: 'Effective From', size: 140 },
        { accessorKey: 'active', header: 'Effective To', size: 140 }
    ];

    return (
        <>
            <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
                <div className="row d-flex ml">
                    <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
                        {/* <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} /> */}
                        <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
                        <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                        <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px 0 10px" />
                    </div>
                </div>
                {listView ? (
                    <div className="mt-0">
                        <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getCityById} enableEditing={true} />
                    </div>
                ) : (
                    <>
                        <div className="row">

                            <div className="col-md-3 mb-3">
                                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.finYear}>
                                    <InputLabel id="FinanicialYear-label">Finanicial Year</InputLabel>
                                    <Select labelId="finYear-label" label="finYear" value={formData.finYear} onChange={handleInputChange} name="finYear">
                                        {Array.isArray(finyearList) &&
                                            finyearList?.map((row) => (
                                                <MenuItem key={row.id} value={row.finyear}>
                                                    {row.finyear}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                    {fieldErrors.finYear && <FormHelperText>{fieldErrors.finYear}</FormHelperText>}
                                </FormControl>
                            </div>

                            <div className="col-md-3 mb-3">
                                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.country}>
                                    <InputLabel id="type-label">Type</InputLabel>
                                    <Select labelId="type-label" label="type" value={formData.type} onChange={handleInputChange} name="type">
                                        {Array.isArray(typeList) &&
                                            typeList?.map((row) => (
                                                <MenuItem key={row.id} value={row.type}>
                                                    {row.type}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                    {fieldErrors.type && <FormHelperText>{fieldErrors.type}</FormHelperText>}
                                </FormControl>
                            </div>

                            <div className="col-md-3 mb-3">
                                <TextField
                                    label="Appraise ID"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    name="cityCode"
                                    value={formData.cityCode}
                                    onChange={handleInputChange}
                                    error={!!fieldErrors.cityCode}
                                    helperText={fieldErrors.cityCode}
                                />
                            </div>
                            <div className="col-md-3 mb-3">
                                <TextField
                                    label="Effective From"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    name="cityName"
                                    value={formData.cityName}
                                    onChange={handleInputChange}
                                    error={!!fieldErrors.cityName}
                                    helperText={fieldErrors.cityName}
                                />
                            </div>
                            <div className="col-md-3 mb-3">
                                <TextField
                                    label="Effective To"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    name="effectiveTo"
                                    value={formData.effectiveTo}
                                    onChange={handleInputChange}
                                    error={!!fieldErrors.effectiveTo}
                                    helperText={fieldErrors.effectiveTo}
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
            <ToastContainer />
        </>
    );
};

export default City;
