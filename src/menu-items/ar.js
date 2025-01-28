// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
  IconKey
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const ar = {
  id: 'ar',
  title: 'Accounts Receival',
  //   caption: 'Pages Caption',
  type: 'group',
  children: [
    {
      id: 'ar',
      title: 'AR',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        // {
        //   id: 'arBill',
        //   title: 'AR Bill Balance',
        //   type: 'item',
        //   url: '/finance/receipt/ArBillBalance'
        // },
        // {
        //   id: 'receipt',
        //   title: 'Receipt',
        //   type: 'item',
        //   url: '/finance/receipt/Receipt'
        // },
        // {
        //   id: 'receiptRegister',
        //   title: 'Receipt Register',
        //   type: 'item',
        //   url: '/finance/receiptRegister/ReceiptRegister'
        // }

        {
          id: 'taxInvoiceDetail',
          title: 'Tax Invoice',
          type: 'item',
          url: '/finance/taxInvoice/taxInvoiceDetail'
        },
        {
          id: 'creditNoteDetail',
          title: 'Credit Note',
          type: 'item',
          url: '/finance/creditNote/creditNoteDetail'
        },
        {
          id: 'receipt',
          title: 'Customer Receipt',
          type: 'item',
          url: '/finance/receipt/Receipt'
        },

        {
          id: 'adjustmentOffset',
          title: 'AR Adjustment / Offset',
          type: 'item',
          url: '/finance/AR-adjustment'
        },
        {
          id: 'customerLedger',
          title: 'Customer Ledger',
          type: 'item',
          url: '/finance/AR-adjustment'
        },
        {
          id: 'Outstanding',
          title: 'AR Outstanding with aging Report',
          type: 'item',
          url: '/finance/AR-adjustment'
        }
      ]
    }
  ]
};

export default ar;
