import { BaseModule } from '../baseModule.js';

export class ActivityModule extends BaseModule {
  constructor(app) {
    super(app);
    this.title = 'Activiteit';
    this.subtitle = 'Recente acties bekijken';
  }

  async getContent() {
    const history = this.app.state.history;
    if (history.length === 0) return `<div class="empty-state">Geen activiteit beschikbaar</div>`;

    return `
      <div class="filter-group">
        <button class="filter-btn active" data-filter="all">Alle</button>
        <button class="filter-btn" data-filter="today">Vandaag</button>
        <button class="filter-btn" data-filter="my">Mijn acties</button>
      </div>

      <button class="btn btn--danger btn--small" id="clearHistoryBtn">Geschiedenis wissen</button>

      <div id="historyList">
        ${this.renderHistory(history)}
      </div>`;
  }

  renderHistory(history) {
    return history.map(record => {
      const date = new Date(record.timestamp);
      const timeStr = date.toLocaleString('nl-NL', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
      return `
        <div class="history-item">
          <div class="history-main">${record.action}</div>
          <div class="history-time">
            ${record.user} • ${timeStr} • ${record.status}
            ${record.item ? ` (${record.item})` : ''}
            ${record.orderNumber ? ` (${record.orderNumber})` : ''}
          </div>
        </div>`;
    }).join('');
  }

  onActivate() {
    this.container.querySelector('#clearHistoryBtn')?.addEventListener('click', () => {
      this.app.showModal('Bevestigen', 'Weet je zeker dat je alle geschiedenis wilt wissen?', () => {
        this.app.state.history = [];
        this.app.state.saveToStorage();
        this.render();
      });
    });

    this.container.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.applyFilter(btn.dataset.filter);
      });
    });
  }

  applyFilter(filter) {
    let filteredHistory = this.app.state.history;
    if (filter === 'today') {
      const today = new Date().toDateString();
      filteredHistory = this.app.state.history.filter(r => new Date(r.timestamp).toDateString() === today);
    } else if (filter === 'my') {
      filteredHistory = this.app.state.history.filter(r => r.user === this.app.state.user?.name);
    }
    this.container.querySelector('#historyList').innerHTML = this.renderHistory(filteredHistory);
  }
}
