import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import TextField from '@mui/material/TextField';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from '../basicMaster/CommonListViewTable';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import FormControl from '@mui/material/FormControl';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const SwipeInSwipeOut = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const listViewColumns = [
    { accessorKey: 'date', header: 'Date', size: 140 },
    { accessorKey: 'inTime', header: 'In Time', size: 140 },
    { accessorKey: 'outTime', header: 'Out Time', size: 140 },
    {
      accessorKey: 'workedHrs',
      header: 'Worked Hours',
      size: 140
    },
  ];
  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    getAllSwipeInandOut();
  }, []);

  const getAllSwipeInandOut = async () => {
    try {
      const result = await apiCalls('get', `commonmaster/getDepartmentByOrgId?orgid=${orgId}`);
      setListViewData(result.paramObjectsMap.departmentVO.reverse());
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl mb-3" style={{ padding: '20px' }}>
          <div className=".d-flex flex-wrap justify-content-start mb-4">
            {/* <div> */}
              <CommonListViewTable
                data={listViewData}
                columns={listViewColumns}
                blockEdit={true} // DISAPLE THE MODAL IF TRUE
                toEdit={getAllSwipeInandOut}
              />
            {/* </div> */}
          </div>
        <ToastComponent />
      </div>
    </>
  );
};
export default SwipeInSwipeOut;
