import apiCalls from 'apicall';
import { useEffect, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ToastComponent from 'utils/toast-component';
import CommonListViewTable from '../basicMaster/CommonListViewTable';

const SwipeInSwipeOut = () => {
  const [userName, setUserName] = useState(localStorage.getItem('userName'));
  const [listViewData, setListViewData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Define columns for the table
  const listViewColumns = [
    { 
      accessorKey: 'date', // New field for formatted date
      header: 'Date', 
      size: 120,
    },
    { 
      accessorKey: 'day', // New field for day
      header: 'Day', 
      size: 120,
    },
    { accessorKey: 'checkInTime', header: 'CheckIn Time', size: 120 },
    { accessorKey: 'checkOutTime', header: 'CheckOut Time', size: 120 },
    { accessorKey: 'totalWorkingHours', header: 'Gross Hours', size: 120 },
    { accessorKey: 'effectiveFrom', header: 'Effective Hours', size: 120 },
  ];

  // Fetch data from the API
  useEffect(() => {
    getAllSwipeInandOut();
  }, []);

  const getAllSwipeInandOut = async () => {
    setLoading(true);
    try {
      const result = await apiCalls('get', `basicmaster/attendance/${userName}`);
      if (result && result.paramObjectsMap && result.paramObjectsMap.Attendance) {
        // Transform the data to include formatted date, day, and calculated hours
        const transformedData = result.paramObjectsMap.Attendance.map((item) => ({
          ...item,
          date: formatDate(item.entryDate), // Format date as MM/DD/YYYY
          day: getDay(item.entryDate), // Get day (e.g., Tuesday)
          totalWorkingHours: calculateGrossHours(item.checkInTime, item.checkOutTime), // Calculate Gross Hours
          effectiveFrom: calculateEffectiveHours(item.checkInTime, item.checkOutTime), // Calculate Effective Hours
        }));
        setListViewData(transformedData.reverse());
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
      day: '2-digit',
    });
  };

  // Helper function to get the day (e.g., Monday, Tuesday)
  const getDay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Helper function to calculate Gross Hours (HH:mm)
  const calculateGrossHours = (checkInTime, checkOutTime) => {
    if (!checkInTime || !checkOutTime) return '00:00';

    const checkIn = new Date(`1970-01-01T${checkInTime}`);
    const checkOut = new Date(`1970-01-01T${checkOutTime}`);
    const diff = checkOut - checkIn; // Difference in milliseconds

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  // Helper function to calculate Effective Hours (HH:mm)
 const calculateEffectiveHours = (checkInTime, checkOutTime) => {
  if (!checkInTime || !checkOutTime) return '00:00';

  const checkIn = new Date(`1970-01-01T${checkInTime}`);
  const checkOut = new Date(`1970-01-01T${checkOutTime}`);
  const diff = checkOut - checkIn; // Difference in milliseconds

  // Subtract 1 hour for lunch break (adjust as needed)
  const adjustedDiff = diff - (60 * 60 * 1000);

  if (adjustedDiff < 0) return '00:00'; // Handle negative values

  const hours = Math.floor(adjustedDiff / (1000 * 60 * 60));
  const minutes = Math.floor((adjustedDiff % (1000 * 60 * 60)) / (1000 * 60));

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl mb-3" style={{ padding: '20px' }}>
        <div className=".d-flex flex-wrap justify-content-start mb-4">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              blockEdit={true}
              enableEditing={false}
            />
          )}
        </div>
        <ToastComponent />
      </div>
    </>
  );
};

export default SwipeInSwipeOut;