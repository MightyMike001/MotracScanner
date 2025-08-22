export class BaseModule {
  constructor(app) {
    this.app = app;
    this.title = 'Module';
    this.subtitle = 'Standaard module';
    this.container = document.getElementById('moduleScreen');
  }

  getTitle() { return this.title; }
  getSubtitle() { return this.subtitle; }

  async render() {
    this.container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">${this.getTitle()}</div>
          <div class="card-subtitle">${this.getSubtitle()}</div>
        </div>
        <div class="card-content">
          ${await this.getContent()}
        </div>
      </div>
    `;
  }

  async getContent() { return `<div class="empty-state">Module wordt geladen...</div>`; }

  onActivate() {}
  onDeactivate() {}
}
