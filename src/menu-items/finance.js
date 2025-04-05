// assets
import {
  IconCash,
  IconReceipt,
  IconFileInvoice,
  IconWallet,
  IconCoin
} from '@tabler/icons-react';

// constant
const icons = {
  IconCash,
  IconReceipt,
  IconFileInvoice,
  IconWallet,
  IconCoin
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const finance = {
  id: 'finance',
  type: 'group',
  children: [
    {
      id: 'finance',
      title: 'Finance',
      type: 'collapse',
      icon: icons.IconCash,  // Money icon for Finance section
      children: [
        {
          id: 'finance',
          title: 'Payslip',
          type: 'item',
          url: '/finance/payslip',
          icon: icons.IconReceipt  // Receipt icon for Payslip
        }
      ]
    }
  ]
};

export default finance;