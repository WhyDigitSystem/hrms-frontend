// // Full OverTimeScreen Component with OT Form + Dynamic Employee Table

// import React, { useEffect, useState } from 'react';
// import {
//   TextField,
//   Select,
//   MenuItem,
//   InputLabel,
//   FormControl,
//   Checkbox,
//   FormControlLabel,
//   FormHelperText
// } from '@mui/material';
// import ClearIcon from '@mui/icons-material/Clear';
// import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
// import SaveIcon from '@mui/icons-material/Save';
// import ActionButton from 'utils/ActionButton';
// import ToastComponent, { showToast } from 'utils/toast-component';
// import CommonListViewTable from './CommonListViewTable';
// import apiCalls from 'apicall';

// const OverTimeScreen = () => {
//   const [orgId] = useState(localStorage.getItem('orgId'));
//   const [loginUserName] = useState(localStorage.getItem('userName'));
//   const [isLoading, setIsLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     active: true,
//     otType: '',
//     amountPerHour: '',
//     otDate: '',
//     shiftType: '',
//     supervisor: ''
//   });

//   const [employeeOTRows, setEmployeeOTRows] = useState([
//     {
//       empName: 'John',
//       empCode: 'E001',
//       fromTime: '',
//       toTime: '',
//       ratePerHour: 0
//     }
//   ]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleCheckboxChange = (event) => {
//     setFormData({ ...formData, active: event.target.checked });
//   };

//   const handleTimeChange = (index, field, value) => {
//     const updatedRows = [...employeeOTRows];
//     updatedRows[index][field] = value;
//     setEmployeeOTRows(updatedRows);
//   };

//   const calculateOtHours = (fromTime, toTime) => {
//     if (!fromTime || !toTime) return 0;
//     const [fh, fm] = fromTime.split(":").map(Number);
//     const [th, tm] = toTime.split(":").map(Number);
//     const from = fh * 60 + fm;
//     const to = th * 60 + tm;
//     return to > from ? ((to - from) / 60).toFixed(2) : 0;
//   };

//   const calculateTotalAmount = (row) => {
//     const otHours = parseFloat(calculateOtHours(row.fromTime, row.toTime));
//     return (otHours * row.ratePerHour).toFixed(2);
//   };

//   return (
//     <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
//       <div className="row d-flex ml">
//         <div className="d-flex flex-wrap justify-content-start mb-4">
//           <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={() => {}} />
//           <ActionButton title="Clear" icon={ClearIcon} onClick={() => {}} />
//           <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={() => {}} margin="0 10px" />
//         </div>
//       </div>

//       <div className="row">
//         <div className="col-md-3 mb-3">
//           <FormControl fullWidth size="small">
//             <InputLabel id="otType-label">OT Type</InputLabel>
//             <Select labelId="otType-label" name="otType" value={formData.otType} label="OT Type" onChange={handleInputChange}>
//               <MenuItem value=""><em>Select OT Type</em></MenuItem>
//               <MenuItem value="General OT">General OT</MenuItem>
//               <MenuItem value="Emergency OT">Emergency OT</MenuItem>
//               <MenuItem value="Weekend OT">Weekend OT</MenuItem>
//               <MenuItem value="Holiday OT">Holiday OT</MenuItem>
//             </Select>
//           </FormControl>
//         </div>

//         <div className="col-md-3 mb-3">
//           <TextField label="OT Date" type="date" name="otDate" fullWidth size="small" InputLabelProps={{ shrink: true }} value={formData.otDate} onChange={handleInputChange} />
//         </div>

//         <div className="col-md-3 mb-3">
//           <FormControl fullWidth size="small">
//             <InputLabel id="shiftType-label">Shift Type</InputLabel>
//             <Select labelId="shiftType-label" name="shiftType" value={formData.shiftType} label="Shift Type" onChange={handleInputChange}>
//               <MenuItem value=""><em>Select Shift</em></MenuItem>
//               <MenuItem value="Morning">Morning</MenuItem>
//               <MenuItem value="Evening">Evening</MenuItem>
//               <MenuItem value="Night">Night</MenuItem>
//             </Select>
//           </FormControl>
//         </div>

