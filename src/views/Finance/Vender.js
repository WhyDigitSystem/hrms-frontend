import React from 'react'
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Checkbox, FormControlLabel, FormGroup, Tab, Tabs } from '@mui/material';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import apiCalls from 'apicall';
import { useEffect, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import CommonBulkUpload from 'utils/CommonBulkUpload';
import UploadIcon from '@mui/icons-material/Upload';
import { getAllActiveCitiesByState, getAllActiveStatesByCountry } from 'utils/CommonFunctions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import SampleFile from '../../assets/sample-files/Sample_Format_Customer_Finance.xlsx';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Vender = () => {
    const [stateList, setStateList] = useState([]);
    const [editId, setEditId] = useState('');
    const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
    const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
    const [uploadOpen, setUploadOpen] = useState(false);
    const [formData, setFormData] = useState({
        active: true,
        vendorName: '',
        vendorCode: '',
        gstIn: '',
        panNo: '',
        creditLimit: '',
        creditDays: '',
        creditTerms: '',
        gstRegistered: '',
        createdBy: loginUserName,
        orgId: orgId,
    });
    const [listView, setListView] = useState(false);
    const [listViewData, setListViewData] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const handleChangeTab = (event, newValue) => {
        setTabValue(newValue);
    };

    const listViewColumns = [
        { accessorKey: 'partyCode', header: 'Vender Code', size: 140 },
        { accessorKey: 'partyName', header: 'Vender Name', size: 140 },
        { accessorKey: 'gstIn', header: 'Registration No', size: 140 },
        { accessorKey: 'panNo', header: 'Pan No', size: 140 },
        { accessorKey: 'creditLimit', header: 'Credit Limit', size: 140 },
        { accessorKey: 'creditDays', header: 'Credit Days', size: 140 },
        { accessorKey: 'creditTerms', header: 'Credit Terms', size: 140 },
        { accessorKey: 'gstRegistered', header: 'Tax Registered', size: 140 },
        // { accessorKey: 'active', header: 'Active', size: 140 },
    ];

    const handleView = () => {
        setListView(!listView);
    };

    const [fieldErrors, setFieldErrors] = useState({
        vendorCode: '',
        vendorName: '',
        gstIn: '',
        panNo: '',
        creditLimit: '',
        creditDays: '',
        creditTerms: '',
        gstRegistered: ''
    });

    useEffect(() => {
        getAllVendorByOrgId();
        getAllStates();
        getAllCities();
    }, []);


    const getAllVendorByOrgId = async () => {
        try {
            const response = await apiCalls('get', `master/getAllVendors?orgId=${orgId}`);
            console.log('API Response:', response);

            if (response.status === true) {
                setListViewData(response.paramObjectsMap.customersVO);
            } else {
                console.error('API Error:', response);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const getAllStates = async () => {
        try {
            const stateData = await getAllActiveStatesByCountry('INDIA', orgId);
            setStateList(stateData || []);
        } catch (error) {
            console.error('Error fetching states:', error);
            setStateList([]);
        }
    };

    const getAllCities = async (selectedState, rowId) => {
        try {
            const cityData = await getAllActiveCitiesByState(selectedState, orgId);
            setPartyAddressData((prevData) =>
                prevData.map((row) =>
                    row.id === rowId ? { ...row, cityOptions: cityData } : row
                )
            );
        } catch (error) {
            console.error('Error fetching cities:', error);
        }
    };

    const getCustomerById = async (row) => {
        console.log('THE SELECTED getPartyMasterById IS:', row.original.id);
        setEditId(row.original.id);
        try {
            const response = await apiCalls('get', `master/getCustomersById?id=${row.original.id}`);
            console.log('API Response:', response);

            if (response.status === true) {
                setListView(false);
                const vendorData = response.paramObjectsMap.customersVO;

                setFormData({
                    vendorName: vendorData.partyName,
                    vendorCode: vendorData.partyCode,
                    gstIn: vendorData.gstIn,
                    panNo: vendorData.panNo,
                    creditLimit: vendorData.creditLimit,
                    creditDays: vendorData.creditDays,
                    creditTerms: vendorData.creditTerms,
                    gstRegistered: vendorData.gstRegistered,
                    active: vendorData.active
                });

                setPartyStateData(
                    vendorData.partyStateVO.map((vendorState) => ({
                        id: vendorState.id,
                        state: vendorState.state || '',
                        gstIn: vendorState.gstIn || '',
                        stateNo: vendorState.stateNo || '',
                        contactPerson: vendorState.contactPerson || '',
                        contactPhoneNo: vendorState.contactPhoneNo || '',
                        email: vendorState.email || '',
                        stateCode: vendorState.stateCode || ''
                    }))
                );

                const addressData = vendorData.partyAddressVO.map((vendorAddress) => ({
                    id: vendorAddress.id,
                    addressType: vendorAddress.addressType || '',
                    addressLine1: vendorAddress.addressLine1 || '',
                    addressLine2: vendorAddress.addressLine2 || '',
                    addressLine3: vendorAddress.addressLine3 || '',
                    businessPlace: vendorAddress.businessPlace || '',
                    city: vendorAddress.city || '',
                    contact: vendorAddress.contact || '',
                    pincode: vendorAddress.pincode || '',
                    state: vendorAddress.state || '',
                    stateGstIn: vendorAddress.stateGstIn || '',
                    cityOptions: [],
                }));

                const partySpecialTDSVO = vendorData.partySpecialTDSVO.map((vendorSpecialTDSVO) => ({
                    id: vendorSpecialTDSVO.id,
                    tdsWithSec: vendorSpecialTDSVO.tdsWithSec || '',
                    rateFrom: vendorSpecialTDSVO.rateFrom || '',
                    rateTo: vendorSpecialTDSVO.rateTo || '',
                    tdsWithPer: vendorSpecialTDSVO.tdsWithPer || '',
                    surchargePer: vendorSpecialTDSVO.surchargePer || '',
                    edPercentage: vendorSpecialTDSVO.edPercentage || '',
                    tdsCertifiNo: vendorSpecialTDSVO.tdsCertifiNo || ''
                }))

                for (const row of addressData) {
                    if (row.state) {
                        const cityData = await getAllActiveCitiesByState(row.state, orgId);
                        row.cityOptions = cityData;
                    }
                }

                setPartyAddressData(addressData);
                setPartySpecialTDS(partySpecialTDSVO);

            }
        } catch (error) {
            console.error('Error fetching PartyMaster:', error);
        }
    };

    // const getCustomerById = async (row) => {
    //     handleClear();
    //     setEditId(row.original.id);
    //     console.log('Editing Exchange Rate:', row.original.id);
    //     try {
    //         const response = await apiCalls('get', `master/getCustomersById?id=${row.original.id}`);

    //         if (response.status === true) {
    //             const vendor = response.paramObjectsMap.customersVO[0];

    //             setFormData({
    //                 ...formData,
    //                 vendorName: vendor.partyName,
    //                 vendorCode: vendor.partyCode,
    //                 gstIn: vendor.gstIn,
    //                 panNo: vendor.panNo,
    //                 creditLimit: vendor.creditLimit,
    //                 creditDays: vendor.creditDays,
    //                 creditTerms: vendor.creditTerms,
    //                 gstRegistered: vendor.gstRegistered
    //             });

    //             setPartyStateData(
    //                 vendor.partyStateVO.map((detail) => ({
    //                     id: detail.id,
    //                     state: detail.state || '',
    //                     gstIn: detail.gstIn || '',
    //                     stateNo: detail.stateNo || '',
    //                     contactPerson: detail.contactPerson || '',
    //                     contactPhoneNo: detail.contactPhoneNo || '',
    //                     email: detail.email || '',
    //                     stateCode: detail.stateCode || ''
    //                 }))
    //             );

    //             const addressData = vendor.partyAddressVO.map((detail) => ({
    //                 id: detail.id,
    //                 addressType: detail.addressType || '',
    //                 addressLine1: detail.addressLine1 || '',
    //                 addressLine2: detail.addressLine2 || '',
    //                 addressLine3: detail.addressLine3 || '',
    //                 businessPlace: detail.businessPlace || '',
    //                 city: detail.city || '',
    //                 contact: detail.contact || '',
    //                 pincode: detail.pincode || '',
    //                 state: detail.state || '',
    //                 stateGstIn: detail.stateGstIn || '',
    //                 cityOptions: [],
    //             }));

    //             const partySpecialTDSVO = vendor.partySpecialTDSVO.map((detail) => ({
    //                 id: detail.id,
    //                 tdsWithSec: detail.tdsWithSec || '',
    //                 rateFrom: detail.rateFrom || '',
    //                 rateTo: detail.rateTo || '',
    //                 tdsWithPer: detail.tdsWithPer || '',
    //                 surchargePer: detail.surchargePer || '',
    //                 edPercentage: detail.edPercentage || '',
    //                 tdsCertifiNo: detail.tdsCertifiNo || ''
    //             }))

    //             setPartyAddressData(addressData);
    //             setPartySpecialTDS(partySpecialTDSVO);

    //         } else {
    //             console.error('API Error:', response.paramObjectsMap.errorMessage);
    //         }
    //     } catch (error) {
    //         console.error('Error fetching data:', error);
    //     }
    // };

    const handleBulkUploadOpen = () => {
        setUploadOpen(true);
    };

    const handleBulkUploadClose = () => {
        setUploadOpen(false);
    };

    const handleFileUpload = (event) => {
        console.log(event.target.files[0]);
    };

    const handleSubmit = () => {
        console.log('Submit clicked');
        handleBulkUploadClose();
        getAllVendorByOrgId();
    };

    const handleInputChange = (e) => {
        const { name, value, checked, type, id } = e.target;

        const updatedFormData = {
            ...formData,
            [name]: value,
        };

        setFormData(updatedFormData);
        setFormData((prev) => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value
        }));

        setFieldErrors({ ...fieldErrors, [name]: '' });
    };

    const handleClear = () => {
        setEditId('');
        setFormData({
            vendorName: '',
            vendorCode: '',
            gstIn: '',
            panNo: '',
            creditLimit: '',
            creditDays: '',
            creditTerms: '',
            gstRegistered: '',
            active: true
        });
        setFieldErrors({
            vendorName: '',
            vendorCode: '',
            gstIn: '',
            panNo: '',
            creditLimit: '',
            creditDays: '',
            creditTerms: '',
            gstRegistered: ''
        });
        setPartyStateData([
            {
                state: '',
                gstIn: '',
                stateNo: '',
                contactPerson: '',
                contactPhoneNo: '',
                email: '',
                stateCode: ''
            }
        ]);
        setPartyStateDataErrors([]);
        setPartyAddressData([
            {
                addressType: '',
                addressLine1: '',
                addressLine2: '',
                addressLine3: '',
                businessPlace: '',
                city: '',
                contact: '',
                pincode: '',
                state: '',
                stateGstIn: ''
            }
        ]);
        setPartyAddressDataErrors([]);

        setPartySpecialTDSErrors([]);
        setPartySpecialTDS([
            {
                edPercentage: '',
                rateFrom: '',
                rateTo: '',
                surchargePer: '',
                tdsCertifiNo: '',
                tdsWithPer: '',
                tdsWithSec: ''
            }
        ]);

    };

    const isLastRowEmpty = (table) => {
        const lastRow = table[table.length - 1];
        if (!lastRow) return false;

        if (table === partyStateData) {
            return !lastRow.state;
        }
        if (table === partyAddressData) {
            return !lastRow.state;
        }
        if (table === partySpecialTDS) {
            return !lastRow.tdsWithSec;
        }
        return false;
    };

    const displayRowError = (table) => {
        if (table === partyStateData) {
            setPartyStateDataErrors((prevErrors) => {
                const newErrors = [...prevErrors];
                newErrors[table.length - 1] = {
                    ...newErrors[table.length - 1],
                    state: !table[table.length - 1].state ? 'State is required' : ''
                };
                return newErrors;
            });
        }
        if (table === partyAddressData) {
            setPartyAddressDataErrors((prevErrors) => {
                const newErrors = [...prevErrors];
                newErrors[table.length - 1] = {
                    ...newErrors[table.length - 1],
                    state: !table[table.length - 1].state ? 'State is required' : ''
                };
                return newErrors;
            });
        }
        if (table === partySpecialTDS) {
            setPartySpecialTDSErrors((prevErrors) => {
                const newErrors = [...prevErrors];
                newErrors[table.length - 1] = {
                    ...newErrors[table.length - 1],
                    tdsWithSec: !table[table.length - 1].tdsWithSec ? 'TDS Section is required' : ''
                };
                return newErrors;
            });
        }
    };

    const handleDeleteRow = (id, table, setTable, errorTable, setErrorTable) => {
        const rowIndex = table.findIndex((row) => row.id === id);
        if (rowIndex !== -1) {
            const updatedData = table.filter((row) => row.id !== id);
            const updatedErrors = errorTable.filter((_, index) => index !== rowIndex);
            setTable(updatedData);
            setErrorTable(updatedErrors);
        }
    };

    const handleStateChange = (row, index, event) => {
        const value = event.target.value;
        const selectedState = stateList.find((state) => state.stateName === value);

        setPartyStateData((prev) =>
            prev.map((r) =>
                r.id === row.id
                    ? {
                        ...r,
                        state: value,
                        stateCode: selectedState ? selectedState.stateCode : '',
                        stateNo: selectedState ? selectedState.stateNumber : ''
                    }
                    : r
            )
        );

        setPartyStateDataErrors((prev) => {
            const newErrors = [...prev];
            newErrors[index] = {
                ...newErrors[index],
                state: !value ? 'State is required' : ''
            };
            return newErrors;
        });
    };

    const getAvailableStates = (currentRowId) => {
        if (!Array.isArray(stateList)) {
            console.error('stateList is not an array:', stateList);
            return [];
        }
        return stateList.map((state) => ({
            id: state.id,
            stateName: state.stateName,
        }));
    };

    const [partyStateData, setPartyStateData] = useState([
        {
            id: 1,
            state: '',
            gstIn: '',
            stateNo: '',
            contactPerson: '',
            contactPhoneNo: '',
            email: '',
            stateCode: ''
        }
    ]);

    const [partyStateDataErrors, setPartyStateDataErrors] = useState([
        {
            state: '',
            gstIn: '',
            stateNo: '',
            contactPerson: '',
            contactPhoneNo: '',
            email: '',
            stateCode: ''
        }
    ]);

    const handleAddRowPartyState = () => {
        if (isLastRowEmpty(partyStateData)) {
            displayRowError(partyStateData);
            return;
        }
        const newRow = {
            id: Date.now(),
            state: '',
            gstIn: '',
            stateNo: '',
            contactPerson: '',
            contactPhoneNo: '',
            email: '',
            stateCode: ''
        };
        setPartyStateData([...partyStateData, newRow]);
        setPartyStateDataErrors([
            ...partyStateDataErrors,
            {
                state: '',
                gstIn: '',
                stateNo: '',
                contactPerson: '',
                contactPhoneNo: '',
                email: '',
                stateCode: ''
            }
        ]);
    };

    const [partyAddressData, setPartyAddressData] = useState([
        {
            id: 1,
            addressType: '',
            addressLine1: '',
            addressLine2: '',
            addressLine3: '',
            businessPlace: '',
            city: '',
            contact: '',
            pincode: '',
            state: '',
            stateGstIn: '',
            cityOptions: [] // Stores city options for this row
        }
    ]);

    const [partyAddressDataErrors, setPartyAddressDataErrors] = useState([
        {
            addressType: '',
            addressLine1: '',
            addressLine2: '',
            addressLine3: '',
            businessPlace: '',
            city: '',
            contact: '',
            pincode: '',
            state: '',
            stateGstIn: ''
        }
    ]);

    const handleAddRowPartyAddress = () => {
        if (isLastRowEmpty(partyAddressData)) {
            displayRowError(partyAddressData);
            return;
        }
        const newRow = {
            id: Date.now(),
            addressType: '',
            addressLine1: '',
            addressLine2: '',
            addressLine3: '',
            businessPlace: '',
            city: '',
            contact: '',
            pincode: '',
            state: '',
            stateGstIn: '',
            cityOptions: [] // Initialize city options as empty
        };
        setPartyAddressData([...partyAddressData, newRow]);
        setPartyAddressDataErrors([
            ...partyAddressDataErrors,
            {
                addressType: '',
                addressLine1: '',
                addressLine2: '',
                addressLine3: '',
                businessPlace: '',
                city: '',
                contact: '',
                pincode: '',
                state: '',
                stateGstIn: ''
            }
        ]);
    }

    const [partySpecialTDS, setPartySpecialTDS] = useState([
        {
            id: 1,
            edPercentage: '',
            rateFrom: '',
            rateTo: '',
            surchargePer: '',
            tdsCertifiNo: '',
            tdsWithPer: '',
            tdsWithSec: ''
        }
    ]);

    const [partySpecialTDSErrors, setPartySpecialTDSErrors] = useState([
        {
            edPercentage: '',
            rateFrom: '',
            rateTo: '',
            surchargePer: '',
            tdsCertifiNo: '',
            tdsWithPer: '',
            tdsWithSec: ''
        }
    ]);

    const handleAddRowSpecialTdsWhTaxDetail = () => {
        if (isLastRowEmpty(partySpecialTDS)) {
            displayRowError(partySpecialTDS);
            return;
        }
        const newRow = {
            id: Date.now(),
            edPercentage: '',
            rateFrom: '',
            rateTo: '',
            surchargePer: '',
            tdsCertifiNo: '',
            tdsWithPer: '',
            tdsWithSec: ''
        };
        setPartySpecialTDS([...partySpecialTDS, newRow]);
        setPartySpecialTDSErrors([
            ...partySpecialTDSErrors,
            {
                edPercentage: '',
                rateFrom: '',
                rateTo: '',
                surchargePer: '',
                tdsCertifiNo: '',
                tdsWithPer: '',
                tdsWithSec: ''
            }
        ]);
    };

    const handleSave = async () => {
        const errors = {};

        if (!formData.vendorName) {
            errors.vendorName = 'Vender Name is required';
        }
        setFieldErrors(errors);

        let partyAddressDataValid = true;
        const newTableErrors1 = partyAddressData.map((row) => {
            const rowErrors = {};
            if (!row.state) {
                rowErrors.state = 'State is required';
                partyAddressDataValid = false;
            }
            return rowErrors;
        });
        setPartyAddressDataErrors(newTableErrors1);

        if (
            Object.keys(errors).length === 0 &&
            partyAddressDataValid
        ) {
            const vendorAddressVO = partyAddressData.map((row) => ({
                addressType: row.addressType,
                addressLane1: row.addressLine1,
                addressLane2: row.addressLine2,
                addressLane3: row.addressLine3,
                bussinesPlace: row.businessPlace,
                city: row.city,
                contact: row.contact,
                pinCode: parseInt(row.pincode),
                state: row.state,
                gstnIn: row.stateGstIn
            }));

            const vendorStateVO = partyStateData.map((row) => ({
                email: row.email,
                contactPerson: row.contactPerson,
                phoneNo: row.contactPhoneNo,
                gstIn: row.gstIn,
                state: row.state,
                stateCode: row.stateCode,
                stateNo: parseInt(row.stateNo)
            }));

            const specialTdsVO = partySpecialTDS.map((row) => ({
                edPercentage: parseInt(row.edPercentage),
                rateFrom: parseInt(row.rateFrom),
                rateTo: parseInt(row.rateTo),
                surPercentage: parseInt(row.surchargePer),
                tdsCertificateNo: row.tdsCertifiNo,
                whPercentage: parseInt(row.tdsWithPer),
                whSection: row.tdsWithSec
            }));

            const saveData = {
                ...(editId && { id: editId }),
                // ...formData,
                vendorName: formData.vendorName,
                vendorCode: formData.vendorCode,
                gstIn: formData.gstIn,
                panNo: formData.panNo,
                creditLimit: formData.creditLimit,
                creditDays: formData.creditDays,
                creditTerms: formData.creditTerms,
                taxRegistered: formData.gstRegistered,
                active: formData.active,
                createdBy: loginUserName,
                orgId: orgId,
                vendorAddressDTO: vendorAddressVO,
                vendorStateDTO: vendorStateVO,
                specialTdsDTO: specialTdsVO,
            };


            console.log('DATA TO SAVE', saveData);

            try {
                const response = await apiCalls('put', `/master/createUpdateVendor`, saveData);
                if (response.status === true) {
                    console.log('Response:', response);
                    showToast('success', editId ? ' Vender Updated Successfully' : 'Vender created successfully');
                    handleClear();
                    getAllVendorByOrgId();
                } else {
                    showToast('error', response.paramObjectsMap.errorMessage || 'Vender creation failed');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('An error occurred while saving the Vender');
            }
        } else {
            setFieldErrors(errors);
        }
    };

    return (
        <>
            <div>
                <ToastContainer />
            </div>
            <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
                <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
                    <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
                    <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                    <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
                    <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} />
                    <ActionButton icon={UploadIcon} title="Upload" onClick={handleBulkUploadOpen} />

                    {uploadOpen && (
                        <CommonBulkUpload
                            open={uploadOpen}
                            handleClose={handleBulkUploadClose}
                            title="Upload Files"
                            uploadText="Upload file"
                            downloadText="Sample File"
                            fileName="sampleFile.xlsx"
                            onSubmit={handleSubmit}
                            sampleFileDownload={SampleFile}
                            handleFileUpload={handleFileUpload}
                            apiUrl={`/master/vendorUpload`}
                            screen="PutAway"
                            loginUser={loginUserName}
                            orgId={orgId}
                        />
                    )}
                </div>
                {listView ? (
                    <div className="mt-4">
                        <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getCustomerById} />
                    </div>
                ) : (
                    <>
                        <div className="row d-flex ml">

                            <div className="col-md-3 mb-3">
                                <TextField
                                    id="vendorName"
                                    fullWidth
                                    name="vendorName"
                                    label="Vendor Name"
                                    size="small"
                                    value={formData.vendorName}
                                    onChange={handleInputChange}
                                    error={fieldErrors.vendorName}
                                    helperText={fieldErrors.vendorName}
                                />
                            </div>

                            <div className="col-md-3 mb-3">
                                <TextField
                                    id="vendorCode"
                                    fullWidth
                                    name="vendorCode"
                                    label="Vendor Code"
                                    size="small"
                                    disabled
                                    value={formData.vendorCode}
                                    onChange={handleInputChange}
                                // error={fieldErrors.vendorCode}
                                // helperText={fieldErrors.vendorCode}
                                />
                            </div>

                            <div className="col-md-3 mb-3">
                                <TextField
                                    id="gstIn"
                                    fullWidth
                                    name="gstIn"
                                    label="Registration No"
                                    size="small"
                                    value={formData.gstIn}
                                    onChange={handleInputChange}
                                    // error={fieldErrors.gstIn}
                                    // helperText={fieldErrors.gstIn}
                                    inputProps={{ maxLength: 15 }}
                                />
                            </div>

                            <div className="col-md-3 mb-3">
                                <TextField
                                    id="panNo"
                                    fullWidth
                                    name="panNo"
                                    label="PAN No"
                                    size="small"
                                    value={formData.panNo}
                                    onChange={handleInputChange}
                                // error={fieldErrors.panNo}
                                // helperText={fieldErrors.panNo}
                                />
                            </div>

                            <div className="col-md-3 mb-3">
                                <TextField
                                    id="creditLimit"
                                    fullWidth
                                    name="creditLimit"
                                    label="Credit Limit"
                                    size="small"
                                    type="number"
                                    value={formData.creditLimit}
                                    onChange={handleInputChange}
                                // error={fieldErrors.creditLimit}
                                // helperText={fieldErrors.creditLimit}
                                />
                            </div>

                            <div className="col-md-3 mb-3">
                                <TextField
                                    id="creditDays"
                                    fullWidth
                                    name="creditDays"
                                    label="Credit Days"
                                    size="small"
                                    type="number"
                                    value={formData.creditDays}
                                    onChange={handleInputChange}
                                // error={fieldErrors.creditDays}
                                // helperText={fieldErrors.creditDays}
                                />
                            </div>

                            <div className="col-md-3 mb-3">
                                <FormControl variant="outlined" fullWidth size="small">
                                    <InputLabel id="creditTerms">Credit Terms</InputLabel>
                                    <Select
                                        labelId="creditTerms"
                                        label="Credit Terms"
                                        name="creditTerms"
                                        value={formData.creditTerms}
                                        onChange={handleInputChange}
                                    >
                                        <MenuItem value="Prepaid">Prepaid</MenuItem>
                                        <MenuItem value="Immediate">Immediate</MenuItem>
                                        <MenuItem value="Credit">Credit</MenuItem>
                                    </Select>
                                    {/* {fieldErrors.creditTerms && <FormHelperText>{fieldErrors.creditTerms}</FormHelperText>} */}
                                </FormControl>
                            </div>

                            <div className="col-md-3 mb-3">
                                <FormControl variant="outlined" fullWidth size="small">
                                    <InputLabel id="gstRegistered">Tax Registered</InputLabel>
                                    <Select
                                        labelId="gstRegistered"
                                        label="Tax Registered"
                                        name="gstRegistered"
                                        value={formData.gstRegistered}
                                        onChange={handleInputChange}
                                    >
                                        <MenuItem value="Yes">Yes</MenuItem>
                                        <MenuItem value="No">No</MenuItem>
                                    </Select>
                                    {/* {fieldErrors.gstRegistered && <FormHelperText>{fieldErrors.gstRegistered}</FormHelperText>} */}
                                </FormControl>
                            </div>

                            {/* <div className="col-md-3 mb-3">
                                <FormGroup>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                id="active"
                                                checked={formData.active}
                                                onChange={handleInputChange}
                                                sx={{ '& .MuiSvgIcon-root': { color: '#5e35b1' } }}
                                            />
                                        }
                                        label="Active"
                                    />
                                </FormGroup>
                            </div> */}

                        </div>

                        <div className="row mt-2">
                            <Box sx={{ width: '100%' }}>
                                <Tabs value={tabValue} onChange={handleChangeTab} variant="scrollable" scrollButtons="auto">
                                    <Tab label="Party State" />
                                    <Tab label="Address" />
                                    <Tab label="Tax Detail" />
                                </Tabs>
                            </Box>
                            <Box sx={{ padding: 2 }}>

                                {tabValue === 0 && (
                                    <div className="row d-flex ml">
                                        <div className="">
                                            <ActionButton title="Add" icon={AddIcon} onClick={handleAddRowPartyState} />
                                        </div>
                                        <div className="row mt-2">
                                            <div className="col-lg-12">
                                                <div className="table-responsive">
                                                    <table className="table table-bordered">
                                                        <thead>
                                                            <tr style={{ backgroundColor: '#673AB7' }}>
                                                                <th className="table-header">Action</th>
                                                                <th className="table-header">SNo</th>
                                                                <th className="table-header">State</th>
                                                                <th className="table-header">State Code</th>
                                                                <th className="table-header">State No</th>
                                                                <th className="table-header">Registration No</th>
                                                                <th className="table-header">Contact Person</th>
                                                                <th className="table-header">Contact Phone No</th>
                                                                <th className="table-header">Contact Email</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {partyStateData.map((row, index) => (
                                                                <tr key={row.id}>
                                                                    <td className="border px-2 py-2 text-center">
                                                                        <ActionButton
                                                                            title="Delete"
                                                                            icon={DeleteIcon}
                                                                            onClick={() =>
                                                                                handleDeleteRow(
                                                                                    row.id,
                                                                                    partyStateData,
                                                                                    setPartyStateData,
                                                                                    partyStateDataErrors,
                                                                                    setPartyStateDataErrors
                                                                                )
                                                                            }
                                                                        />
                                                                    </td>
                                                                    <td className="text-center">
                                                                        <div className="pt-2">{index + 1}</div>
                                                                    </td>

                                                                    <td className="border px-2 py-2">
                                                                        <select
                                                                            value={row.state}
                                                                            style={{ width: '150px' }}
                                                                            onChange={(e) => handleStateChange(row, index, e)}
                                                                            className={partyStateDataErrors[index]?.state ? 'error form-control' : 'form-control'}
                                                                        >
                                                                            <option value="">Select State</option>
                                                                            {getAvailableStates(row.id).map((state) => (
                                                                                <option key={state.id} value={state.stateName}>
                                                                                    {state.stateName}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                        {partyStateDataErrors[index]?.state && (
                                                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                                                                {partyStateDataErrors[index].state}
                                                                            </div>
                                                                        )}
                                                                    </td>

                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={row.stateCode}
                                                                            style={{ width: '150px' }}
                                                                            maxLength={3}
                                                                            disabled
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartyStateData((prev) => prev.map((r) => (r.id === row.id ? { ...r, stateCode: value } : r)));
                                                                                setPartyStateDataErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        stateCode: !value ? 'State Code is required' : ''
                                                                                    };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partyStateDataErrors[index]?.stateCode ? 'error form-control' : 'form-control'}
                                                                        />
                                                                        {partyStateDataErrors[index]?.stateCode && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partyStateDataErrors[index].stateCode}</div>
                                                                        )}
                                                                    </td>

                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="number"
                                                                            value={row.stateNo}
                                                                            style={{ width: '150px' }}
                                                                            disabled
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartyStateData((prev) => prev.map((r) => (r.id === row.id ? { ...r, stateNo: value } : r)));
                                                                                setPartyStateDataErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        stateNo: !value ? 'State No is required' : ''
                                                                                    };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partyStateDataErrors[index]?.stateNo ? 'error form-control' : 'form-control'}
                                                                        />
                                                                        {partyStateDataErrors[index]?.stateNo && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partyStateDataErrors[index].stateNo}</div>
                                                                        )}
                                                                    </td>

                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={row.gstIn}
                                                                            style={{ width: '150px' }}
                                                                            maxLength={15}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartyStateData((prev) => prev.map((r) => (r.id === row.id ? { ...r, gstIn: value } : r)));
                                                                                setPartyStateDataErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = { ...newErrors[index], gstIn: !value ? 'GstIn is required' : '' };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partyStateDataErrors[index]?.gstIn ? 'error form-control' : 'form-control'}
                                                                        />
                                                                        {partyStateDataErrors[index]?.gstIn && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partyStateDataErrors[index].gstIn}</div>
                                                                        )}
                                                                    </td>

                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={row.contactPerson}
                                                                            style={{ width: '150px' }}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartyStateData((prev) =>
                                                                                    prev.map((r) => (r.id === row.id ? { ...r, contactPerson: value } : r))
                                                                                );
                                                                                setPartyStateDataErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        contactPerson: !value ? 'Contact Person is required' : ''
                                                                                    };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partyStateDataErrors[index]?.contactPerson ? 'error form-control' : 'form-control'}
                                                                        />
                                                                        {partyStateDataErrors[index]?.contactPerson && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partyStateDataErrors[index].contactPerson}</div>
                                                                        )}
                                                                    </td>
                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={row.contactPhoneNo}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;

                                                                                if (/^\d{0,10}$/.test(value)) {
                                                                                    setPartyStateData((prev) =>
                                                                                        prev.map((r) => (r.id === row.id ? { ...r, contactPhoneNo: value } : r))
                                                                                    );

                                                                                    setPartyStateDataErrors((prev) => {
                                                                                        const newErrors = [...prev];
                                                                                        newErrors[index] = {
                                                                                            ...newErrors[index],
                                                                                            contactPhoneNo: !value
                                                                                                ? 'Phone is required'
                                                                                                : value.length !== 10
                                                                                                    ? 'Phone number must be exactly 10 digits'
                                                                                                    : ''
                                                                                        };
                                                                                        return newErrors;
                                                                                    });
                                                                                }
                                                                            }}
                                                                            maxLength="10"
                                                                            className={partyStateDataErrors[index]?.contactPhoneNo ? 'error form-control' : 'form-control'}
                                                                        />
                                                                        {partyStateDataErrors[index]?.contactPhoneNo && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partyStateDataErrors[index].contactPhoneNo}</div>
                                                                        )}
                                                                    </td>
                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={row.email}
                                                                            style={{ width: '150px' }}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                const isValidEmail = emailRegex.test(value);

                                                                                setPartyStateData((prev) => prev.map((r) => (r.id === row.id ? { ...r, email: value } : r)));

                                                                                setPartyStateDataErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        email: !value ? 'Email is required' : !isValidEmail ? 'Invalid Email Address' : ''
                                                                                    };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partyStateDataErrors[index]?.email ? 'error form-control' : 'form-control'}
                                                                        />
                                                                        {partyStateDataErrors[index]?.email && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partyStateDataErrors[index].email}</div>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {tabValue === 1 && (
                                    <div className="row d-flex ml">
                                        <div className="">
                                            <ActionButton title="Add" icon={AddIcon} onClick={handleAddRowPartyAddress} />
                                        </div>
                                        <div className="row mt-2">
                                            <div className="col-lg-12">
                                                <div className="table-responsive">
                                                    <table className="table table-bordered">
                                                        <thead>
                                                            <tr style={{ backgroundColor: '#673AB7' }}>
                                                                <th className="table-header">Action</th>
                                                                <th className="table-header">SNo</th>
                                                                <th className="table-header">State</th>
                                                                <th className="table-header">City</th>
                                                                <th className="table-header">Business Place</th>
                                                                <th className="table-header">State GST IN</th>
                                                                <th className="table-header">Address Type</th>
                                                                <th className="table-header">Address Line1</th>
                                                                <th className="table-header">Address Line2</th>
                                                                <th className="table-header">Address Line3</th>
                                                                <th className="table-header">Pin Code</th>
                                                                <th className="table-header">Contact</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {partyAddressData.map((row, index) => (
                                                                <tr key={row.id}>
                                                                    <td className="border px-2 py-2 text-center">
                                                                        <ActionButton
                                                                            title="Delete"
                                                                            icon={DeleteIcon}
                                                                            onClick={() =>
                                                                                handleDeleteRow(
                                                                                    row.id,
                                                                                    partyAddressData,
                                                                                    setPartyAddressData,
                                                                                    partyAddressDataErrors,
                                                                                    setPartyAddressDataErrors
                                                                                )
                                                                            }
                                                                        />
                                                                    </td>
                                                                    <td className="text-center">
                                                                        <div className="pt-2">{index + 1}</div>
                                                                    </td>

                                                                    <td className="border px-2 py-2">
                                                                        <select
                                                                            value={row.state}
                                                                            style={{ width: '150px' }}
                                                                            onChange={(e) => {
                                                                                const updatedPartyAddressData = [...partyAddressData];
                                                                                updatedPartyAddressData[index].state = e.target.value;
                                                                                updatedPartyAddressData[index].city = '';
                                                                                setPartyAddressData(updatedPartyAddressData);
                                                                                getAllCities(e.target.value, row.id);
                                                                            }}
                                                                            className={partyAddressDataErrors[index]?.state ? 'error form-control' : 'form-control'}
                                                                        >
                                                                            <option value="">--Select--</option>
                                                                            {stateList?.map((state) => (
                                                                                <option key={state.id} value={state.stateName}>
                                                                                    {state.stateName}
                                                                                </option>
                                                                            ))}
                                                                        </select>

                                                                        {partyAddressDataErrors[index]?.state && (
                                                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                                                                {partyAddressDataErrors[index].state}
                                                                            </div>
                                                                        )}
                                                                    </td>

                                                                    <td className="border px-2 py-2">
                                                                        <select
                                                                            value={row.city}
                                                                            style={{ width: '150px' }}
                                                                            onChange={(e) => {
                                                                                const updatedPartyAddressData = [...partyAddressData];
                                                                                updatedPartyAddressData[index].city = e.target.value;
                                                                                setPartyAddressData(updatedPartyAddressData);
                                                                            }}
                                                                            className={partyAddressDataErrors[index]?.city ? 'error form-control' : 'form-control'}
                                                                        >
                                                                            <option value="">--Select--</option>
                                                                            {row.cityOptions?.map((city) => (
                                                                                <option key={city.id} value={city.cityName}>
                                                                                    {city.cityName}
                                                                                </option>
                                                                            ))}
                                                                        </select>

                                                                        {partyAddressDataErrors[index]?.city && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partyAddressDataErrors[index].city}</div>
                                                                        )}
                                                                    </td>

                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={row.businessPlace}
                                                                            maxLength={15}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartyAddressData((prev) =>
                                                                                    prev.map((r) => (r.id === row.id ? { ...r, businessPlace: value } : r))
                                                                                );
                                                                                setPartyAddressDataErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        businessPlace: !value ? 'Business Place In is required' : ''
                                                                                    };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partyAddressDataErrors[index]?.businessPlace ? 'error form-control' : 'form-control'}
                                                                            style={{ width: '150px' }}
                                                                        />
                                                                        {partyAddressDataErrors[index]?.businessPlace && (
                                                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                                                                {partyAddressDataErrors[index].businessPlace}
                                                                            </div>
                                                                        )}
                                                                    </td>

                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={row.stateGstIn}
                                                                            maxLength={15}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartyAddressData((prev) => prev.map((r) => (r.id === row.id ? { ...r, stateGstIn: value } : r)));
                                                                                setPartyAddressDataErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = { ...newErrors[index], stateGstIn: !value ? 'State Gst In is required' : '' };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partyAddressDataErrors[index]?.stateGstIn ? 'error form-control' : 'form-control'}
                                                                            style={{ width: '150px' }}
                                                                        />
                                                                        {partyAddressDataErrors[index]?.stateGstIn && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partyAddressDataErrors[index].stateGstIn}</div>
                                                                        )}
                                                                    </td>

                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={row.addressType}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartyAddressData((prev) =>
                                                                                    prev.map((r) => (r.id === row.id ? { ...r, addressType: value } : r))
                                                                                );
                                                                                setPartyAddressDataErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        addressType: !value ? 'Address  Type is required' : ''
                                                                                    };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partyAddressDataErrors[index]?.addressType ? 'error form-control' : 'form-control'}
                                                                            style={{ width: '150px' }}
                                                                        />
                                                                        {partyAddressDataErrors[index]?.addressType && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partyAddressDataErrors[index].addressType}</div>
                                                                        )}
                                                                    </td>

                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={row.addressLine1}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartyAddressData((prev) =>
                                                                                    prev.map((r) => (r.id === row.id ? { ...r, addressLine1: value } : r))
                                                                                );
                                                                                setPartyAddressDataErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        addressLine1: !value ? 'Address Line1 is required' : ''
                                                                                    };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partyAddressDataErrors[index]?.addressLine1 ? 'error form-control' : 'form-control'}
                                                                            style={{ width: '150px' }}
                                                                        />
                                                                        {partyAddressDataErrors[index]?.addressLine1 && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partyAddressDataErrors[index].addressLine1}</div>
                                                                        )}
                                                                    </td>
                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={row.addressLine2}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartyAddressData((prev) =>
                                                                                    prev.map((r) => (r.id === row.id ? { ...r, addressLine2: value } : r))
                                                                                );
                                                                                setPartyAddressDataErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        addressLine2: !value ? 'Address Line2 is required' : ''
                                                                                    };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partyAddressDataErrors[index]?.addressLine2 ? 'error form-control' : 'form-control'}
                                                                            style={{ width: '150px' }}
                                                                        />
                                                                        {partyAddressDataErrors[index]?.addressLine2 && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partyAddressDataErrors[index].addressLine2}</div>
                                                                        )}
                                                                    </td>
                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={row.addressLine3}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartyAddressData((prev) =>
                                                                                    prev.map((r) => (r.id === row.id ? { ...r, addressLine3: value } : r))
                                                                                );
                                                                                setPartyAddressDataErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        addressLine3: !value ? 'Address Line3 is required' : ''
                                                                                    };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partyAddressDataErrors[index]?.addressLine3 ? 'error form-control' : 'form-control'}
                                                                            style={{ width: '150px' }}
                                                                        />
                                                                        {partyAddressDataErrors[index]?.addressLine3 && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partyAddressDataErrors[index].addressLine3}</div>
                                                                        )}
                                                                    </td>
                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={row.pincode}
                                                                            style={{ width: '150px' }}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;

                                                                                if (/^\d{0,6}$/.test(value)) {
                                                                                    setPartyAddressData((prev) => prev.map((r) => (r.id === row.id ? { ...r, pincode: value } : r)));

                                                                                    setPartyAddressDataErrors((prev) => {
                                                                                        const newErrors = [...prev];
                                                                                        newErrors[index] = {
                                                                                            ...newErrors[index],
                                                                                            pincode: !value
                                                                                                ? 'Pin Code is required'
                                                                                                : value.length !== 6
                                                                                                    ? 'Pin Code must be exactly 6 digits'
                                                                                                    : ''
                                                                                        };
                                                                                        return newErrors;
                                                                                    });
                                                                                }
                                                                            }}
                                                                            maxLength="6"
                                                                            className={partyAddressDataErrors[index]?.pincode ? 'error form-control' : 'form-control'}
                                                                        />
                                                                        {partyAddressDataErrors[index]?.pincode && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partyAddressDataErrors[index].pincode}</div>
                                                                        )}
                                                                    </td>
                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={row.contact}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartyAddressData((prev) => prev.map((r) => (r.id === row.id ? { ...r, contact: value } : r)));
                                                                                setPartyAddressDataErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        contact: !value ? 'Contact is required' : ''
                                                                                    };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partyAddressDataErrors[index]?.contact ? 'error form-control' : 'form-control'}
                                                                            style={{ width: '150px' }}
                                                                        />
                                                                        {partyAddressDataErrors[index]?.contact && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partyAddressDataErrors[index].contact}</div>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {tabValue === 2 && (
                                    <div className="row d-flex ml">
                                        <div className="">
                                            <ActionButton title="Add" icon={AddIcon} onClick={handleAddRowSpecialTdsWhTaxDetail} />
                                        </div>
                                        <div className="row mt-2">
                                            <div className="col-lg-12">
                                                <div className="table-responsive">
                                                    <table className="table table-bordered">
                                                        <thead>
                                                            <tr style={{ backgroundColor: '#673AB7' }}>
                                                                <th className="table-header">Action</th>
                                                                <th className="table-header">SNo</th>
                                                                <th className="table-header">Tax Section</th>
                                                                <th className="table-header">Rate From</th>
                                                                <th className="table-header">Rate To</th>
                                                                <th className="table-header">Tax %</th>
                                                                <th className="table-header">SUR %</th>
                                                                <th className="table-header">ED %</th>
                                                                <th className="table-header">Tax Certificate No</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {partySpecialTDS.map((row, index) => (
                                                                <tr key={row.id}>
                                                                    <td className="border px-2 py-2 text-center">
                                                                        <ActionButton
                                                                            title="Delete"
                                                                            icon={DeleteIcon}
                                                                            onClick={() =>
                                                                                handleDeleteRow(
                                                                                    row.id,
                                                                                    partySpecialTDS,
                                                                                    setPartySpecialTDS,
                                                                                    partySpecialTDSErrors,
                                                                                    setPartySpecialTDSErrors
                                                                                )
                                                                            }
                                                                        />
                                                                    </td>
                                                                    <td className="text-center">
                                                                        <div className="pt-2">{index + 1}</div>
                                                                    </td>

                                                                    <td className="border px-2 py-2">
                                                                        <select
                                                                            value={row.tdsWithSec}
                                                                            style={{ width: '150px' }}
                                                                            className={partySpecialTDSErrors[index]?.tdsWithSec ? 'error form-control' : 'form-control'}
                                                                            onChange={(e) =>
                                                                                setPartySpecialTDS((prev) =>
                                                                                    prev.map((r) => (r.id === row.id ? { ...r, tdsWithSec: e.target.value } : r))
                                                                                )
                                                                            }
                                                                        >
                                                                            <option value="">-- Select --</option>
                                                                            <option value="Yes">Yes</option>
                                                                            <option value="No">No</option>
                                                                        </select>
                                                                        {partySpecialTDSErrors[index]?.tdsWithSec && (
                                                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                                                                {partySpecialTDSErrors[index].tdsWithSec}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="number"
                                                                            value={row.rateFrom}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartySpecialTDS((prev) => prev.map((r) => (r.id === row.id ? { ...r, rateFrom: value } : r)));
                                                                                setPartySpecialTDSErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        rateFrom: !value ? 'Rate From is required' : ''
                                                                                    };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partySpecialTDSErrors[index]?.rateFrom ? 'error form-control' : 'form-control'}
                                                                            style={{ width: '150px' }}
                                                                        />
                                                                        {partySpecialTDSErrors[index]?.rateFrom && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partySpecialTDSErrors[index].rateFrom}</div>
                                                                        )}
                                                                    </td>
                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="number"
                                                                            value={row.rateTo}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartySpecialTDS((prev) => prev.map((r) => (r.id === row.id ? { ...r, rateTo: value } : r)));
                                                                                setPartySpecialTDSErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        rateTo: !value ? 'Rate To is required' : ''
                                                                                    };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partySpecialTDSErrors[index]?.rateTo ? 'error form-control' : 'form-control'}
                                                                            style={{ width: '150px' }}
                                                                        />
                                                                        {partySpecialTDSErrors[index]?.rateTo && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partySpecialTDSErrors[index].rateTo}</div>
                                                                        )}
                                                                    </td>
                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="number"
                                                                            value={row.tdsWithPer}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartySpecialTDS((prev) => prev.map((r) => (r.id === row.id ? { ...r, tdsWithPer: value } : r)));
                                                                                setPartySpecialTDSErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        tdsWithPer: !value ? 'Tds Percentage is required' : ''
                                                                                    };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partySpecialTDSErrors[index]?.tdsWithPer ? 'error form-control' : 'form-control'}
                                                                            style={{ width: '150px' }}
                                                                        />
                                                                        {partySpecialTDSErrors[index]?.tdsWithPer && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partySpecialTDSErrors[index].tdsWithPer}</div>
                                                                        )}
                                                                    </td>

                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="number"
                                                                            value={row.surchargePer}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartySpecialTDS((prev) =>
                                                                                    prev.map((r) => (r.id === row.id ? { ...r, surchargePer: value } : r))
                                                                                );
                                                                                setPartySpecialTDSErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        surchargePer: !value ? 'Sur Percentage is required' : ''
                                                                                    };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partySpecialTDSErrors[index]?.surchargePer ? 'error form-control' : 'form-control'}
                                                                            style={{ width: '150px' }}
                                                                        />
                                                                        {partySpecialTDSErrors[index]?.surchargePer && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partySpecialTDSErrors[index].surchargePer}</div>
                                                                        )}
                                                                    </td>

                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="number"
                                                                            value={row.edPercentage}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartySpecialTDS((prev) =>
                                                                                    prev.map((r) => (r.id === row.id ? { ...r, edPercentage: value } : r))
                                                                                );
                                                                                setPartySpecialTDSErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        edPercentage: !value ? 'edPercentage is required' : ''
                                                                                    };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partySpecialTDSErrors[index]?.edPercentage ? 'error form-control' : 'form-control'}
                                                                            style={{ width: '150px' }}
                                                                        />
                                                                        {partySpecialTDSErrors[index]?.edPercentage && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partySpecialTDSErrors[index].edPercentage}</div>
                                                                        )}
                                                                    </td>
                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={row.tdsCertifiNo}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartySpecialTDS((prev) =>
                                                                                    prev.map((r) => (r.id === row.id ? { ...r, tdsCertifiNo: value } : r))
                                                                                );
                                                                                setPartySpecialTDSErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        tdsCertifiNo: !value ? 'Tds Certificate No is required' : ''
                                                                                    };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partySpecialTDSErrors[index]?.tdsCertifiNo ? 'error form-control' : 'form-control'}
                                                                            style={{ width: '150px' }}
                                                                        />
                                                                        {partySpecialTDSErrors[index]?.tdsCertifiNo && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partySpecialTDSErrors[index].tdsCertifiNo}</div>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </Box>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};
export default Vender;
