// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
  IconKey
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const employeeMaster = {
  id: 'employeeMaster',
  title: 'Employee Master',
  type: 'group',
  children: [
    {
      id: 'employeeMaster',
      title: 'Employee Master',
      type: 'collapse',
      icon: icons.IconKey,
      children: [
        {
          id: 'employeeDetails',
          title: 'Employee Details',
          type: 'item',
          url: '/employeeMaster/employeeDetails'
        },
        // {
        //   id: 'group',
        //   title: 'COA',
        //   type: 'item',
        //   url: '/employeeMaster/Group'
        // },
        // {
        //   id: 'chargeTypeRequest',
        //   title: 'Charge Code',
        //   type: 'item',
        //   url: '/employeeMaster/ChargeTypeRequest'
        // },
        // {
        //   id: 'tdsMaster',
        //   title: 'TDS',
        //   type: 'item',
        //   url: '/employeeMaster/tdsMaster/TdsMaster'
        // },
        // {
        //   id: 'hsnSacCode',
        //   title: 'HSN SAC Code',
        //   type: 'item',
        //   url: '/employeeMaster/HsnSacCode'
        // },

        // {
        //   id: 'costCenter',
        //   title: 'Cost Center Values',
        //   type: 'item',
        //   url: '/employeeMaster/costcenter/CostCentre'
        // },
        // {
        //   id: 'partyMaster',
        //   title: 'Party',
        //   type: 'item',
        //   url: '/employeeMaster/partyMaster'
        // },
        // {
        //   id: 'customer',
        //   title: 'Customer',
        //   type: 'item',
        //   url: '/employeeMaster/customer'
        // },
        // {
        //   id: 'vendor',
        //   title: 'Vendor',
        //   type: 'item',
        //   url: '/employeeMaster/vendor'
        // },
        // {
        //   id: 'taxMaster',
        //   title: 'Tax Master',
        //   type: 'item',
        //   url: '/employeeMaster/taxMaster'
        // }
      ] 
    }
  ]
};

export default employeeMaster;
