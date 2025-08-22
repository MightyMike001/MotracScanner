import { BaseModule } from '../baseModule.js';

export class PlacementModule extends BaseModule {
  constructor(app) {
    super(app);
    this.title = 'Plaatsing';
    this.subtitle = 'Barcodes op locatie plaatsen';
    this.step = 'scan';
    this.currentItem = null;
  }

  async getContent() {
    return `
      <div id="placementContent">
        <div class="form-group">
          <div class="form-row">
            <label class="form-label">Barcode</label>
            <input type="text" class="form-input" id="itemInput" placeholder="Scan barcode" autocomplete="off">
          </div>
        </div>
        <button class="btn" id="scanItemBtn">Scan Barcode</button>

        <div id="locationStep" class="hidden">
          <div class="status-badge status-badge--pending" style="margin-bottom: 16px;">Barcode gescand</div>
          <div id="itemInfo" style="margin-bottom: 16px;"></div>

          <div class="form-group">
            <div class="form-row">
              <label class="form-label">Locatie</label>
              <input type="text" class="form-input" id="locationInput" placeholder="Scan locatie" autocomplete="off">
            </div>
          </div>
          <button class="btn btn--success" id="completeBtn">Plaatsen</button>
        </div>
      </div>`;
  }

  onActivate() {
    const scanBtn = this.container.querySelector('#scanItemBtn');
    const completeBtn = this.container.querySelector('#completeBtn');
    const itemInput = this.container.querySelector('#itemInput');
    const locationInput = this.container.querySelector('#locationInput');

    scanBtn?.addEventListener('click', () => this.handleItemScan());
    completeBtn?.addEventListener('click', () => this.handleComplete());

    itemInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.handleItemScan(); });
    locationInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.handleComplete(); });

    itemInput?.focus();
  }

  handleItemScan() {
    const itemCode = this.container.querySelector('#itemInput').value.trim();
    if (!itemCode) { this.app.showModal('Fout', 'Scan een barcode.'); return; }

    this.currentItem = { code: itemCode, description: `Onderdeel ${itemCode}` };
    this.container.querySelector('#itemInfo').innerHTML = `
      <strong>Barcode:</strong> ${this.currentItem.code}<br>
      <strong>Beschrijving:</strong> ${this.currentItem.description}
    `;

    this.container.querySelector('#locationStep').classList.remove('hidden');
    this.container.querySelector('#locationInput').focus();
  }

  handleComplete() {
    const location = this.container.querySelector('#locationInput').value.trim();
    if (!location) { this.app.showModal('Fout', 'Scan een locatie.'); return; }

    this.app.state.addHistory({
      type: 'placement',
      action: 'Item geplaatst',
      item: this.currentItem.code,
      location, status: 'Geplaatst'
    });

    this.app.showModal('Succes', `Item ${this.currentItem.code} geplaatst op ${location}.`, () => this.reset());
  }

  reset() {
    this.currentItem = null;
    this.container.querySelector('#itemInput').value = '';
    this.container.querySelector('#locationInput').value = '';
    this.container.querySelector('#locationStep').classList.add('hidden');
    this.container.querySelector('#itemInput').focus();
  }
}
