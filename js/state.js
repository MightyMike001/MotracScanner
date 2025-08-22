export class MotracState {
  constructor() {
    this.user = null;
    this.history = [];
    this.orders = [];
    this.transportRules = [];
    this.cycleCounts = [];
    this.purchaseOrders = [];
    this.currentModule = null;
    this.currentStep = 'scan';
    this.currentObject = null;
    this.currentOrder = null;
    this.activityFilter = 'all';
  }

  addHistory(record) {
    this.history.unshift({
      ...record,
      timestamp: new Date(),
      user: this.user?.name || 'Onbekend',
    });
    this.saveToStorage();
  }

  saveToStorage() {
    localStorage.setItem(
      'motracState',
      JSON.stringify({
        history: this.history,
        orders: this.orders,
        transportRules: this.transportRules,
        cycleCounts: this.cycleCounts,
        purchaseOrders: this.purchaseOrders,
      })
    );
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('motracState');
      if (saved) {
        const data = JSON.parse(saved);
        this.history = data.history || [];
        this.orders = data.orders || [];
        this.transportRules = data.transportRules || [];
        this.cycleCounts = data.cycleCounts || [];
        this.purchaseOrders = data.purchaseOrders || [];
      }
    } catch (e) {
      console.error('Error loading state:', e);
    }
  }

  generateMockData() {
    this.orders = [
      { id: 'ORD001', customer: 'ACME Corp', priority: 'Hoog', items: ['ABC123', 'DEF456'], status: 'Open' },
      { id: 'ORD002', customer: 'TechnoFix BV', priority: 'Normaal', items: ['GHI789'], status: 'Picking' },
      { id: 'ORD003', customer: 'MotoServ', priority: 'Laag', items: ['JKL012', 'MNO345'], status: 'Open' }
    ];

    this.transportRules = [
      { id: 'TR001', from: 'A-01-A-01', to: 'B-02-B-01', item: 'ABC123', priority: 'Hoog' },
      { id: 'TR002', from: 'C-03-C-01', to: 'D-04-D-01', item: 'DEF456', priority: 'Normaal' }
    ];

    this.cycleCounts = [
      { id: 'CC001', location: 'A-01-A-01', expectedQty: 10, actualQty: null, status: 'Open' },
      { id: 'CC002', location: 'B-02-B-01', expectedQty: 25, actualQty: null, status: 'Open' }
    ];

    this.purchaseOrders = [
      {
        id: 'PO001',
        supplier: 'Parts Plus',
        poNumber: 'PO-2024-001',
        expectedDate: new Date(Date.now() + 86400000),
        serialNumber: 'SN123456',
        quantity: 5,
        description: 'Hydraulische cilinder - Model HC-500',
      },
    ];
  }
}
