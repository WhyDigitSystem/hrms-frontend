import React, { useState } from 'react';
import {
  Select,
  MenuItem,
  TextField,
  Checkbox,
  IconButton,
  Paper,
  FormControl,
  Box
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import ActionButton from 'utils/ActionButton';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';

const shiftTypes = ['General', 'A', 'B', 'C'];

const ShiftMaster = () => {
  const [rows, setRows] = useState([{ shiftType: '', fromTime: '', toTime: '', active: false }]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const handleAddRow = () => {
    setRows([...rows, { shiftType: '', fromTime: '', toTime: '', active: false }]);
  };

  const handleDeleteRow = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const handleClear = () => {
    setRows([{ shiftType: '', fromTime: '', toTime: '', active: false }]);
  };

  const handleSave = () => {
    setIsLoading(true);
    console.log('Saving data:', rows);
    setTimeout(() => {
      setIsLoading(false);
      alert('Data saved successfully!');
    }, 1000);
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, borderRadius: 3, backgroundColor: '#f9f9f9' }}>
      {/* Top Action Buttons using your ActionButton component */}
      <Box display="flex" mb={3}>
        <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} />
        <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
        <ActionButton
          title="Save"
          icon={SaveIcon}
          isLoading={isLoading}
          margin="0 10px 0 10px"
          onClick={handleSave}
        />
      </Box>

      {/* Table Header */}
      <Box display="grid" gridTemplateColumns="60px 60px 1fr 1fr 1fr 100px" bgcolor="#2f4f4f" color="white" p={2} borderRadius={1}>
        <Box textAlign="center">Action</Box>
        <Box textAlign="center">S.No</Box>
        <Box textAlign="center">Shift Type</Box>
        <Box textAlign="center">From Time</Box>
        <Box textAlign="center">To Time</Box>
        <Box textAlign="center" display="flex" justifyContent="space-between" alignItems="center">
          Active
          <div className="ml-2">
            <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow} />
          </div>
        </Box>
      </Box>

      {/* Table Body */}
      {rows.map((row, index) => (
        <Box
          key={index}
          display="grid"
          gridTemplateColumns="60px 60px 1fr 1fr 1fr 100px"
          alignItems="center"
          gap={1}
          mt={1}
          p={1}
          borderRadius={2}
          bgcolor="white"
          boxShadow={1}
        >
          <Box textAlign="center">
            <ActionButton
              title="Delete"
              icon={DeleteIcon}
              onClick={() => handleDeleteRow(index)}
            />
          </Box>
          <Box textAlign="center">{index + 1}</Box>
          <FormControl fullWidth size="small">
            <Select
              value={row.shiftType}
              onChange={(e) => handleChange(index, 'shiftType', e.target.value)}
              displayEmpty
            >
              <MenuItem value="">
                <em>Select Option</em>
              </MenuItem>
              {shiftTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            type="time"
            size="small"
            value={row.fromTime}
            onChange={(e) => handleChange(index, 'fromTime', e.target.value)}
            fullWidth
          />
          <TextField
            type="time"
            size="small"
            value={row.toTime}
            onChange={(e) => handleChange(index, 'toTime', e.target.value)}
            fullWidth
          />
          <Box textAlign="center">
            <Checkbox
              checked={row.active}
              onChange={(e) => handleChange(index, 'active', e.target.checked)}
              color="primary"
            />
          </Box>
        </Box>
      ))}
    </Paper>
  );
};

export default ShiftMaster;

