// assets
import { IconCashBanknote, IconDatabaseStar, IconBuildingFactory2, IconIdBadge2, IconMapQuestion, IconUsersGroup, IconWorld, IconMap, IconBuildingSkyscraper } from '@tabler/icons-react';

// constant
const icons = {
  IconWorld
};

const icons1 = {
  IconMap
};

const icons0 = {
  IconDatabaseStar
};
const icons2 = {
  IconBuildingSkyscraper
};
const icons3 = {
  IconCashBanknote
};
const icons4 = {
  IconBuildingFactory2
};
const icons6 = {
  IconIdBadge2
};
const icons7 = {
  IconMapQuestion
};
const icons8 = {
  IconUsersGroup
};



const manageTax = {
  id: 'manageTax',
  // title: 'Basic Master',
  type: 'group',
  children: [
    {
      id: 'manageTax',
      title: 'Manage Tax',
      type: 'collapse',
      icon: icons0.IconDatabaseStar,

      children: [
        {
          id: 'manageTax',
          title: 'Manage Tax',
          type: 'item',
          url: '/ManageTax/manageTax',
          icon: icons.IconWorld
        },
        {
          id: 'DeclarationDate',
          title: 'Declaration Date',
          type: 'item',
          url: '/ManageTax/DeclarationDate',
          icon: icons.IconWorld
        },
        {
          id: 'DeclarationInput',
          title: 'Declaration Input',
          type: 'item',
          url: '/ManageTax/DeclarationInput',
          icon: icons.IconWorld
        },
      ]
    }
  ]
};

export default manageTax;