//         <div className="col-md-3 mb-3">
//           <FormControl fullWidth size="small">
//             <InputLabel id="supervisor-label">Supervisor</InputLabel>
//             <Select labelId="supervisor-label" name="supervisor" value={formData.supervisor} label="Supervisor" onChange={handleInputChange}>
//               <MenuItem value=""><em>Select Supervisor</em></MenuItem>
//               <MenuItem value="SUNDAR">SUNDAR</MenuItem>
//               <MenuItem value="KANNAN">KANNAN</MenuItem>
//               <MenuItem value="RAJU">RAJU</MenuItem>
//             </Select>
//           </FormControl>
//         </div>
//       </div>

//       {/* Table Section */}
//       <table className="table table-bordered mt-3">
//         <thead>
//           <tr>
//             <th>Employee</th>
//             <th>Employee Code</th>
//             <th>From Time</th>
//             <th>To Time</th>
//             <th>OT Hours</th>
//             <th>Rate/Hour</th>
//             <th>Total OT Amount</th>
//           </tr>
//         </thead>
//         <tbody>
//           {employeeOTRows.map((row, index) => (
//             <tr key={index}>
//               <td>{row.empName}</td>
//               <td>{row.empCode}</td>
//               <td><input type="time" value={row.fromTime} onChange={(e) => handleTimeChange(index, 'fromTime', e.target.value)} /></td>
//               <td><input type="time" value={row.toTime} onChange={(e) => handleTimeChange(index, 'toTime', e.target.value)} /></td>
//               <td>{calculateOtHours(row.fromTime, row.toTime)}</td>
//               <td><input type="number" value={row.ratePerHour} onChange={(e) => handleTimeChange(index, 'ratePerHour', parseFloat(e.target.value))} /></td>
//               <td>{calculateTotalAmount(row)}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <ToastComponent />
//     </div>
//   );
// };

// export default OverTimeScreen;

// Full OverTimeScreen Component with OT Form + Dynamic Employee Table (MUI Styled)

// import React, { useEffect, useState } from 'react';
// import { TextField, Select, MenuItem, InputLabel, FormControl, Box, Paper, Typography } from '@mui/material';
// import ClearIcon from '@mui/icons-material/Clear';
// import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
// import SaveIcon from '@mui/icons-material/Save';
// import ActionButton from 'utils/ActionButton';
// import ToastComponent, { showToast } from 'utils/toast-component';

// const OverTimeScreen = () => {
//   const [orgId] = useState(localStorage.getItem('orgId'));
//   const [loginUserName] = useState(localStorage.getItem('userName'));
//   const [isLoading, setIsLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     active: true,
//     otType: '',
//     amountPerHour: '',
//     otDate: '',
//     shiftType: '',
//     supervisor: ''
//   });

//   const [employeeOTRows, setEmployeeOTRows] = useState([
//     {
//       empName: 'John',
//       empCode: 'E001',
//       fromTime: '',
//       toTime: '',
//       ratePerHour: 0
//     }
//   ]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleTimeChange = (index, field, value) => {
//     const updatedRows = [...employeeOTRows];
//     updatedRows[index][field] = value;
//     setEmployeeOTRows(updatedRows);
//   };

//   const calculateOtHours = (fromTime, toTime) => {
//     if (!fromTime || !toTime) return 0;
//     const [fh, fm] = fromTime.split(':').map(Number);
//     const [th, tm] = toTime.split(':').map(Number);
//     const from = fh * 60 + fm;
//     const to = th * 60 + tm;
//     return to > from ? ((to - from) / 60).toFixed(2) : 0;
//   };

//   const calculateTotalAmount = (row) => {
//     const otHours = parseFloat(calculateOtHours(row.fromTime, row.toTime));
//     return (otHours * row.ratePerHour).toFixed(2);
//   };

//   return (
//     <Paper elevation={3} sx={{ padding: 4, borderRadius: 3, backgroundColor: '#f9f9f9' }}>
//       <Box display="flex" mb={3}>
//         <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={() => {}} />
//         <ActionButton title="Clear" icon={ClearIcon} onClick={() => {}} />
//         <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={() => {}} margin="0 10px" />
//       </Box>

