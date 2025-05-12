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
import finance from './finance';

// Function to get menu items based on localStorage value
const getMenuItems = () => {
  const localStorageValue = localStorage.getItem('userType') || 'SADMIN';

  const filteredCompanySetup = {
    ...companySetup,
    children: companySetup.children.map((child) => ({
      ...child,
      children: child.children.filter((item) => item.id === 'createCompany') // Keeping only "Create Company"
    }))
  };

  const adminCompanySetup = {
    ...companySetup,
    children: companySetup.children.map((child) => ({
      ...child,
      children: child.children.filter((item) => item.id === 'company')
    }))
  };

  const defaultMenuItems = {
    items: localStorageValue === 'SADMIN' && [filteredCompanySetup] // Show only filteredCompanySetup for SADMIN
  };

  // Define menu items based on localStorage value
  switch (localStorageValue) {
    case 'ADMIN':
      return {
        items: [dashboard, calendar, adminCompanySetup, admin, basicMaster, employeeMaster, me, finance, team]
      };
    case 'USER':
      return {
        items: [dashboard, calendar, me, finance]
      };
    case 'DEPARTMENT HEAD':
      return {
        items: [dashboard, calendar, me, finance, team]
      };
      case 'ASSISTANT ACCOUNTS':
        return {
          items: [dashboard, calendar, me, finance]
        };
    case 'TEAM LEAD':
      return {
        items: [dashboard, calendar, me, finance, team]
      };
    default:
      return defaultMenuItems;
  }
};

// Export default menu items
export default getMenuItems();
