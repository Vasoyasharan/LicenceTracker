(function () {
  // ---------- State ----------
  let licenses = [];
  let currentSection = 'All';
  let customTypes = [];
  let formspreeEndpoint = '';
  let searchQuery = '';
  let statusFilter = 'all';
  let sortMode = 'expiry-asc';

  const DEFAULT_TYPES = [
    'AutoCAD', 'Antivirus', 'Email', 'Office Apps',
    'Server OS', 'Win 11 Pro', 'Other'
  ];

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);
  const tabsContainer = $('tabsContainer');
  const licenseGrid = $('licenseGrid');
  const modal = $('licenseModal');
  const modalTitle = $('modalTitle');
  const licenseForm = $('licenseForm');
  const licenseIdField = $('licenseId');
  const vendorInput = $('vendorName');
  const licenseNameInput = $('licenseName');
  const licenseTypeSelect = $('licenseType');
  const licenseDurationSelect = $('licenseDuration');
  const raiseDateInput = $('raiseDate');
  const startDateInput = $('startDate');
  const expireDateInput = $('expireDate');
  const expiryHint = $('expiryHint');
  const notesInput = $('notes');
  const licenseKeyInput = $('licenseKey');
  const assignedToInput = $('assignedTo');
  const licenseQtyInput = $('licenseQty');
  const fileUrlInput = $('fileUrl');
  const addLicenseBtn = $('addLicenseBtn');
  const closeModalBtn = $('closeModalBtn');
  const cancelModalBtn = $('cancelModalBtn');
  const themeToggle = $('themeToggle');
  const settingsBtn = $('settingsBtn');
  const settingsModal = $('settingsModal');
  const closeSettingsBtn = $('closeSettingsBtn');
  const cancelSettingsBtn = $('cancelSettingsBtn');
  const saveSettingsBtn = $('saveSettingsBtn');
  const formspreeInput = $('formspreeEndpoint');
  const toast = $('toast');
  const toastMessage = $('toastMessage');
  const searchInput = $('searchInput');
  const searchClear = $('searchClear');
  const statusFilterSelect = $('statusFilter');
  const sortSelect = $('sortSelect');
  const notifBtn = $('notifBtn');
  const notifCount = $('notifCount');
  const notifPanel = $('notifPanel');
  const notifList = $('notifList');
  const dataMenuBtn = $('dataMenuBtn');
  const dataPanel = $('dataPanel');
  const exportJsonBtn = $('exportJsonBtn');
  const importJsonBtn = $('importJsonBtn');
  const exportCsvBtn = $('exportCsvBtn');
  const importCsvBtn = $('importCsvBtn');
  const printBtn = $('printBtn');
  const jsonFileInput = $('jsonFileInput');
  const csvFileInput = $('csvFileInput');

  // ---------- Storage ----------
  function loadData() {
    const stored = localStorage.getItem('licenseTracker');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        licenses = parsed.licenses || [];
        customTypes = parsed.customTypes || [];
        formspreeEndpoint = parsed.formspreeEndpoint || '';
      } catch (e) { console.warn('Failed to parse stored data', e); }
    }
  }
  function saveData() {
    localStorage.setItem('licenseTracker', JSON.stringify({ licenses, customTypes, formspreeEndpoint }));
  }

  // ---------- Helpers ----------
  function getAllTypes() { return Array.from(new Set([...DEFAULT_TYPES, ...customTypes])); }
  function daysUntil(dateStr) {
    const today = new Date(); today.setHours(0,0,0,0);
    const target = new Date(dateStr); target.setHours(0,0,0,0);
    return Math.ceil((target - today) / 86400000);
  }
  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
  }
  function addMonths(dateStr, months) {
    const d = new Date(dateStr); const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    if (d.getDate() < day) d.setDate(0);
    return d.toISOString().slice(0,10);
  }
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div'); div.textContent = text; return div.innerHTML;
  }
  function getTierClass(lic) {
    if (lic.duration === 'lifetime') return 'tier-life';
    const d = daysUntil(lic.expireDate);
    if (d < 0) return 'tier-red';
    if (d <= 5) return 'tier-red';
    if (d <= 20) return 'tier-orange';
    if (d <= 60) return 'tier-yellow';
    return 'tier-green';
  }
  function getTierLabel(lic) {
    if (lic.duration === 'lifetime') return 'lifetime';
    const d = daysUntil(lic.expireDate);
    if (d < 0) return 'expired';
    if (d <= 20) return 'expiring';
    return 'active';
  }

  // ---------- Auto-calc expiry ----------
  function recalcExpiry() {
    const duration = licenseDurationSelect.value;
    const start = startDateInput.value;
    if (duration === 'lifetime') {
      expireDateInput.value = ''; expireDateInput.disabled = true; expireDateInput.required = false;
      expiryHint.textContent = 'Lifetime license — no expiry date needed';
      expiryHint.style.color = '#16a34a';
      return;
    }
    if (duration === 'custom') {
      expireDateInput.disabled = false; expireDateInput.required = true;
      expiryHint.textContent = 'Enter expiry date manually';
      expiryHint.style.color = '';
      return;
    }
    expireDateInput.disabled = true; expireDateInput.required = false;
    expiryHint.textContent = 'Auto-calculated from start date + duration';
    expiryHint.style.color = '';
    expireDateInput.value = start ? addMonths(start, parseInt(duration, 10)) : '';
  }

  // ---------- Tabs ----------
  function renderTabs() {
    const types = getAllTypes();
    let html = `<div class="type-tab ${currentSection === 'All' ? 'active' : ''}" data-section="All">
      <i class="fas fa-layer-group"></i> All
    </div>`;
    types.forEach(type => {
      html += `<div class="type-tab ${currentSection === type ? 'active' : ''}" data-section="${escapeHtml(type)}">
        <i class="fas fa-tag"></i> ${escapeHtml(type)}
      </div>`;
    });
    html += `<button class="add-type-btn" id="addTypeBtn"><i class="fas fa-plus"></i> New type</button>`;
    tabsContainer.innerHTML = html;

    document.querySelectorAll('.type-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        currentSection = tab.dataset.section;
        renderTabs();
        renderLicenses();
      });
    });
    $('addTypeBtn')?.addEventListener('click', () => {
      const newType = prompt('Enter new license type name:');
      if (newType && newType.trim()) {
        const trimmed = newType.trim();
        if (!getAllTypes().includes(trimmed)) {
          customTypes.push(trimmed); saveData();
          currentSection = trimmed;
          renderTabs(); renderLicenses();
          showToast(`Type "${trimmed}" added`);
        } else { alert('Type already exists'); }
      }
    });
  }

  // ---------- Stats ----------
  function updateStats() {
    const total = licenses.length;
    let soon = 0, expired = 0, lifetime = 0;
    licenses.forEach(lic => {
      if (lic.duration === 'lifetime') { lifetime++; return; }
      const d = daysUntil(lic.expireDate);
      if (d < 0) expired++;
      else if (d <= 20) soon++;
    });
    animateNumber($('statTotal'), total);
    animateNumber($('statSoon'), soon);
    animateNumber($('statExpired'), expired);
    animateNumber($('statLifetime'), lifetime);
  }
  function animateNumber(el, target) {
    if (!el) return;
    const current = parseInt(el.textContent) || 0;
    if (current === target) return;
    const start = performance.now();
    const duration = 400;
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(current + (target - current) * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ---------- Notifications ----------
  function updateNotifications() {
    const upcoming = licenses
      .filter(l => l.duration !== 'lifetime')
      .map(l => ({ lic: l, days: daysUntil(l.expireDate) }))
      .filter(x => x.days <= 20)
      .sort((a, b) => a.days - b.days);

    if (upcoming.length === 0) {
      notifCount.hidden = true;
      notifList.innerHTML = `<div class="notif-empty">All clear — no upcoming expiries.</div>`;
      return;
    }
    notifCount.hidden = false;
    notifCount.textContent = upcoming.length;

    notifList.innerHTML = upcoming.map(({ lic, days }) => {
      const dotClass = days < 0 || days <= 5 ? 'red' : 'orange';
      const label = days < 0 ? `Expired ${Math.abs(days)}d ago` : `${days}d left`;
      return `<div class="notif-item" data-id="${lic.id}">
        <span class="dot ${dotClass}"></span>
        <div class="notif-item-info">
          <span class="notif-item-title">${escapeHtml(lic.name)}</span>
          <span class="notif-item-meta">${escapeHtml(lic.vendor)} · ${label}</span>
        </div>
      </div>`;
    }).join('');

    notifList.querySelectorAll('.notif-item').forEach(el => {
      el.addEventListener('click', () => {
        notifPanel.classList.remove('open');
        const id = el.dataset.id;
        const card = document.querySelector(`.license-card[data-id="${id}"]`);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.style.transition = 'box-shadow 0.4s';
          card.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.4)';
          setTimeout(() => { card.style.boxShadow = ''; }, 1600);
        }
      });
    });
  }

  // ---------- Filtering & sorting ----------
  function applyFilters(list) {
    let out = list;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      out = out.filter(l =>
        (l.vendor || '').toLowerCase().includes(q) ||
        (l.name || '').toLowerCase().includes(q) ||
        (l.licenseKey || '').toLowerCase().includes(q) ||
        (l.assignedTo || '').toLowerCase().includes(q) ||
        (l.type || '').toLowerCase().includes(q) ||
        (l.notes || '').toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      out = out.filter(l => {
        const tier = getTierLabel(l);
        if (statusFilter === 'expiring') return tier === 'expiring';
        if (statusFilter === 'expired') return tier === 'expired';
        if (statusFilter === 'active') return tier === 'active';
        if (statusFilter === 'lifetime') return tier === 'lifetime';
        return true;
      });
    }
    return out;
  }

  function applySort(list) {
    const arr = [...list];
    switch (sortMode) {
      case 'expiry-asc':
        return arr.sort((a, b) => {
          if (a.duration === 'lifetime' && b.duration !== 'lifetime') return 1;
          if (a.duration !== 'lifetime' && b.duration === 'lifetime') return -1;
          if (a.duration === 'lifetime' && b.duration === 'lifetime') return 0;
          return new Date(a.expireDate) - new Date(b.expireDate);
        });
      case 'expiry-desc':
        return arr.sort((a, b) => {
          if (a.duration === 'lifetime' && b.duration !== 'lifetime') return 1;
          if (a.duration !== 'lifetime' && b.duration === 'lifetime') return -1;
          if (a.duration === 'lifetime' && b.duration === 'lifetime') return 0;
          return new Date(b.expireDate) - new Date(a.expireDate);
        });
      case 'vendor-asc':  return arr.sort((a, b) => (a.vendor || '').localeCompare(b.vendor || ''));
      case 'vendor-desc': return arr.sort((a, b) => (b.vendor || '').localeCompare(a.vendor || ''));
      case 'name-asc':    return arr.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'recent':      return arr.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
      default:            return arr;
    }
  }

  // ---------- Render cards ----------
  function renderLicenses() {
    let filtered = licenses;
    if (currentSection !== 'All') filtered = licenses.filter(l => l.type === currentSection);
    filtered = applyFilters(filtered);
    filtered = applySort(filtered);

    if (filtered.length === 0) {
      licenseGrid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-folder-open"></i>
          <h3>No licenses match</h3>
          <p>Try changing filters or add a new license.</p>
        </div>`;
      updateStats();
      updateNotifications();
      return;
    }

    let html = '';
    filtered.forEach(lic => {
      const isLifetime = lic.duration === 'lifetime';
      const daysLeft = isLifetime ? null : daysUntil(lic.expireDate);
      const tierClass = getTierClass(lic);

      let badgeHtml = '';
      if (isLifetime) {
        badgeHtml = `<div class="lifetime-badge"><i class="fas fa-infinity"></i> Lifetime</div>`;
      } else if (daysLeft !== null) {
        const isAlert = daysLeft <= 20;
        const isExpired = daysLeft < 0;
        const cls = (isExpired || isAlert) ? 'alert-badge' : 'lifetime-badge';
        const label = daysLeft >= 0 ? `${daysLeft} days left` : 'Expired';
        badgeHtml = `<div class="${cls}">${label}</div>`;
      }

      const qty = lic.qty && lic.qty > 1
        ? `<span class="qty-badge"><i class="fas fa-boxes-stacked"></i> × ${lic.qty}</span>` : '';
      const attach = lic.fileUrl
        ? `<a class="attach-chip" href="${escapeHtml(lic.fileUrl)}" target="_blank" rel="noopener"><i class="fas fa-paperclip"></i> File</a>` : '';

      html += `
        <div class="license-card ${tierClass}" data-id="${lic.id}">
          <div class="card-header">
            <div>
              <div class="vendor-name">${escapeHtml(lic.vendor)}</div>
              <div class="license-name">${escapeHtml(lic.name)} ${qty}</div>
            </div>
            ${badgeHtml}
          </div>
          <div class="meta-row">
            <div class="meta-item"><i class="fas fa-tag"></i> ${escapeHtml(lic.type)}</div>
            <div class="meta-item"><i class="fas fa-calendar-plus"></i> Raised: ${formatDate(lic.raiseDate)}</div>
            <div class="meta-item"><i class="fas fa-play-circle"></i> Start: ${formatDate(lic.startDate)}</div>
            <div class="meta-item"><i class="fas fa-calendar-times"></i> Expire: ${isLifetime ? 'Never' : formatDate(lic.expireDate)}</div>
            ${lic.licenseKey ? `<div class="meta-item key-item"><i class="fas fa-key"></i> <code>${escapeHtml(lic.licenseKey)}</code></div>` : ''}
            ${lic.assignedTo ? `<div class="meta-item"><i class="fas fa-user"></i> ${escapeHtml(lic.assignedTo)}</div>` : ''}
            ${lic.notes ? `<div class="meta-item"><i class="fas fa-pencil-alt"></i> ${escapeHtml(lic.notes)}</div>` : ''}
            ${attach ? `<div class="meta-item">${attach}</div>` : ''}
          </div>
          <div class="card-actions">
            <button class="icon-btn edit-btn" data-id="${lic.id}" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="icon-btn delete delete-btn" data-id="${lic.id}" title="Delete"><i class="fas fa-trash-alt"></i></button>
          </div>
        </div>`;
    });

    licenseGrid.innerHTML = html;

    document.querySelectorAll('.edit-btn').forEach(btn =>
      btn.addEventListener('click', () => openEditModal(btn.dataset.id)));
    document.querySelectorAll('.delete-btn').forEach(btn =>
      btn.addEventListener('click', () => {
        if (confirm('Delete this license?')) {
          licenses = licenses.filter(l => l.id !== btn.dataset.id);
          saveData(); renderLicenses(); showToast('License deleted');
        }
      }));

    updateStats();
    updateNotifications();
  }

  // ---------- Modals ----------
  function openAddModal() {
    modalTitle.textContent = 'Add License';
    licenseForm.reset();
    licenseIdField.value = '';
    licenseTypeSelect.value = currentSection !== 'All' ? currentSection : (getAllTypes()[0] || 'Other');
    const today = new Date().toISOString().slice(0,10);
    raiseDateInput.value = today;
    startDateInput.value = today;
    licenseDurationSelect.value = '12';
    licenseKeyInput.value = '';
    assignedToInput.value = '';
    notesInput.value = '';
    fileUrlInput.value = '';
    licenseQtyInput.value = 1;
    recalcExpiry();
    modal.classList.add('open');
  }

  function openEditModal(id) {
    const lic = licenses.find(l => l.id === id);
    if (!lic) return;
    modalTitle.textContent = 'Edit License';
    licenseIdField.value = lic.id;
    vendorInput.value = lic.vendor;
    licenseNameInput.value = lic.name;
    licenseTypeSelect.value = lic.type;
    raiseDateInput.value = lic.raiseDate;
    startDateInput.value = lic.startDate;
    notesInput.value = lic.notes || '';
    licenseKeyInput.value = lic.licenseKey || '';
    assignedToInput.value = lic.assignedTo || '';
    licenseQtyInput.value = lic.qty || 1;
    fileUrlInput.value = lic.fileUrl || '';
    licenseDurationSelect.value = ['lifetime','custom'].includes(lic.duration) ? lic.duration : (lic.duration || '12');
    expireDateInput.value = lic.duration === 'lifetime' ? '' : lic.expireDate;
    recalcExpiry();
    if (lic.duration === 'custom') {
      expireDateInput.value = lic.expireDate;
      expireDateInput.disabled = false;
    }
    modal.classList.add('open');
  }
  function closeModal() { modal.classList.remove('open'); }

  function populateTypeSelect() {
    licenseTypeSelect.innerHTML = getAllTypes()
      .map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
  }

  // ---------- Save form ----------
  function handleFormSubmit(e) {
    e.preventDefault();
    const id = licenseIdField.value;
    const vendor = vendorInput.value.trim();
    const name = licenseNameInput.value.trim();
    const type = licenseTypeSelect.value;
    const duration = licenseDurationSelect.value;
    const raiseDate = raiseDateInput.value;
    const startDate = startDateInput.value;
    const notes = notesInput.value.trim();
    const licenseKey = licenseKeyInput.value.trim();
    const assignedTo = assignedToInput.value.trim();
    const qty = Math.max(1, parseInt(licenseQtyInput.value, 10) || 1);
    const fileUrl = fileUrlInput.value.trim();
    let expireDate = expireDateInput.value;

    if (!vendor || !name || !type || !raiseDate || !startDate) {
      alert('Please fill all required fields'); return;
    }
    if (duration !== 'lifetime' && !expireDate) {
      alert('Please provide an expiry date or choose lifetime.'); return;
    }

    const licenseData = {
      id: id || Date.now().toString(36) + Math.random().toString(36).substr(2),
      vendor, name, type, duration, raiseDate, startDate,
      expireDate: duration === 'lifetime' ? '' : expireDate,
      notes, licenseKey, assignedTo, qty, fileUrl
    };

    if (id) {
      const index = licenses.findIndex(l => l.id === id);
      if (index !== -1) licenses[index] = licenseData;
    } else { licenses.push(licenseData); }

    saveData();
    closeModal();
    renderLicenses();
    renderTabs();
    showToast(id ? 'License updated' : 'License added');
    checkAndSendAlerts();
  }

  // ---------- Email alerts ----------
  function checkAndSendAlerts() {
    if (!formspreeEndpoint) return;
    const today = new Date(); today.setHours(0,0,0,0);
    const thresholds = [20, 15, 10, 5];
    licenses.forEach(lic => {
      if (lic.duration === 'lifetime') return;
      const expireDate = new Date(lic.expireDate); expireDate.setHours(0,0,0,0);
      const diffDays = Math.ceil((expireDate - today) / 86400000);
      if (thresholds.includes(diffDays) && diffDays >= 0) {
        const key = `alert_${lic.id}_${diffDays}_${today.toISOString().slice(0,10)}`;
        if (localStorage.getItem(key)) return;
        const payload = {
          subject: `License expiry alert: ${lic.name} (${diffDays} days left)`,
          message: `License: ${lic.name}\nVendor: ${lic.vendor}\nType: ${lic.type}\nQty: ${lic.qty || 1}\nKey: ${lic.licenseKey || 'N/A'}\nAssigned to: ${lic.assignedTo || 'N/A'}\nExpiry: ${formatDate(lic.expireDate)}\nDays remaining: ${diffDays}`,
          license_name: lic.name, vendor: lic.vendor, license_type: lic.type,
          license_qty: lic.qty || 1, license_key: lic.licenseKey || '',
          assigned_to: lic.assignedTo || '', expiry_date: lic.expireDate, days_left: diffDays
        };
        fetch(formspreeEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        }).then(r => { if (r.ok) localStorage.setItem(key, 'true'); })
          .catch(err => console.warn('Formspree error', err));
      }
    });
  }

  // ---------- Settings ----------
  function openSettings() { formspreeInput.value = formspreeEndpoint; settingsModal.classList.add('open'); }
  function closeSettings() { settingsModal.classList.remove('open'); }
  function saveSettings() {
    const url = formspreeInput.value.trim();
    if (url && !url.startsWith('https://')) { alert('Please enter a valid Formspree URL'); return; }
    formspreeEndpoint = url; saveData(); closeSettings();
    showToast('Formspree endpoint saved'); checkAndSendAlerts();
  }

  // ---------- Toast ----------
  let toastTimeout;
  function showToast(msg) {
    toastMessage.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  // ---------- Theme ----------
  function initTheme() {
    if (localStorage.getItem('licenseTrackerTheme') === 'dark') document.body.classList.add('dark');
    updateThemeIcon();
  }
  function toggleTheme() {
    document.body.classList.toggle('dark');
    localStorage.setItem('licenseTrackerTheme', document.body.classList.contains('dark') ? 'dark' : 'light');
    updateThemeIcon();
  }
  function updateThemeIcon() {
    const isDark = document.body.classList.contains('dark');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i> <span>Light</span>' : '<i class="fas fa-moon"></i> <span>Dark</span>';
  }

  // ---------- EXPORT / IMPORT ----------
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  function exportJson() {
    const data = { licenses, customTypes, formspreeEndpoint, exportedAt: new Date().toISOString(), version: 1 };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `licenses-backup-${new Date().toISOString().slice(0,10)}.json`);
    showToast('JSON exported');
    dataPanel.classList.remove('open');
  }

  function importJson(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.licenses || !Array.isArray(parsed.licenses)) throw new Error('Invalid file');
        if (!confirm(`Import ${parsed.licenses.length} licenses? This will ADD to your existing list.`)) return;
        licenses = licenses.concat(parsed.licenses);
        if (parsed.customTypes) {
          parsed.customTypes.forEach(t => { if (!customTypes.includes(t)) customTypes.push(t); });
        }
        saveData(); populateTypeSelect(); renderTabs(); renderLicenses();
        showToast(`Imported ${parsed.licenses.length} licenses`);
      } catch (err) {
        alert('Invalid JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  function csvEscape(val) {
    if (val === null || val === undefined) return '';
    const s = String(val);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  function exportCsv() {
    const headers = ['Vendor','License Name','Type','Duration','Qty','Raise Date','Start Date','Expire Date','License Key','Assigned To','Notes','File URL'];
    const rows = licenses.map(l => [
      l.vendor, l.name, l.type, l.duration, l.qty || 1,
      l.raiseDate, l.startDate, l.expireDate || 'Lifetime',
      l.licenseKey || '', l.assignedTo || '', l.notes || '', l.fileUrl || ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `licenses-${new Date().toISOString().slice(0,10)}.csv`);
    showToast('CSV exported');
    dataPanel.classList.remove('open');
  }

  function parseCsvLine(line) {
    const out = []; let cur = ''; let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQ) {
        if (c === '"' && line[i+1] === '"') { cur += '"'; i++; }
        else if (c === '"') inQ = false;
        else cur += c;
      } else {
        if (c === ',') { out.push(cur); cur = ''; }
        else if (c === '"') inQ = true;
        else cur += c;
      }
    }
    out.push(cur);
    return out;
  }

  function importCsv(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result.replace(/\r\n/g, '\n').trim();
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) throw new Error('CSV must have header + rows');

        const headers = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase());
        const findIdx = (names) => headers.findIndex(h => names.includes(h));

        const idx = {
          vendor: findIdx(['vendor','vendor name']),
          name: findIdx(['license name','name','license']),
          type: findIdx(['type','license type']),
          duration: findIdx(['duration']),
          qty: findIdx(['qty','quantity']),
          raiseDate: findIdx(['raise date','purchase date','raised']),
          startDate: findIdx(['start date','start']),
          expireDate: findIdx(['expire date','expiry','expiry date','expire']),
          licenseKey: findIdx(['license key','key','serial']),
          assignedTo: findIdx(['assigned to','assignee','user']),
          notes: findIdx(['notes','note']),
          fileUrl: findIdx(['file url','file','url'])
        };

        if (idx.vendor < 0 || idx.name < 0) throw new Error('CSV must have vendor and license name columns');

        const imported = [];
        for (let i = 1; i < lines.length; i++) {
          const cells = parseCsvLine(lines[i]);
          const get = (k) => idx[k] >= 0 ? (cells[idx[k]] || '').trim() : '';
          const vendor = get('vendor');
          const name = get('name');
          if (!vendor || !name) continue;

          const type = get('type') || 'Other';
          if (!getAllTypes().includes(type) && !customTypes.includes(type)) customTypes.push(type);

          const duration = get('duration') || '12';
          imported.push({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            vendor, name, type, duration,
            qty: parseInt(get('qty'), 10) || 1,
            raiseDate: get('raiseDate') || new Date().toISOString().slice(0,10),
            startDate: get('startDate') || new Date().toISOString().slice(0,10),
            expireDate: get('expireDate') || '',
            licenseKey: get('licenseKey'),
            assignedTo: get('assignedTo'),
            notes: get('notes'),
            fileUrl: get('fileUrl')
          });
        }
        if (imported.length === 0) throw new Error('No valid rows found');
        if (!confirm(`Import ${imported.length} licenses from CSV?`)) return;
        licenses = licenses.concat(imported);
        saveData(); populateTypeSelect(); renderTabs(); renderLicenses();
        showToast(`Imported ${imported.length} licenses from CSV`);
      } catch (err) {
        alert('CSV import failed: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  // ---------- Init ----------
  function init() {
    loadData();
    initTheme();
    populateTypeSelect();
    renderTabs();
    renderLicenses();
    if (formspreeEndpoint) formspreeInput.value = formspreeEndpoint;

    addLicenseBtn.addEventListener('click', openAddModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    licenseForm.addEventListener('submit', handleFormSubmit);
    licenseDurationSelect.addEventListener('change', recalcExpiry);
    startDateInput.addEventListener('change', recalcExpiry);
    themeToggle.addEventListener('click', toggleTheme);
    settingsBtn.addEventListener('click', openSettings);
    closeSettingsBtn.addEventListener('click', closeSettings);
    cancelSettingsBtn.addEventListener('click', closeSettings);
    saveSettingsBtn.addEventListener('click', saveSettings);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeSettings(); });

    // Search & filters
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.trim();
      searchClear.hidden = !searchQuery;
      renderLicenses();
    });
    searchClear.addEventListener('click', () => {
      searchInput.value = ''; searchQuery = ''; searchClear.hidden = true; renderLicenses();
    });
    statusFilterSelect.addEventListener('change', () => {
      statusFilter = statusFilterSelect.value; renderLicenses();
    });
    sortSelect.addEventListener('change', () => {
      sortMode = sortSelect.value; renderLicenses();
    });

    // Notifications bell
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifPanel.classList.toggle('open');
      dataPanel.classList.remove('open');
    });

    // Data menu
    dataMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dataPanel.classList.toggle('open');
      notifPanel.classList.remove('open');
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.notif-wrapper')) notifPanel.classList.remove('open');
      if (!e.target.closest('.data-menu-wrapper')) dataPanel.classList.remove('open');
    });

    exportJsonBtn.addEventListener('click', exportJson);
    exportCsvBtn.addEventListener('click', exportCsv);
    printBtn.addEventListener('click', () => { dataPanel.classList.remove('open'); setTimeout(() => window.print(), 100); });

    importJsonBtn.addEventListener('click', () => { jsonFileInput.click(); dataPanel.classList.remove('open'); });
    importCsvBtn.addEventListener('click', () => { csvFileInput.click(); dataPanel.classList.remove('open'); });
    jsonFileInput.addEventListener('change', () => {
      if (jsonFileInput.files[0]) importJson(jsonFileInput.files[0]);
      jsonFileInput.value = '';
    });
    csvFileInput.addEventListener('change', () => {
      if (csvFileInput.files[0]) importCsv(csvFileInput.files[0]);
      csvFileInput.value = '';
    });

    setInterval(checkAndSendAlerts, 3600000);
    setTimeout(checkAndSendAlerts, 2000);
  }

  init();
})();