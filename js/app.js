import { MotracState } from './state.js';
import { BaseModule } from './baseModule.js';
import { PlacementModule } from './modules/placement.js';
import { PickingModule } from './modules/picking.js';
import { TransportModule } from './modules/transport.js';
import { CycleCountModule } from './modules/cycleCount.js';
import { PurchaseModule } from './modules/purchase.js';
import { InventoryModule } from './modules/inventory.js';
import { ActivityModule } from './modules/activity.js';

class AppManager {
  constructor() {
    this.state = new MotracState();
    this.currentModule = null;
    this.currentScreen = 'loginScreen';
    this.theme = 'auto'; // auto, light, dark

    this.init();
  }

  async init() {
    this.state.loadFromStorage();
    this.state.generateMockData();
    this.loadTheme();
    this.bindEvents();
    this.showScreen('loginScreen');
  }

  bindEvents() {
    // Navigation
    document.getElementById('backBtn').addEventListener('click', () => this.goBack());
    document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
    document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

    // Login
    document.getElementById('loginForm').addEventListener('submit', (e) => { e.preventDefault(); this.handleLogin(); });

    // Menu items
    document.querySelectorAll('.list-item[data-module]').forEach(item => {
      item.addEventListener('click', () => this.loadModule(item.dataset.module));
    });

    // Modal
    document.getElementById('modalCancel').addEventListener('click', () => this.hideModal());
    document.getElementById('modalOverlay').addEventListener('click', (e) => { if (e.target === e.currentTarget) this.hideModal(); });
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('motracTheme') || 'auto';
    this.setTheme(savedTheme);
  }

  setTheme(theme) {
    this.theme = theme;
    localStorage.setItem('motracTheme', theme);

    const root = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');

    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      themeToggle.textContent = '☀️';
      themeToggle.title = 'Schakel naar donkere modus';
    } else if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '🌙';
      themeToggle.title = 'Schakel naar automatische modus';
    } else {
      root.removeAttribute('data-theme');
      themeToggle.textContent = '🌗';
      themeToggle.title = 'Schakel naar lichte modus';
    }

    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => { document.body.style.transition = ''; }, 300);
  }

  toggleTheme() {
    const themes = ['auto', 'light', 'dark'];
    const currentIndex = themes.indexOf(this.theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex]);

    const t = document.getElementById('themeToggle');
    t.style.transform = 'scale(0.9)';
    setTimeout(() => { t.style.transform = ''; }, 100);
  }

  async loadModule(moduleName) {
    try {
      const ModuleClass = this.getModuleClass(moduleName);
      this.currentModule = new ModuleClass(this);
      this.state.currentModule = moduleName;

      this.setNavigation(this.currentModule.getTitle(), true, true);
      this.showScreen('moduleScreen');

      await this.currentModule.render();
      this.currentModule.onActivate();
    } catch (error) {
      console.error('Error loading module:', error);
      this.showModal('Fout', 'Module kon niet geladen worden.');
      this.goBack();
    }
  }

  getModuleClass(moduleName) {
    const modules = {
      placement: PlacementModule,
      picking: PickingModule,
      transport: TransportModule,
      cycleCount: CycleCountModule,
      purchase: PurchaseModule,
      inventory: InventoryModule,
      activity: ActivityModule,
    };
    return modules[moduleName] || BaseModule;
  }

  handleLogin() {
    const userInput = document.getElementById('userInput').value.trim();
    if (!userInput) { this.showModal('Fout', 'Voer je badge in.'); return; }

    this.state.user = {
      id: userInput, name: `Gebruiker ${userInput}`, avatar: userInput.charAt(0).toUpperCase()
    };

    this.updateUserDisplay();
    this.setNavigation('Hoofdmenu', false, true);
    this.showScreen('mainMenu');
  }

  logout() {
    this.state.user = null;
    this.currentModule = null;
    this.setNavigation('Motrac Scanner', false, false);
    this.showScreen('loginScreen');
    document.getElementById('userInput').value = '';
  }

  goBack() {
    if (this.currentModule) {
      this.currentModule.onDeactivate();
      this.currentModule = null;
    }
    this.setNavigation('Hoofdmenu', false, true);
    this.showScreen('mainMenu');
  }

  updateUserDisplay() {
    if (this.state.user) {
      document.getElementById('userAvatar').textContent = this.state.user.avatar;
      document.getElementById('userName').textContent = this.state.user.name;
    }
  }

  setNavigation(title, showBack = false, showLogout = false) {
    document.getElementById('navTitle').textContent = title;
    document.getElementById('backBtn').style.visibility = showBack ? 'visible' : 'hidden';
    document.getElementById('logoutBtn').style.visibility = showLogout ? 'visible' : 'hidden';
  }

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
    this.currentScreen = screenId;
  }

  showModal(title, content, onConfirm = null) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalContent').textContent = content;
    document.getElementById('modalOverlay').classList.remove('hidden');

    const confirmBtn = document.getElementById('modalConfirm');
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    if (onConfirm) {
      newConfirmBtn.addEventListener('click', () => { this.hideModal(); onConfirm(); });
    } else {
      newConfirmBtn.addEventListener('click', () => this.hideModal());
    }
  }

  hideModal() { document.getElementById('modalOverlay').classList.add('hidden'); }
}

window.addEventListener('DOMContentLoaded', () => { window.motracApp = new AppManager(); });
