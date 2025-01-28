import admin from './admin';
import ap from './ap';
import ar from './ar';
import basicMaster from './basicMaster';
import companySetup from './companySetup';
import dashboard from './dashboard';
import finalReport from './FinalReport';
import finance from './finance';
import genTransaction from './GenTransaction';

// Function to get menu items based on localStorage value
const getMenuItems = () => {
  const localStorageValue = localStorage.getItem('userType');

  // Define default menu items
  const defaultMenuItems = {
    items: [dashboard, companySetup, admin, basicMaster, finance, genTransaction, ar, ap, finalReport]
  };

  // Define menu items based on localStorage value
  switch (localStorageValue) {
    case 'ROLE_SUPER_ADMIN':
      return {
        items: [dashboard, companySetup, basicMaster]
      };
    case 'admin': // Correctly match the value
      return {
        items: [dashboard, companySetup, admin, basicMaster, finance, genTransaction, ar, ap, finalReport]
      };
    // Add more cases as needed
    default:
      return defaultMenuItems; // Return default menu items if no match is found
  }
};

// Export default menu items
export default getMenuItems();
