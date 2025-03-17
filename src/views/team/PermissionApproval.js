import ToastComponent, { showToast } from 'utils/toast-component';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import CommonListViewTable from '../basicMaster/CommonListViewTable';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';

const PermissionApproval = () => {
    const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
    const listViewColumns = [
      { accessorKey: 'Date', header: 'Date', size: 140 },
      { accessorKey: 'Date', header: 'IN Time', size: 140 },
      { accessorKey: 'Date', header: 'Out Time', size: 140 },
      { accessorKey: 'Date', header: 'Worked Hours', size: 140 },
    ];
    const [listViewData, setListViewData] = useState([]);
  
    useEffect(() => {
      getAllHolidayReport();
    }, []);
  const getAllHolidayReport = async () => {
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
                toEdit={getAllHolidayReport}
                enableEditing={true}
              />
            {/* </div> */}
          </div>
        <ToastComponent />
      </div>
    </>
  )
}

export default PermissionApproval