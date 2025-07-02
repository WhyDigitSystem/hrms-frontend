// assets
import {
  IconCash,
  IconReceipt,
  IconFileInvoice,
  IconWallet,
  IconCoin,
  IconReport,
  IconReportMoney,
  IconBank,
  IconMoneybag
} from '@tabler/icons-react';

// constant
const icons = {
  IconCash,
  IconReceipt,
  IconFileInvoice,
  IconWallet,
  IconCoin,
  IconReport,
  IconReportMoney,
  IconMoneybag
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const finance = {
  id: 'finance',
  type: 'group',
  children: [
    {
      id: 'finance-section',
      title: 'Finance',
      type: 'collapse',
      icon: icons.IconCash, // 💵 Cash icon for main Finance section
      children: [
        {
          id: 'payslip',
          title: 'Payslip',
          type: 'item',
          url: '/finance/payslip',
          icon: icons.IconFileInvoice // 🧾 Invoice icon for Payslip
        },
        // {
        //   id: 'esi',
        //   title: 'ESI',
        //   type: 'item',
        //   url: '/finance/ESI',
        //   icon: icons.IconWallet 
        // },
        {
          id: 'esi-report',
          title: 'ESI Report',
          type: 'item',
          url: '/finance/ESIReport',
          icon: icons.IconReportMoney 
        },
        // {
        //   id: 'pf-calculation',
        //   title: 'PF Calculation',
        //   type: 'item',
        //   url: '/finance/PFCalculation',
        //   icon: icons.IconReportMoney
        // },
        {
          id: 'pf-report',
          title: 'PF Calculation Report',
          type: 'item',
          url: '/finance/PFCalculationReport',
          icon: icons.IconReport // 📄 General report icon
        }
      ]
    }
  ]
};

export default finance;
