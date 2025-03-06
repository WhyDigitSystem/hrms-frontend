import React, { useState, useEffect } from 'react';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import apiCalls from 'apicall';
import dayjs from 'dayjs';

const HolidaysListView = () => {
  const [listViewData, setListViewData] = useState([]);
  const orgId = localStorage.getItem('orgId');

  const listViewColumns = [
    { accessorKey: 'holidayDate', header: 'Holiday Date', size: 140 },
    { accessorKey: 'day', header: 'Day', size: 140 },
    { accessorKey: 'festival', header: 'Festival', size: 140 },
    { accessorKey: 'branchName', header: 'Branch Name', size: 140 }
  ];

  useEffect(() => {
    getAllHolidayByOrgId();
    hideActionsColumn();

    // Watch for UI changes and re-hide actions column when table updates
    const observer = new MutationObserver(hideActionsColumn);
    observer.observe(document.body, { childList: true, subtree: true });

    // Reapply hiding logic when screen resizes or full screen changes
    window.addEventListener('resize', hideActionsColumn);
    document.addEventListener('fullscreenchange', hideActionsColumn);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', hideActionsColumn);
      document.removeEventListener('fullscreenchange', hideActionsColumn);
    };
  }, []);

  const getAllHolidayByOrgId = async () => {
    try {
      const response = await apiCalls('get', `/basicmaster/getAllHolidayByOrgId?orgId=${orgId}`);
      console.log("API Response:", response);

      if (response.status === true && response.paramObjectsMap.holidayVO.length > 0) {
        const formattedData = response.paramObjectsMap.holidayVO.map((holiday) => ({
          ...holiday,
          holidayDate: holiday.holidayDate ? dayjs(holiday.holidayDate).format('YYYY-MM-DD') : '',
        }));
        setListViewData(formattedData);
        console.log("Formatted Data:", formattedData);
      } else {
        console.error('API Error: No holiday data found');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const hideActionsColumn = () => {
    setTimeout(() => {
      document.querySelectorAll("th:first-child, td:first-child").forEach((el) => {
        el.style.display = "none";
      });
    }, 100);
  };

  return (
    <div style={{ width: '100%', padding: '20px', borderRadius: '10px', overflowX: 'auto' }}>
      <div>
        {listViewData.length > 0 ? (
          <CommonListViewTable 
            data={listViewData} 
            columns={listViewColumns} 
            blockEdit={true} 
            showActions={false} 
            hideActions={true} 
          />
        ) : (
          <p style={{ textAlign: 'center', fontSize: '18px', color: 'gray' }}>No holidays available</p>
        )}
      </div>
    </div>
  );
};

export default HolidaysListView;
