// Initialize sample data for demonstration
export const initializeSampleData = () => {
  // Check if already initialized
  if (localStorage.getItem('easefind_initialized')) return;

  // Sample users
  const sampleUsers = [
    {
      id: 'USER001',
      fullName: 'John Smith',
      email: 'john.smith@example.com',
      password: 'Password@123',
    },
    {
      id: 'USER002',
      fullName: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      password: 'SecurePass@456',
    },
    {
      id: 'USER003',
      fullName: 'Michael Brown',
      email: 'mbrown@example.com',
      password: 'MyPass@789',
    },
  ];

  // Sample items
  const sampleItems = [
    {
      id: 'ITEM001',
      userId: 'USER001',
      userName: 'John Smith',
      type: 'lost',
      itemName: 'Laptop',
      category: 'Electronics',
      description: 'Dell XPS 15, silver color with stickers on the lid',
      contactInfo: 'john.smith@example.com',
      date: '2026-02-10',
      location: 'Coffee Shop, Main Street',
      image: null,
      createdAt: '2026-02-10T10:30:00.000Z',
    },
    {
      id: 'ITEM002',
      userId: 'USER002',
      userName: 'Sarah Johnson',
      type: 'found',
      itemName: 'Laptop',
      category: 'Electronics',
      description: 'Silver Dell laptop with company stickers',
      contactInfo: 'sarah.j@example.com',
      date: '2026-02-11',
      location: 'Reception Desk, Office Building',
      image: null,
      createdAt: '2026-02-11T14:20:00.000Z',
    },
    {
      id: 'ITEM003',
      userId: 'USER001',
      userName: 'John Smith',
      type: 'lost',
      itemName: 'Keys',
      category: 'Keys',
      description: 'Set of keys with blue keychain',
      contactInfo: 'john.smith@example.com',
      date: '2026-02-12',
      location: 'Park near Central Station',
      image: null,
      createdAt: '2026-02-12T09:15:00.000Z',
    },
    {
      id: 'ITEM004',
      userId: 'USER003',
      userName: 'Michael Brown',
      type: 'found',
      itemName: 'Wallet',
      category: 'Personal Items',
      description: 'Brown leather wallet with credit cards inside',
      contactInfo: 'mbrown@example.com',
      date: '2026-02-13',
      location: 'Bus Stop on Oak Avenue',
      image: null,
      createdAt: '2026-02-13T16:45:00.000Z',
    },
    {
      id: 'ITEM005',
      userId: 'USER002',
      userName: 'Sarah Johnson',
      type: 'lost',
      itemName: 'Phone',
      category: 'Electronics',
      description: 'iPhone 14 Pro in blue color with clear case',
      contactInfo: 'sarah.j@example.com',
      date: '2026-02-14',
      location: 'Shopping Mall parking lot',
      image: null,
      createdAt: '2026-02-14T11:00:00.000Z',
    },
    {
      id: 'ITEM006',
      userId: 'USER003',
      userName: 'Michael Brown',
      type: 'found',
      itemName: 'Backpack',
      category: 'Bags',
      description: 'Black Nike backpack with books inside',
      contactInfo: 'mbrown@example.com',
      date: '2026-02-14',
      location: 'University Library',
      image: null,
      createdAt: '2026-02-14T15:30:00.000Z',
    },
  ];

  localStorage.setItem('easefind_users', JSON.stringify(sampleUsers));
  localStorage.setItem('easefind_items', JSON.stringify(sampleItems));
  localStorage.setItem('easefind_initialized', 'true');
};
