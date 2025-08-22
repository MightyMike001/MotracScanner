import { BaseModule } from '../baseModule.js';

export class PurchaseModule extends BaseModule {
  constructor(app) {
    super(app);
    this.title = 'Purchase Orders';
    this.subtitle = 'Inkomende goederen verwerken';
    this.currentPO = null;
  }

  async getContent() {
    const orders = this.app.state.purchaseOrders;
    if (orders.length === 0) return `<div class="empty-state">Geen purchase orders beschikbaar</div>`;

    return `
      <div id="poList">
        ${orders.map(po => `
          <div class="history-item" data-po-id="\${po.id}">
            <div class="history-main">\${po.poNumber} - \${po.supplier}</div>
            <div class="history-time">
              Verwacht: \${po.expectedDate.toLocaleDateString('nl-NL')}<br>
              Serial: \${po.serialNumber} • Aantal: \${po.quantity}
            </div>
          </div>
        `).join('')}
      </div>

      <div id="receiveStep" class="hidden">
        <div class="status-badge status-badge--pending" style="margin-bottom: 16px;">PO geselecteerd</div>
        <div id="poInfo" style="margin-bottom: 16px;"></div>

        <div class="form-group">
          <div class="form-row">
            <label class="form-label">Serial scan</label>
            <input type="text" class="form-input" id="serialInput" placeholder="Scan serial" autocomplete="off">
          </div>
          <div class="form-row">
            <label class="form-label">Locatie</label>
            <input type="text" class="form-input" id="poLocationInput" placeholder="Scan locatie" autocomplete="off">
          </div>
        </div>
        <button class="btn btn--success" id="receiveBtn">Ontvangen</button>
        <button class="btn btn--secondary" id="backToPOsBtn">Terug naar POs</button>
      </div>`;
  }

  onActivate() {
    this.container.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => this.selectPO(item.dataset.poId));
    });
    this.container.querySelector('#receiveBtn')?.addEventListener('click', () => this.handleReceive());
    this.container.querySelector('#backToPOsBtn')?.addEventListener('click', () => this.backToPOs());
  }

  selectPO(poId) {
    this.currentPO = this.app.state.purchaseOrders.find(po => po.id === poId);
    if (!this.currentPO) return;

    this.container.querySelector('#poInfo').innerHTML = `
      <strong>PO:</strong> ${this.currentPO.poNumber}<br>
      <strong>Leverancier:</strong> ${this.currentPO.supplier}<br>
      <strong>Beschrijving:</strong> ${this.currentPO.description}<br>
      <strong>Verwacht serial:</strong> ${this.currentPO.serialNumber}
    `;

    this.container.querySelector('#receiveStep').classList.remove('hidden');
    this.container.querySelector('#serialInput').focus();
  }

  handleReceive() {
    const scannedSerial = this.container.querySelector('#serialInput').value.trim();
    const location = this.container.querySelector('#poLocationInput').value.trim();
    if (!scannedSerial || !location) { this.app.showModal('Fout', 'Scan serial en locatie.'); return; }
    if (scannedSerial !== this.currentPO.serialNumber) { this.app.showModal('Fout', 'Serial nummer komt niet overeen.'); return; }

    this.app.state.addHistory({
      type: 'purchase', action: 'Goederen ontvangen', poNumber: this.currentPO.poNumber,
      serialNumber: scannedSerial, location, status: 'Ontvangen'
    });

    this.app.state.purchaseOrders = this.app.state.purchaseOrders.filter(po => po.id !== this.currentPO.id);
    this.app.state.saveToStorage();

    this.app.showModal('Succes', `PO ${this.currentPO.poNumber} ontvangen en geplaatst op ${location}.`, () => this.backToPOs());
  }

  backToPOs() {
    this.currentPO = null;
    this.container.querySelector('#receiveStep').classList.add('hidden');
    const s = this.container.querySelector('#serialInput'); if (s) s.value='';
    const l = this.container.querySelector('#poLocationInput'); if (l) l.value='';
  }
}
