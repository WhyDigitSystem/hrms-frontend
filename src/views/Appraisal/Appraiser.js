import React from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import ActionButton from 'utils/ActionButton';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import { Box, Grid } from '@mui/material';
// import CommonListViewTable from './CommonListViewTable';
import { useState } from 'react';
import { Checkbox, FormControl, FormControlLabel, FormHelperText, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import GridOnIcon from '@mui/icons-material/GridOn';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

function Appraiser() {
  const [value, setValue] = useState('0');
  const [listView, setListView] = useState(true);
  const [formData, setFormData] = useState({
    appraisalID: '',
    name: '',
    code: '',
    department: '',
    supervisorName: '',
    supervisorCode: '',
    active: true
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleCheckboxChange = (event) => {
    setFormData({
      ...formData,
      active: event.target.checked
    });
  };

  const handleChangeTab = (event, newValue) => {
    setValue(newValue);
  };

  const listViewColumns = [
    { accessorKey: 'name', header: 'Name', size: 140 },
    { accessorKey: 'code', header: 'Code', size: 140 },
    { accessorKey: 'department', header: 'Department', size: 140 }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value.toUpperCase();
    setFormData((prev) => ({ ...prev, [name]: inputValue }));
  };
  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={() => setListView(true)} />
            <ActionButton title="Clear" icon={ClearIcon} />
            <ActionButton title="Save" icon={SaveIcon} margin="0 10px 0 10px" />
          </div>
        </div>

        {!listView ? (
          // <div className="mt-0">
          //   <CommonListViewTable
          //     // data={listViewData}
          //     columns={listViewColumns}
          //     blockEdit={true}
          //     // toEdit={getStateById}
          //     enableEditing={true}
          //   />
          // </div>
          ''
        ) : (
          <div className="row">
            <div className="col-md-3 mb-3">
              <TextField
                label="Appraisal ID"
                variant="outlined"
                size="small"
                fullWidth
                name="appraisalID"
                value={formData.appraisalID}
                onChange={handleInputChange}
                error={!!fieldErrors.appraisalID}
                helperText={fieldErrors.appraisalID}
              />
            </div>
            <div className="col-md-3 mb-3">
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="name-label">Name</InputLabel>
                <Select labelId="name-label" label="Name" name="name">
                  {/* {countryList?.map((row) => (
                    <MenuItem key={row.id} value={row.countryName}>
                      {row.countryName}
                    </MenuItem>
                  ))} */}
                </Select>
                {/* {fieldErrors.country && <FormHelperText>{fieldErrors.country}</FormHelperText>} */}
              </FormControl>
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Code"
                variant="outlined"
                size="small"
                fullWidth
                name="code"
                disabled
                value={formData.code}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-3 mb-3">
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="department-label">Department</InputLabel>
                <Select labelId="department-label" label="Department" name="department" onChange={handleInputChange}>
                  {/* {countryList?.map((row) => (
                    <MenuItem key={row.id} value={row.countryName}>
                      {row.countryName}
                    </MenuItem>
                  ))} */}
                </Select>
                {/* {fieldErrors.country && <FormHelperText>{fieldErrors.country}</FormHelperText>} */}
              </FormControl>
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Supervisor Name"
                variant="outlined"
                size="small"
                fullWidth
                name="supervisorName"
                disabled
                value={formData.supervisorName}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Supervisor Code"
                variant="outlined"
                size="small"
                fullWidth
                name="supervisorCode"
                disabled
                value={formData.supervisorCode}
                onChange={handleInputChange}
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
        )}
        {/*  */}
        <div className="row mt-2">
          <Box sx={{ width: '100%' }}>
            <Tabs
              value={value}
              onChange={handleChangeTab}
              textColor="secondary"
              indicatorColor="secondary"
              aria-label="secondary tabs example"
            >
              <Tab value={0} label="Details" />
            </Tabs>
          </Box>
          <Box sx={{ padding: 2 }}>
            {value === 0 && (
              <div className="mb-1">
                <ActionButton title="Fill Grid" icon={GridOnIcon} />
              </div>
            )}
          </Box>
        </div>
        {/*  */}
      </div>
    </>
  );
}

export default Appraiser;