//       <Box className="row">
//         <Box className="col-md-3 mb-3">
//           <FormControl fullWidth size="small">
//             <InputLabel id="otType-label">OT Type</InputLabel>
//             <Select labelId="otType-label" name="otType" value={formData.otType} label="OT Type" onChange={handleInputChange}>
//               <MenuItem value="">
//                 <em>Select OT Type</em>
//               </MenuItem>
//               <MenuItem value="General OT">General OT</MenuItem>
//               <MenuItem value="Emergency OT">Emergency OT</MenuItem>
//               <MenuItem value="Weekend OT">Weekend OT</MenuItem>
//               <MenuItem value="Holiday OT">Holiday OT</MenuItem>
//             </Select>
//           </FormControl>
//         </Box>

//         <Box className="col-md-3 mb-3">
//           <TextField
//             label="OT Date"
//             type="date"
//             name="otDate"
//             fullWidth
//             size="small"
//             InputLabelProps={{ shrink: true }}
//             value={formData.otDate}
//             onChange={handleInputChange}
//           />
//         </Box>

//         <Box className="col-md-3 mb-3">
//           <FormControl fullWidth size="small">
//             <InputLabel id="shiftType-label">Shift Type</InputLabel>
//             <Select labelId="shiftType-label" name="shiftType" value={formData.shiftType} label="Shift Type" onChange={handleInputChange}>
//               <MenuItem value="">
//                 <em>Select Shift</em>
//               </MenuItem>
//               <MenuItem value="Morning">Morning</MenuItem>
//               <MenuItem value="Evening">Evening</MenuItem>
//               <MenuItem value="Night">Night</MenuItem>
//             </Select>
//           </FormControl>
//         </Box>

//         <Box className="col-md-3 mb-3" display="flex" alignItems="center" gap={1}>
//           <FormControl fullWidth size="small">
//             <InputLabel id="supervisor-label">Supervisor</InputLabel>
//             <Select
//               labelId="supervisor-label"
//               name="supervisor"
//               value={formData.supervisor}
//               label="Supervisor"
//               onChange={handleInputChange}
//             >
//               <MenuItem value="">
//                 <em>Select Supervisor</em>
//               </MenuItem>
//               <MenuItem value="SUNDAR">SUNDAR</MenuItem>
//               <MenuItem value="KANNAN">KANNAN</MenuItem>
//               <MenuItem value="RAJU">RAJU</MenuItem>
//             </Select>
//           </FormControl>

//           {/* Small Go Button */}
//           <button
//             type="button"
//             style={{
//               height: '35px',
//               padding: '0 10px',
//               backgroundColor: '#1976d2',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer',
//               fontSize: '0.75rem'
//             }}
//             onClick={() => {
//               console.log('Go clicked - Supervisor:', formData.supervisor);
//               // You can trigger your API/filter logic here
//             }}
//           >
//             Go
//           </button>
//         </Box>
//       </Box>

//       {/* Styled MUI Table Header */}
//       <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" bgcolor="#2f4f4f" color="white" p={2} borderRadius={1} mt={2}>
//         <Typography textAlign="center">Employee</Typography>
//         <Typography textAlign="center">Code</Typography>
//         <Typography textAlign="center">From Time</Typography>
//         <Typography textAlign="center">To Time</Typography>
//         <Typography textAlign="center">OT Hours</Typography>
//         <Typography textAlign="center">Rate/Hour</Typography>
//         <Typography textAlign="center">OT Amount</Typography>
//       </Box>

//       {employeeOTRows.map((row, index) => (
//         <Box
//           key={index}
//           display="grid"
//           gridTemplateColumns="repeat(7, 1fr)"
//           alignItems="center"
//           gap={1}
//           mt={1}
//           p={1}
//           borderRadius={2}
//           bgcolor="white"
//           boxShadow={1}
//         >
//           <Typography textAlign="center">{row.empName}</Typography>
//           <Typography textAlign="center">{row.empCode}</Typography>
//           <Typography textAlign="center">{row.fromTime}</Typography>
//           <Typography textAlign="center">{row.toTime}</Typography>
//           <Typography textAlign="center">{calculateOtHours(row.fromTime, row.toTime)}</Typography>
//           <Typography textAlign="center">{row.ratePerHour}</Typography>
//           <Typography textAlign="center">{calculateTotalAmount(row)}</Typography>
//         </Box>
//       ))}

