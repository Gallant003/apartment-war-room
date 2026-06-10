export const STATUSES = ['To Call', 'Contacted', 'Tour Scheduled', 'Toured', 'Rejected', 'Finalist', 'Crossed Off'];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
  { id: 'listings', label: 'Listings', icon: '⌕' },
  { id: 'add', label: 'Add', icon: '+' },
  { id: 'history', label: 'History', icon: '×' }
];

export const STARTER_LISTINGS = [
  { name: '5637 Twin Oaks', area: 'Stephanie excited', price: null, bedrooms: 2, bathrooms: null, tier: 'Hot Lead', status: 'To Call', score: 8.8, notes: 'Condo-style lead. Verify HOA, pet rules, lease timing, washer/dryer, and ground-floor fit.', verify: 'HOA/pet/lease rules; dog approval; move-in timing.', is_crossed_off: false },
  { name: '56146 Chesapeake', area: 'Stephanie excited', price: null, bedrooms: 2, bathrooms: null, tier: 'Hot Lead', status: 'To Call', score: 8.6, notes: 'Active lead. Confirm whether the practical details beat a standard apartment option.', verify: 'Availability, lease terms, pet approval, W/D, ground floor.', is_crossed_off: false },
  { name: '15536 Ashley', area: 'Stephanie excited', price: null, bedrooms: 2, bathrooms: null, tier: 'Hot Lead', status: 'To Call', score: 8.4, notes: 'Ashley added to the board as a serious lead.', verify: 'Pet/HOA/lease rules and total monthly cost.', is_crossed_off: false },
  { name: 'Laurel Valley', area: 'Apartment lead', tier: 'To Call', status: 'To Call', score: 7.5, notes: 'Call for current dog, ground floor, W/D, and July move-in details.', verify: 'Dog + ground floor + W/D + July move-in.', is_crossed_off: false },
  { name: 'Stone Ridge', area: 'Apartment lead', tier: 'To Call', status: 'To Call', score: 7.4, notes: 'Needs direct call and updated availability check.', verify: 'Dog + ground floor + W/D + July move-in.', is_crossed_off: false },
  { name: 'Stonehaven', area: 'Apartment lead', tier: 'To Call', status: 'To Call', score: 7.2, notes: 'Keep in active call batch unless pricing/availability disappoints.', verify: 'Dog + ground floor + W/D + July move-in.', is_crossed_off: false },
  { name: 'Cornerstone', area: 'Apartment lead', tier: 'To Call', status: 'To Call', score: 7.1, notes: 'Backup active lead.', verify: 'Dog + ground floor + W/D + July move-in.', is_crossed_off: false },
  { name: 'The Graham — 2B/2B', area: 'History', bedrooms: 2, bathrooms: 2, tier: 'Former default', status: 'Crossed Off', score: 0, notes: 'Preserved as search history. The 2B/2B was taken; the 2B/1B is not worth the price.', verify: 'No longer active.', is_crossed_off: true }
];
