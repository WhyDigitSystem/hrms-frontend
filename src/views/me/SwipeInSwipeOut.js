import apiCalls from 'apicall';
import { useEffect, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ToastComponent from 'utils/toast-component';
import CommonListViewTable from '../basicMaster/CommonListViewTable';
import { Box, Modal, Typography, TextField, Button } from '@mui/material';

const SwipeInSwipeOut = () => {
  const [userName, setUserName] = useState(localStorage.getItem('userName'));
  const [listViewData, setListViewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState('');

  const handleCheckOutClick = (row) => {
    console.log('Clicked row:', row); // ✅ Debug
    setSelectedRow(row);
    const currentTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    setCheckOutTime(currentTime);
    setModalOpen(true);
  };
  const handleSaveTime = () => {
    // Logic to update listViewData (or make API call)
    console.log(`Saved time for ${selectedRow?.date}: ${checkOutTime}`);
    setModalOpen(false);
  };

  // Define columns for the table
  const listViewColumns = [
    {
      accessorKey: 'date', // New field for formatted date
      header: 'Date',
      size: 120
    },
    {
      accessorKey: 'day', // New field for day
      header: 'Day',
      size: 120
    },
    { accessorKey: 'checkInTime', header: 'CheckIn Time', size: 120 },
    // { accessorKey: 'checkOutTime', header: 'CheckOut Time', size: 120 },
    {
      accessorKey: 'checkOutTime',
      header: 'CheckOut Time',
      size: 120,
      cell: ({ row }) => {
        const value = row.original.checkOutTime?.trim(); // Trim in case of whitespace
        const isClickable = value === '00:00:00';

        return (
          <span
            style={{
              cursor: isClickable ? 'pointer' : 'default',
              color: isClickable ? 'blue' : 'black'
            }}
            onClick={() => {
              if (isClickable) {
                handleCheckOutClick(row.original);
              }
            }}
          >
            {value || '-'}
          </span>
        );
      }
    },
    { accessorKey: 'totalWorkingHours', header: 'Gross Hours', size: 120 },
    { accessorKey: 'effectiveFrom', header: 'Effective Hours', size: 120 }
  ];

  // Fetch data from the API
  useEffect(() => {
    getAllSwipeInandOut();
  }, []);

  // const getAllSwipeInandOut = async () => {
  //   setLoading(true);
  //   try {
  //     const result = await apiCalls('get', `basicmaster/attendance/${userName}`);
  //     if (result && result.paramObjectsMap && result.paramObjectsMap.Attendance) {
  //       // Transform the data to include formatted date, day, and calculated hours
  //       const transformedData = result.paramObjectsMap.Attendance.map((item) => ({
  //         ...item,
  //         date: formatDate(item.entryDate), // Format date as MM/DD/YYYY
  //         day: getDay(item.entryDate), // Get day (e.g., Tuesday)
  //         totalWorkingHours: formatTime(item.totalWorkingHours),
  //         effectiveFrom: formatTime(item.effectiveFrom)
  //       }));
  //       setListViewData(transformedData.reverse());
  //     }
  //   } catch (err) {
  //     console.error('Error fetching data:', err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const getAllSwipeInandOut = async () => {
    setLoading(true);
    try {
      const result = await apiCalls('get', `basicmaster/attendance/${userName}`);
      if (result && result.paramObjectsMap && result.paramObjectsMap.Attendance) {
        const transformedData = result.paramObjectsMap.Attendance.map((item) => ({
          ...item,
          date: formatDate(item.entrydate), // ✅ corrected field name
          day: getDay(item.entrydate), // ✅ corrected field name
          totalWorkingHours: formatTime(item.TotalWorkingHours), // ✅ corrected field name
          effectiveFrom: formatTime(item.effectivefrom) // ✅ corrected field name
        }));
        const sortedData = transformedData.sort((a, b) => new Date(b.entrydate) - new Date(a.entrydate));
        setListViewData(sortedData);

        // setListViewData(transformedData.reverse());
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date as MM/DD/YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Helper function to get the day (e.g., Monday, Tuesday)
  const getDay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '00:00';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`; // Return only hours and minutes
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl mb-3" style={{ padding: '20px' }}>
        <div className=".d-flex flex-wrap justify-content-start mb-4">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} enableEditing={false} />
          )}
        </div>
        <ToastComponent />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'white',
            borderRadius: 2,
            p: 4
          }}
        >
          <Typography variant="h6" gutterBottom>
            Set Check-Out Time
          </Typography>
          <TextField
            label="Check-Out Time"
            type="time"
            fullWidth
            value={checkOutTime}
            onChange={(e) => setCheckOutTime(e.target.value)}
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 60 }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            onClick={() => {
              console.log('Saving time:', checkOutTime);
              setModalOpen(false);
            }}
          >
            Save
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default SwipeInSwipeOut;
