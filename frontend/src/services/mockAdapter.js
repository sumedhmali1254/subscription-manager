import { INITIAL_MOCK_DATA } from './mockData';

const STORAGE_KEY = 'recurix_db_v2';

// Initialize or load database from localStorage
const getDB = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_DATA));
      return INITIAL_MOCK_DATA;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_MOCK_DATA;
  }
};

const saveDB = (db) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Failed to save to mock DB', err);
  }
};

const delay = (ms = 180) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAdapter = {
  resetDB: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_DATA));
    return INITIAL_MOCK_DATA;
  },

  getCollection: async (collectionName) => {
    await delay();
    const db = getDB();
    return db[collectionName] || [];
  },

  getItemById: async (collectionName, id) => {
    await delay();
    const db = getDB();
    const list = db[collectionName] || [];
    return list.find(item => item.id === id || item.subscriptionNumber === id || item.invoiceNumber === id);
  },

  createItem: async (collectionName, item) => {
    await delay();
    const db = getDB();
    if (!db[collectionName]) db[collectionName] = [];
    
    // Auto-generate standard IDs if missing
    const prefixMap = {
      customers: 'CUST',
      products: 'PROD',
      plans: 'PLAN',
      subscriptions: 'SUB-2026',
      quotations: 'QT-2026',
      invoices: 'INV-2026',
      payments: 'PAY-2026',
      discounts: 'DISC',
      taxes: 'TAX',
      users: 'USR',
      billingRuns: 'RUN-2026',
      auditLogs: 'LOG',
    };
    
    const count = db[collectionName].length + 1;
    const pad = String(count).padStart(3, '0');
    const autoId = `${prefixMap[collectionName] || 'REC'}-${pad}`;
    
    const newItem = {
      id: item.id || autoId,
      ...item,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If subscription, also set subscriptionNumber
    if (collectionName === 'subscriptions' && !newItem.subscriptionNumber) {
      newItem.subscriptionNumber = newItem.id;
    }
    // If invoice, also set invoiceNumber
    if (collectionName === 'invoices' && !newItem.invoiceNumber) {
      newItem.invoiceNumber = newItem.id;
    }
    // If quotation, set quotationNumber
    if (collectionName === 'quotations' && !newItem.quotationNumber) {
      newItem.quotationNumber = newItem.id;
    }

    db[collectionName].unshift(newItem);
    saveDB(db);

    // Also write an audit log
    if (collectionName !== 'auditLogs') {
      const log = {
        id: `LOG-${Date.now()}`,
        userName: 'Current User',
        userEmail: 'user@brightloop.io',
        action: `CREATED_${collectionName.toUpperCase()}`,
        module: collectionName,
        recordId: newItem.id,
        timestamp: new Date().toISOString(),
        description: `Created new record in ${collectionName}: ${newItem.id}`,
      };
      if (!db.auditLogs) db.auditLogs = [];
      db.auditLogs.unshift(log);
      saveDB(db);
    }

    return newItem;
  },

  updateItem: async (collectionName, id, updates) => {
    await delay();
    const db = getDB();
    const list = db[collectionName] || [];
    const index = list.findIndex(item => item.id === id || item.subscriptionNumber === id || item.invoiceNumber === id);
    if (index === -1) {
      throw new Error(`Record with id ${id} not found in ${collectionName}`);
    }

    const updated = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    saveDB(db);

    return updated;
  },

  deleteItem: async (collectionName, id) => {
    await delay();
    const db = getDB();
    const list = db[collectionName] || [];
    db[collectionName] = list.filter(item => item.id !== id && item.subscriptionNumber !== id && item.invoiceNumber !== id);
    saveDB(db);
    return { success: true, id };
  },

  getCompanySettings: async () => {
    await delay();
    const db = getDB();
    return db.companySettings || INITIAL_MOCK_DATA.companySettings;
  },

  updateCompanySettings: async (settings) => {
    await delay();
    const db = getDB();
    db.companySettings = { ...db.companySettings, ...settings };
    saveDB(db);
    return db.companySettings;
  },
};

