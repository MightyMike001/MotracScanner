import { BaseModule } from '../baseModule.js';

export class InventoryModule extends BaseModule {
  constructor(app) {
    super(app);
    this.title = 'Inventaris';
    this.subtitle = 'Barcodes opzoeken in voorraad';
  }

  async getContent() {
    return `
      <div class="form-group">
        <div class="form-row">
          <label class="form-label">Zoeken</label>
          <input type="text" class="form-input" id="searchInput" placeholder="Barcode of locatie" autocomplete="off">
        </div>
      </div>
      <button class="btn" id="searchBtn">Zoeken</button>

      <div id="searchResults" class="hidden">
        <div class="status-badge status-badge--active" style="margin-bottom: 16px;">Gevonden</div>
        <div id="resultsContent"></div>
      </div>`;
  }

  onActivate() {
    this.container.querySelector('#searchBtn')?.addEventListener('click', () => this.handleSearch());
    this.container.querySelector('#searchInput')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.handleSearch(); });
    this.container.querySelector('#searchInput')?.focus();
  }

  handleSearch() {
    const query = this.container.querySelector('#searchInput').value.trim();
    if (!query) { this.app.showModal('Fout', 'Voer een zoekterm in.'); return; }

    // Mock search results
    const results = {
      item: query,
      description: `Onderdeel ${query}`,
      location: 'A-01-B-03',
      quantity: Math.floor(Math.random() * 50) + 1,
      reserved: Math.floor(Math.random() * 10),
      available: function() { return this.quantity - this.reserved; }
    };

    this.container.querySelector('#resultsContent').innerHTML = `
      <div style="background: var(--background-secondary); padding: 16px; border-radius: 8px;">
        <div style="margin-bottom: 8px;"><strong>Item:</strong> ${results.item}</div>
        <div style="margin-bottom: 8px;"><strong>Beschrijving:</strong> ${results.description}</div>
        <div style="margin-bottom: 8px;"><strong>Locatie:</strong> ${results.location}</div>
        <div style="margin-bottom: 8px;"><strong>Voorraad:</strong> ${results.quantity} stuks</div>
        <div style="margin-bottom: 8px;"><strong>Gereserveerd:</strong> ${results.reserved} stuks</div>
        <div><strong>Beschikbaar:</strong> ${results.available()} stuks</div>
      </div>
    `;

    this.container.querySelector('#searchResults').classList.remove('hidden');
    this.app.state.addHistory({ type: 'inventory', action: 'Inventaris gezocht', item: query, status: 'Gevonden' });
  }
}