//       <ToastComponent />
//     </Paper>
//   );
// };

// export default OverTimeScreen;

// Full OverTimeScreen Component with OT Form + Enhanced Report Table with Pagination, Search, Export

import React, { useEffect, useState } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Button,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  TablePagination,
  Toolbar,
  InputAdornment,
  IconButton
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import ActionButton from 'utils/ActionButton';
import ToastComponent from 'utils/toast-component';

const OverTimeScreen = () => {
  const [formData, setFormData] = useState({
    otType: '',
    otDate: '',
    shiftType: '',
    supervisor: ''
  });
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [employeeOTRows] = useState([
    { empName: 'John', empCode: 'E001', fromTime: '08:00', toTime: '10:30', ratePerHour: 100 },
    { empName: 'Ravi', empCode: 'E002', fromTime: '09:00', toTime: '11:00', ratePerHour: 120 },
    { empName: 'Priya', empCode: 'E003', fromTime: '10:00', toTime: '13:00', ratePerHour: 110 },
    { empName: 'Kumar', empCode: 'E004', fromTime: '07:00', toTime: '09:00', ratePerHour: 95 }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const calculateOtHours = (fromTime, toTime) => {
    if (!fromTime || !toTime) return 0;
    const [fh, fm] = fromTime.split(':').map(Number);
    const [th, tm] = toTime.split(':').map(Number);
    const from = fh * 60 + fm;
    const to = th * 60 + tm;
    return to > from ? ((to - from) / 60).toFixed(2) : 0;
  };

  const calculateTotalAmount = (row) => {
    const otHours = parseFloat(calculateOtHours(row.fromTime, row.toTime));
    return (otHours * row.ratePerHour).toFixed(2);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredRows = employeeOTRows.filter(
    (row) => row.empName.toLowerCase().includes(searchText.toLowerCase()) || row.empCode.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredRows.map((row) => ({
        Employee: row.empName,
        Code: row.empCode,
        FromTime: row.fromTime,
        ToTime: row.toTime,
        OTHours: calculateOtHours(row.fromTime, row.toTime),
        RatePerHour: row.ratePerHour,
        OTAmount: calculateTotalAmount(row)
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'OT_Report');
    XLSX.writeFile(wb, 'OT_Report.xlsx');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Employee', 'Code', 'From Time', 'To Time', 'OT Hours', 'Rate/Hour', 'OT Amount']],
      body: filteredRows.map((row) => [
        row.empName,
        row.empCode,
        row.fromTime,
        row.toTime,
        calculateOtHours(row.fromTime, row.toTime),
        row.ratePerHour,
        calculateTotalAmount(row)
      ])
    });
    doc.save('OT_Report.pdf');
  };

  return (
    <Box sx={{ padding: '20px', borderRadius: '10px' }}>
      {/* <Box display="flex" gap={2} mb={2}>
        <FormControl fullWidth size="small">
          <InputLabel id="otType-label">OT Type</InputLabel>
          <Select labelId="otType-label" name="otType" value={formData.otType} label="OT Type" onChange={handleInputChange}>
            <MenuItem value=""><em>Select OT Type</em></MenuItem>
            <MenuItem value="General OT">General OT</MenuItem>
            <MenuItem value="Emergency OT">Emergency OT</MenuItem>
            <MenuItem value="Weekend OT">Weekend OT</MenuItem>
            <MenuItem value="Holiday OT">Holiday OT</MenuItem>
          </Select>
        </FormControl>

        <TextField label="OT Date" type="date" name="otDate" size="small" InputLabelProps={{ shrink: true }} value={formData.otDate} onChange={handleInputChange} />

        <FormControl fullWidth size="small">
          <InputLabel id="shiftType-label">Shift Type</InputLabel>
          <Select labelId="shiftType-label" name="shiftType" value={formData.shiftType} label="Shift Type" onChange={handleInputChange}>
            <MenuItem value=""><em>Select Shift</em></MenuItem>
            <MenuItem value="Morning">Morning</MenuItem>
            <MenuItem value="Evening">Evening</MenuItem>
            <MenuItem value="Night">Night</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel id="supervisor-label">Supervisor</InputLabel>
          <Select labelId="supervisor-label" name="supervisor" value={formData.supervisor} label="Supervisor" onChange={handleInputChange}>
            <MenuItem value=""><em>Select Supervisor</em></MenuItem>
            <MenuItem value="SUNDAR">SUNDAR</MenuItem>
            <MenuItem value="KANNAN">KANNAN</MenuItem>
            <MenuItem value="RAJU">RAJU</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" size="small" sx={{ height: '40px', alignSelf: 'flex-end' }}>Go</Button>
      </Box> */}

      <Box className="row">
        <Box className="col-md-3 mb-3">
          <FormControl fullWidth size="small">
            <InputLabel id="otType-label">OT Type</InputLabel>
            <Select labelId="otType-label" name="otType" value={formData.otType} label="OT Type" onChange={handleInputChange}>
              <MenuItem value="">
                <em>Select OT Type</em>
              </MenuItem>
              <MenuItem value="General OT">General OT</MenuItem>
              <MenuItem value="Emergency OT">Emergency OT</MenuItem>
              <MenuItem value="Weekend OT">Weekend OT</MenuItem>
              <MenuItem value="Holiday OT">Holiday OT</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box className="col-md-3 mb-3">
          <TextField
            label="OT Date"
            type="date"
            name="otDate"
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            value={formData.otDate}
            onChange={handleInputChange}
          />
        </Box>

        <Box className="col-md-3 mb-3">
          <FormControl fullWidth size="small">
            <InputLabel id="shiftType-label">Shift Type</InputLabel>
            <Select labelId="shiftType-label" name="shiftType" value={formData.shiftType} label="Shift Type" onChange={handleInputChange}>
              <MenuItem value="">
                <em>Select Shift</em>
              </MenuItem>
              <MenuItem value="Morning">Morning</MenuItem>
              <MenuItem value="Evening">Evening</MenuItem>
              <MenuItem value="Night">Night</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box className="col-md-3 mb-3" display="flex" alignItems="center" gap={1}>
          <FormControl fullWidth size="small">
            <InputLabel id="supervisor-label">Supervisor</InputLabel>
            <Select
              labelId="supervisor-label"
              name="supervisor"
              value={formData.supervisor}
              label="Supervisor"
              onChange={handleInputChange}
            >
              <MenuItem value="">
                <em>Select Supervisor</em>
              </MenuItem>
              <MenuItem value="SUNDAR">SUNDAR</MenuItem>
              <MenuItem value="KANNAN">KANNAN</MenuItem>
              <MenuItem value="RAJU">RAJU</MenuItem>
            </Select>
          </FormControl>

          {/* Small Go Button */}
          <button
            type="button"
            style={{
              height: '35px',
              padding: '0 10px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.75rem'
            }}
            onClick={() => {
              console.log('Go clicked - Supervisor:', formData.supervisor);
              // You can trigger your API/filter logic here
            }}
          >
            Go
          </button>
        </Box>
      </Box>

      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <TextField
          size="small"
          variant="outlined"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        <Box>
          <Button startIcon={<FileDownloadIcon />} onClick={handleExportExcel} sx={{ mr: 1 }}>
            Excel
          </Button>
          <Button startIcon={<FileDownloadIcon />} onClick={handleExportPDF}>
            PDF
          </Button>
        </Box>
      </Toolbar>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#2f4f4f' }}>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Employee</TableCell>
              <TableCell sx={{ color: 'white' }}>Code</TableCell>
              <TableCell sx={{ color: 'white' }}>From Time</TableCell>
              <TableCell sx={{ color: 'white' }}>To Time</TableCell>
              <TableCell sx={{ color: 'white' }}>OT Hours</TableCell>
              <TableCell sx={{ color: 'white' }}>Rate/Hour</TableCell>
              <TableCell sx={{ color: 'white' }}>OT Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.empName}</TableCell>
                <TableCell>{row.empCode}</TableCell>
                <TableCell>{row.fromTime}</TableCell>
                <TableCell>{row.toTime}</TableCell>
                <TableCell>{calculateOtHours(row.fromTime, row.toTime)}</TableCell>
                <TableCell>{row.ratePerHour}</TableCell>
                <TableCell>{calculateTotalAmount(row)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredRows.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>

      <ToastComponent />
    </Box>
  );
};

export default OverTimeScreen;
