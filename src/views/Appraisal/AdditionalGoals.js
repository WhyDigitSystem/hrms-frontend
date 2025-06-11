import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import { Checkbox, FormControl, FormControlLabel, FormHelperText, InputLabel, MenuItem, Select, TextField, Modal, Paper, Button, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import GridOnIcon from '@mui/icons-material/GridOn';
import { DataGrid } from '@mui/x-data-grid';
import Draggable from 'react-draggable';

function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export const AdditionalGoals = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  const [popupData, setPopupData] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [fillGridData, setFillGridData] = useState([]);
  const [goalsDetailsData, setGoalsDetailsData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [formData, setFormData] = useState({
    active: true,
    areaOfImportance: '',
    keyPerformanceIndicators: '',
    performanceIndicators: '',
    goal: '',
  });
  const [editId, setEditId] = useState('');
  const [countryList, setCountryList] = useState([]);

  const theme = useTheme();
  const anchorRef = useRef(null);

  const [fieldErrors, setFieldErrors] = useState({
    areaOfImportance: '',
    keyPerformanceIndicators: '',
    performanceIndicators: '',
    goal: '',
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'appraiseeName', header: 'Name', size: 140 },
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
      areaOfImportance: '',
      keyPerformanceIndicators: '',
      performanceIndicators: '',
      goal: '',
      active: true
    });
    setFieldErrors({
      areaOfImportance: '',
      keyPerformanceIndicators: '',
      performanceIndicators: '',
      goal: '',
    });
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};

    if (!formData.areaOfImportance) {
      errors.areaOfImportance = 'Area Of Importance is required';
    }
    if (!formData.keyPerformanceIndicators) {
      errors.keyPerformanceIndicators = 'Key Performance Indicators is required';
    }
    if (!formData.performanceIndicators) {
      errors.performanceIndicators = 'Performance Indicators is required';
    }
    if (!formData.goal) {
      errors.goal = 'Goal is required';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);

      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        areaOfImportance: formData.areaOfImportance,
        keyPerformanceIndicators: formData.keyPerformanceIndicators,
        performanceIndicators: formData.performanceIndicators,
        goal: formData.goal,
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

  // const handleFillGrid = async () => {
  //   try {
  //     const result = await apiCalls('get', `eLReportController/getAllElMfr?orgId=${orgId}`);

  //     if (result?.paramObjectsMap?.elMfrVO) {
  //       const fillGrid = result.paramObjectsMap.elMfrVO;

  //       const mappedData = fillGrid.map((grid, index) => ({
  //         id: index + 1,
  //         description: grid.description,
  //         elCode: grid.elCode
  //       }));

  //       setPopupData(mappedData);
  //       setIsPopupOpen(true);
  //     }
  //   } catch (error) {
  //     console.error('Error:', error)
  //   }
  // };

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
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            {/* <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} /> */}
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={() => handleSave()} />
            <ActionButton
              title="Fill Grid"
              icon={GridOnIcon}
              isLoading={isLoading}
            onClick={handleFullGrid}
            />
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
              <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.areaOfImportance}>
                <InputLabel id="areaOfImportance">Areas of Importance</InputLabel>
                <Select labelId="areaOfImportance" label="Area Of Importance" name="areaOfImportance" value={formData.areaOfImportance} onChange={handleInputChange}>
                  {/* {countryList?.map((row) => (
                    <MenuItem key={row.id} value={row.countryName}>
                      {row.countryName}
                    </MenuItem>
                  ))} */}
                </Select>
                {fieldErrors.areaOfImportance && <FormHelperText>{fieldErrors.areaOfImportance}</FormHelperText>}
              </FormControl>
            </div>
            <div className="col-md-3 mb-3">
              <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.keyPerformanceIndicators}>
                <InputLabel id="keyPerformanceIndicators">Key Performance Indicators</InputLabel>
                <Select labelId="keyPerformanceIndicators" label="Area Of Importance" name="keyPerformanceIndicators" value={formData.keyPerformanceIndicators} onChange={handleInputChange}>
                  {/* {countryList?.map((row) => (
                    <MenuItem key={row.id} value={row.countryName}>
                      {row.countryName}
                    </MenuItem>
                  ))} */}
                </Select>
                {fieldErrors.keyPerformanceIndicators && <FormHelperText>{fieldErrors.keyPerformanceIndicators}</FormHelperText>}
              </FormControl>
            </div>
            <div className="col-md-3 mb-3">
              <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.performanceIndicators}>
                <InputLabel id="performanceIndicators">Performance Indicators</InputLabel>
                <Select labelId="performanceIndicators" label="Area Of Importance" name="performanceIndicators" value={formData.performanceIndicators} onChange={handleInputChange}>
                  {/* {countryList?.map((row) => (
                    <MenuItem key={row.id} value={row.countryName}>
                      {row.countryName}
                    </MenuItem>
                  ))} */}
                </Select>
                {fieldErrors.performanceIndicators && <FormHelperText>{fieldErrors.performanceIndicators}</FormHelperText>}
              </FormControl>
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Goal"
                variant="outlined"
                size="small"
                fullWidth
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
                error={!!fieldErrors.goal}
                helperText={fieldErrors.goal}
              />
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
      <Dialog
        open={modalOpen}
        maxWidth={'md'}
        fullWidth={true}
        onClose={handleCloseModal}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle textAlign="center" style={{ cursor: 'move' }} id="draggable-dialog-title">
          <h6>Grid Details</h6>
        </DialogTitle>
        <DialogContent className="pb-0">
          <div className="row">
            <div className="col-lg-12">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr style={{ background: 'linear-gradient(193deg, #3a6b6d 30%, #2a4b4d 90%)', color: 'white' }}>
                      <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                        <Checkbox sx={{
                          color: 'white',
                          '&.Mui-checked': {
                            color: 'white',
                          },
                        }}
                          checked={selectAll} onChange={handleSelectAll} />
                      </th>
                      <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                        KRAID</th>
                      <th className="table-header">KRA</th>
                      <th className="table-header">DETAILS</th>
                      <th className="table-header">VALID</th>
                      <th className="table-header">KPIID</th>
                      <th className="table-header">DETAILS</th>
                      <th className="table-header">GNO</th>
                      <th className="table-header">GOAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fillGridData?.map((row, index) => (
                      <tr key={row.id}>
                        <td className="border p-0 text-center">
                          <Checkbox
                            sx={{
                              // borderColor: 'white',
                              // color: 'white'
                              backgroundColor: 'white'
                            }}
                            checked={selectedRows.includes(index)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setSelectedRows((prev) => (isChecked ? [...prev, index] : prev.filter((i) => i !== index)));
                            }}
                          />
                        </td>
                        <td className="text-center">{index + 1}</td>
                        <td className="border px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>
                          {row.vid || ''}
                        </td>
                        <td className="border px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>
                          {row.vdate ? dayjs(row.vdate).format('DD-MM-YYYY') : ''}
                        </td>
                        <td className="border px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>
                          {row.billamount || ''}
                        </td>
                        <td className="border px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>
                          {row.gstamount || ''}
                        </td>
                        <td className="border px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>
                          {row.chargeAmt || 0}
                        </td>
                        <td className="border px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>
                          {row.chargeAmt || 0}
                        </td>
                        <td className="border px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>
                          {row.chargeAmt || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: '1.25rem' }} className="pt-0">
          <Button onClick={handleCloseModal} sx={{ color: 'red' }}>
            Cancel
          </Button>
          <Button
            color="secondary"
            onClick={handleSubmitSelectedRows}
            variant="contained"
            sx={{
              backgroundColor: 'green',
              '&:hover': {
                backgroundColor: 'green',
              },
            }}

          >
            Proceed
          </Button>
        </DialogActions>
      </Dialog>
      <ToastComponent />
    </>
  );
};

export default AdditionalGoals;
