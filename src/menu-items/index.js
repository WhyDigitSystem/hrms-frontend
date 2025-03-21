import admin from './admin';
import dashboard from './dashboard';
import companySetup from './companySetup';
import basicMaster from './basicMaster';
import employeeMaster from './employeeMaster';
import leaveMaster from './leaveMaster';
import salaryMaster from './salaryMaster';
import calendar from './calendar';
import me from './me';
import team from './team';

// Function to get menu items based on localStorage value
const getMenuItems = () => {
  const localStorageValue = localStorage.getItem('userType') || 'ROLE_ADMIN';


  // Define default menu items
  const defaultMenuItems = {
    items: [dashboard, calendar, companySetup]
  };

  // Define menu items based on localStorage value
  switch (localStorageValue) {
    case 'ADMIN':
      return {
        items: [dashboard, calendar, admin, companySetup, basicMaster,employeeMaster,leaveMaster,salaryMaster, me, team]
      };
    case 'USER':
      return {
        items: [dashboard, calendar, me]
      };
    case 'DEPARTMENT HEAD': 
      return {
        items: [dashboard, calendar, me, team]
      };
    // Add more cases as needed
    default:
      return defaultMenuItems; // Return default menu items if no match is found
  }
};

// Export default menu items
export default getMenuItems();
