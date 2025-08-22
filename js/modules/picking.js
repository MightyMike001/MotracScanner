import { BaseModule } from '../baseModule.js';

export class PickingModule extends BaseModule {
  constructor(app) {
    super(app);
    this.title = 'Picking';
    this.subtitle = 'Barcodes voor picking scannen';
    this.currentOrder = null;
  }

  async getContent() {
    const orders = this.app.state.orders.filter(o => o.status === 'Open');
    if (orders.length === 0) return `<div class="empty-state">Geen open orders beschikbaar</div>`;

    return `
      <div class="filter-group">
        <button class="filter-btn active" data-filter="all">Alle</button>
        <button class="filter-btn" data-filter="high">Hoog</button>
        <button class="filter-btn" data-filter="normal">Normaal</button>
      </div>

      <div id="ordersList">
        ${orders.map(order => `
          <div class="history-item" data-order-id="${order.id}">
            <div class="history-main">${order.id} - ${order.customer}</div>
            <div class="history-time">Prioriteit: ${order.priority} • ${order.items.length} item(s)</div>
          </div>
        `).join('')}
      </div>

      <div id="pickingStep" class="hidden">
        <div class="status-badge status-badge--pending" style="margin-bottom: 16px;">Order geselecteerd</div>
        <div id="orderInfo" style="margin-bottom: 16px;"></div>

        <div class="form-group">
          <div class="form-row">
            <label class="form-label">Barcode</label>
            <input type="text" class="form-input" id="pickInput" placeholder="Scan barcode" autocomplete="off">
          </div>
        </div>
        <button class="btn btn--success" id="pickBtn">Pick Barcode</button>
        <button class="btn btn--secondary" id="backToOrdersBtn">Terug naar orders</button>
      </div>`;
  }

  onActivate() {
    this.container.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => this.selectOrder(item.dataset.orderId));
    });
    this.container.querySelector('#pickBtn')?.addEventListener('click', () => this.handlePick());
    this.container.querySelector('#backToOrdersBtn')?.addEventListener('click', () => this.backToOrders());
    this.container.querySelector('#pickInput')?.addEventListener('keypress', e => { if (e.key === 'Enter') this.handlePick(); });
  }

  selectOrder(orderId) {
    this.currentOrder = this.app.state.orders.find(o => o.id === orderId);
    if (!this.currentOrder) return;
    this.container.querySelector('#orderInfo').innerHTML = `
      <strong>Order:</strong> ${this.currentOrder.id}<br>
      <strong>Klant:</strong> ${this.currentOrder.customer}<br>
      <strong>Items:</strong> ${this.currentOrder.items.join(', ')}
    `;
    this.container.querySelector('#pickingStep').classList.remove('hidden');
    this.container.querySelector('#pickInput').focus();
  }

  handlePick() {
    const itemCode = this.container.querySelector('#pickInput').value.trim();
    if (!itemCode) { this.app.showModal('Fout', 'Scan een barcode.'); return; }
    if (!this.currentOrder.items.includes(itemCode)) { this.app.showModal('Fout', 'Barcode niet in deze order.'); return; }

    this.app.state.addHistory({
      type: 'picking', action: 'Barcode gepickt', item: itemCode, orderNumber: this.currentOrder.id, status: 'Gepickt'
    });

    this.currentOrder.items = this.currentOrder.items.filter(i => i !== itemCode);
    if (this.currentOrder.items.length === 0) {
      this.currentOrder.status = 'Voltooid';
      this.app.showModal('Succes', `Order ${this.currentOrder.id} voltooid!`, () => this.backToOrders());
    } else {
      this.app.showModal('Succes', `Barcode ${itemCode} gepickt.`);
      this.container.querySelector('#pickInput').value = '';
      this.container.querySelector('#pickInput').focus();
    }
    this.app.state.saveToStorage();
  }

  backToOrders() {
    this.currentOrder = null;
    this.container.querySelector('#pickingStep').classList.add('hidden');
    const input = this.container.querySelector('#pickInput');
    if (input) input.value = '';
  }
}
