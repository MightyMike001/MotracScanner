import { BaseModule } from '../baseModule.js';

export class CycleCountModule extends BaseModule {
  constructor(app) {
    super(app);
    this.title = 'Cycle Count';
    this.subtitle = 'Voorraadtelling uitvoeren';
    this.currentCount = null;
  }

  async getContent() {
    const counts = this.app.state.cycleCounts.filter(c => c.status === 'Open');
    if (counts.length === 0) return `<div class="empty-state">Geen open tellingen beschikbaar</div>`;

    return `
      <div id="countsList">
        ${counts.map(count => `
          <div class="history-item" data-count-id="\${count.id}">
            <div class="history-main">\${count.id} - \${count.location}</div>
            <div class="history-time">Verwacht: \${count.expectedQty} stuks</div>
          </div>
        `).join('')}
      </div>

      <div id="countStep" class="hidden">
        <div class="status-badge status-badge--pending" style="margin-bottom: 16px;">Telling geselecteerd</div>
        <div id="countInfo" style="margin-bottom: 16px;"></div>

        <div class="form-group">
          <div class="form-row">
            <label class="form-label">Geteld aantal</label>
            <input type="number" class="form-input" id="actualQtyInput" placeholder="Aantal" autocomplete="off">
          </div>
        </div>
        <button class="btn btn--success" id="countBtn">Telling voltooien</button>
        <button class="btn btn--secondary" id="backToCountsBtn">Terug naar tellingen</button>
      </div>`;
  }

  onActivate() {
    this.container.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => this.selectCount(item.dataset.countId));
    });
    this.container.querySelector('#countBtn')?.addEventListener('click', () => this.handleCount());
    this.container.querySelector('#backToCountsBtn')?.addEventListener('click', () => this.backToCounts());
  }

  selectCount(countId) {
    this.currentCount = this.app.state.cycleCounts.find(c => c.id === countId);
    if (!this.currentCount) return;

    this.container.querySelector('#countInfo').innerHTML = `
      <strong>Telling:</strong> ${this.currentCount.id}<br>
      <strong>Locatie:</strong> ${this.currentCount.location}<br>
      <strong>Verwacht:</strong> ${this.currentCount.expectedQty} stuks
    `;
    this.container.querySelector('#countStep').classList.remove('hidden');
    this.container.querySelector('#actualQtyInput').focus();
  }

  handleCount() {
    const actualQty = parseInt(this.container.querySelector('#actualQtyInput').value);
    if (isNaN(actualQty) || actualQty < 0) { this.app.showModal('Fout', 'Voer een geldig aantal in.'); return; }

    this.currentCount.actualQty = actualQty;
    this.currentCount.status = 'Voltooid';
    const difference = actualQty - this.currentCount.expectedQty;
    const status = difference === 0 ? 'Correct' : difference > 0 ? 'Meer dan verwacht' : 'Minder dan verwacht';

    this.app.state.addHistory({
      type: 'cycleCount', action: 'Telling voltooid',
      location: this.currentCount.location, expected: this.currentCount.expectedQty, actual: actualQty,
      difference, status
    });

    this.app.state.saveToStorage();
    this.app.showModal('Succes', `Telling ${this.currentCount.id} voltooid. Verschil: ${difference}`, () => this.backToCounts());
  }

  backToCounts() {
    this.currentCount = null;
    this.container.querySelector('#countStep').classList.add('hidden');
    const a = this.container.querySelector('#actualQtyInput'); if (a) a.value='';
  }
}
