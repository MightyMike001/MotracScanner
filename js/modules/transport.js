import { BaseModule } from '../baseModule.js';

export class TransportModule extends BaseModule {
  constructor(app) {
    super(app);
    this.title = 'Transport';
    this.subtitle = 'Transportregels uitvoeren';
    this.currentRule = null;
  }

  async getContent() {
    const rules = this.app.state.transportRules;
    if (rules.length === 0) return `<div class="empty-state">Geen transportregels beschikbaar</div>`;

    return `
      <div id="rulesList">
        ${rules.map(rule => `
          <div class="history-item" data-rule-id="${rule.id}">
            <div class="history-main">${rule.id} - ${rule.item}</div>
            <div class="history-time">Van: ${rule.from} → Naar: ${rule.to}</div>
          </div>
        `).join('')}
      </div>

      <div id="transportStep" class="hidden">
        <div class="status-badge status-badge--pending" style="margin-bottom: 16px;">Transport geselecteerd</div>
        <div id="ruleInfo" style="margin-bottom: 16px;"></div>

        <div class="form-group">
          <div class="form-row">
            <label class="form-label">Van locatie</label>
            <input type="text" class="form-input" id="fromInput" placeholder="Scan van locatie" autocomplete="off">
          </div>
          <div class="form-row">
            <label class="form-label">Naar locatie</label>
            <input type="text" class="form-input" id="toInput" placeholder="Scan naar locatie" autocomplete="off">
          </div>
        </div>
        <button class="btn btn--success" id="transportBtn">Transport voltooien</button>
        <button class="btn btn--secondary" id="backToRulesBtn">Terug naar regels</button>
      </div>`;
  }

  onActivate() {
    this.container.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => this.selectRule(item.dataset.ruleId));
    });
    this.container.querySelector('#transportBtn')?.addEventListener('click', () => this.handleTransport());
    this.container.querySelector('#backToRulesBtn')?.addEventListener('click', () => this.backToRules());
  }

  selectRule(ruleId) {
    this.currentRule = this.app.state.transportRules.find(r => r.id === ruleId);
    if (!this.currentRule) return;

    this.container.querySelector('#ruleInfo').innerHTML = `
      <strong>Regel:</strong> ${this.currentRule.id}<br>
      <strong>Item:</strong> ${this.currentRule.item}<br>
      <strong>Van:</strong> ${this.currentRule.from}<br>
      <strong>Naar:</strong> ${this.currentRule.to}
    `;

    this.container.querySelector('#transportStep').classList.remove('hidden');
    this.container.querySelector('#fromInput').focus();
  }

  handleTransport() {
    const fromLocation = this.container.querySelector('#fromInput').value.trim();
    const toLocation = this.container.querySelector('#toInput').value.trim();
    if (!fromLocation || !toLocation) { this.app.showModal('Fout', 'Scan beide locaties.'); return; }
    if (fromLocation !== this.currentRule.from || toLocation !== this.currentRule.to) {
      this.app.showModal('Fout', 'Locaties komen niet overeen met de transportregel.'); return;
    }

    this.app.state.addHistory({
      type: 'transport', action: 'Transport voltooid',
      item: this.currentRule.item, from: fromLocation, to: toLocation, status: 'Voltooid'
    });

    this.app.state.transportRules = this.app.state.transportRules.filter(r => r.id !== this.currentRule.id);
    this.app.state.saveToStorage();

    this.app.showModal('Succes', `Transport ${this.currentRule.id} voltooid.`, () => this.backToRules());
  }

  backToRules() {
    this.currentRule = null;
    this.container.querySelector('#transportStep').classList.add('hidden');
    const f = this.container.querySelector('#fromInput'); if (f) f.value='';
    const t = this.container.querySelector('#toInput'); if (t) t.value='';
  }
}
