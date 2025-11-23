import { Building2, Bus, MapPin, Store, Truck, Users } from 'lucide-react';

export const CATEGORY_OPTIONS = [
  {
    value: 'all',
    label: 'All categories',
    icon: Store,
    description: 'Browse every asset type',
    listingIntent: 'all',
    listingType: '',
  },
  {
    value: 'food-trucks',
    label: 'Food trucks',
    icon: Truck,
    description: 'Fully equipped mobile kitchens',
    listingIntent: 'rent',
    listingType: 'RENT',
  },
  {
    value: 'trailers',
    label: 'Food trailers',
    icon: Bus,
    description: 'Towable trailers and carts',
    listingIntent: 'rent',
    listingType: 'RENT',
  },
  {
    value: 'ghost-kitchens',
    label: 'Ghost kitchens',
    icon: Building2,
    description: 'Licensed commissaries and kitchens',
    listingIntent: 'rent',
    listingType: 'RENT',
  },
  {
    value: 'event-pros',
    label: 'Event pros',
    icon: Users,
    description: 'Chefs, caterers, and hospitality teams',
    listingIntent: 'event-pro',
    listingType: 'EVENT_PRO',
  },
  {
    value: 'vending-lots',
    label: 'Vending lots',
    icon: MapPin,
    description: 'Pop-up ready vending locations',
    listingIntent: 'rent',
    listingType: 'RENT',
  },
];

export const CATEGORY_MAP = CATEGORY_OPTIONS.reduce((acc, category) => {
  acc[category.value] = category;
  return acc;
}, {});

export const DEFAULT_CATEGORY = CATEGORY_OPTIONS[0];
