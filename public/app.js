// ============================================================
// APP.JS — VIT ResolveAI Frontend
// ============================================================

// ---- DOM References ----
const $ = id => document.getElementById(id);
const DOM = {
  authPage: $('authPage'),
  app: $('app'),

  // Auth tabs
  tabStudent: $('tabStudent'),
  tabFaculty: $('tabFaculty'),
  tabAdmin: $('tabAdmin'),

  // Mode switcher
  modeLogin: $('modeLogin'),
  modeSignup: $('modeSignup'),

  // Login form
  loginForm: $('loginForm'),
  loginEmail: $('loginEmail'),
  loginPassword: $('loginPassword'),
  btnLogin: $('btnLogin'),
  authError: $('authError'),

  // Signup form
  signupForm: $('signupForm'),
  signupName: $('signupName'),
  signupEmail: $('signupEmail'),
  signupPassword: $('signupPassword'),
  signupConfirm: $('signupConfirm'),
  btnSignup: $('btnSignup'),
  signupError: $('signupError'),
  signupSuccess: $('signupSuccess'),
  strengthFill: $('strengthFill'),
  strengthLabel: $('strengthLabel'),
  passwordStrength: $('passwordStrength'),

  // Misc auth
  forgotPasswordLink: $('forgotPasswordLink'),
  resetToast: $('resetToast'),
  emailDomainHint: $('emailDomainHint'),

  // App
  roleBadge: $('roleBadge'),
  userEmailDisplay: $('userEmailDisplay'),
  btnLogout: $('btnLogout'),

  // Portals
  studentPortal: $('studentPortal'),
  adminPortal: $('adminPortal'),

  // Student form
  issueForm: $('issueForm'),
  issueBuilding: $('issueBuilding'),
  issueCategory: $('issueCategory'),
  issueRoom: $('issueRoom'),
  genderGroup: $('genderGroup'),
  issueGender: $('issueGender'),
  issueDescription: $('issueDescription'),
  issueImage: $('issueImage'),
  fileUploadText: $('fileUploadText'),
  btnSubmitIssue: $('btnSubmitIssue'),
  triageResult: $('triageResult'),
  triageDept: $('triageDept'),
  triagePriority: $('triagePriority'),

  // Admin dashboard
  btnRefreshAdmin: $('btnRefreshAdmin'),
  adminTableBody: $('adminTableBody'),
  metricPending: $('metricPending'),
  metricResolved: $('metricResolved'),
  metricHigh: $('metricHigh'),
};

// ---- State ----
let authState = { isAuthenticated: false, role: 'student', token: null, email: null, department: null };

// Build filtered issues URL based on current admin's department
function getIssuesUrl() {
  const dept = authState.department;
  if (!dept || dept === 'ALL') return '/api/issues';
  return `/api/issues?department=${encodeURIComponent(dept)}`;
}

// ---- Restore session from sessionStorage ----
const savedAuth = sessionStorage.getItem('resolveAuth');
if (savedAuth) {
  try {
    const p = JSON.parse(savedAuth);
    if (p.isAuthenticated && p.token) { authState = p; }
  } catch (e) { }
}

if (authState.isAuthenticated) {
  showApp();
} else {
  DOM.authPage.classList.remove('hidden');
}

// ============================================================
// AUTH TABS
// ============================================================
const roleTabs = document.querySelectorAll('.role-tab');
roleTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    roleTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    authState.role = tab.dataset.role;

    // Toggle Department Dropdown
    const deptGroupSignup = document.getElementById('signupDepartmentGroup');
    const deptGroupLogin = document.getElementById('loginDepartmentGroup');
    if (deptGroupSignup) {
      if (authState.role === 'admin') {
        deptGroupSignup.classList.remove('hidden');
      } else {
        deptGroupSignup.classList.add('hidden');
      }
    }
    if (deptGroupLogin) {
      if (authState.role === 'admin') {
        deptGroupLogin.classList.remove('hidden');
      } else {
        deptGroupLogin.classList.add('hidden');
      }
    }

    // Update email placeholder hint
    const hints = { student: 'your@vitstudent.ac.in', faculty: 'your@vit.ac.in', admin: 'admin@vit.ac.in' };
    DOM.loginEmail.placeholder = hints[authState.role] || 'your@vit.ac.in';
    DOM.signupEmail.placeholder = hints[authState.role] || 'your@vit.ac.in';
    DOM.emailDomainHint.textContent = authState.role === 'student'
      ? 'Use your @vitstudent.ac.in email.'
      : 'Use your @vit.ac.in email.';
  });
});

window.switchInnerTab = function (portalId, targetId, btnElem) {
  const portal = document.getElementById(portalId);
  if (!portal) return;

  // Hide all sections in this portal
  portal.querySelectorAll('.inner-section').forEach(sec => sec.classList.add('hidden'));

  // Show target
  const target = document.getElementById(targetId);
  if (target) target.classList.remove('hidden');

  // Handle active class
  // 1) Clear .inner-tab inside the specific portal
  portal.querySelectorAll('.inner-tab').forEach(tab => tab.classList.remove('active'));
  // 2) If an admin tab was clicked, clear all admin nav-tabs
  if (btnElem && (btnElem.classList.contains('nav-tab') || portalId === 'adminPortal')) {
    document.querySelectorAll('.admin-nav .nav-tab').forEach(tab => tab.classList.remove('active'));
  }

  // 3) Apply active to the clicked button
  if (btnElem) {
    btnElem.classList.add('active');
  } else {
    // Fallback if no btnElem is passed
    const btn = portal.querySelector(`button[onclick*="${targetId}"]`) || document.querySelector(`button[onclick*="${targetId}"]`);
    if (btn) btn.classList.add('active');
  }

  if (targetId === 'studentNotifications') {
    loadStudentNotifications();
  }
};

// ============================================================
// AUTH MODE SWITCHER (Login / Signup)
// ============================================================
DOM.modeLogin.addEventListener('click', () => {
  DOM.modeLogin.classList.add('active');
  DOM.modeSignup.classList.remove('active');
  DOM.loginForm.classList.remove('hidden');
  DOM.signupForm.classList.add('hidden');
  DOM.authError.classList.add('hidden');
});

DOM.modeSignup.addEventListener('click', () => {
  DOM.modeSignup.classList.add('active');
  DOM.modeLogin.classList.remove('active');
  DOM.signupForm.classList.remove('hidden');
  DOM.loginForm.classList.add('hidden');
  DOM.signupError.classList.add('hidden');
  DOM.signupSuccess.classList.add('hidden');
});

// ============================================================
// PASSWORD VISIBILITY TOGGLE
// ============================================================
const eyeSvg = `<svg class="eye-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const eyeOffSvg = `<svg class="eye-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

document.querySelectorAll('.toggle-password').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    if (target.type === 'password') {
      target.type = 'text';
      btn.innerHTML = eyeOffSvg;
    } else {
      target.type = 'password';
      btn.innerHTML = eyeSvg;
    }
  });
});

// ============================================================
// PASSWORD STRENGTH METER
// ============================================================
DOM.signupPassword.addEventListener('input', () => {
  const val = DOM.signupPassword.value;
  DOM.passwordStrength.style.display = val ? 'block' : 'none';

  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const levels = [
    { label: 'Weak', color: '#ef4444', width: '25%' },
    { label: 'Fair', color: '#f59e0b', width: '50%' },
    { label: 'Good', color: '#3b82f6', width: '75%' },
    { label: 'Strong', color: '#10b981', width: '100%' },
  ];
  const l = levels[Math.max(0, score - 1)];
  DOM.strengthFill.style.width = l.width;
  DOM.strengthFill.style.background = l.color;
  DOM.strengthLabel.textContent = l.label;
  DOM.strengthLabel.style.color = l.color;
});

// ============================================================
// FORGOT PASSWORD
// ============================================================
DOM.forgotPasswordLink.addEventListener('click', async (e) => {
  e.preventDefault();
  const email = DOM.loginEmail.value.trim();
  if (!email) {
    showAuthError('Enter your email address first, then click Forgot password.');
    return;
  }
  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    showToast('Password reset link sent! Check your inbox.');
  } catch (e) {
    showAuthError('Failed to send reset link. Please try again.');
  }
});

// ============================================================
// LOGIN
// ============================================================
DOM.loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = DOM.loginEmail.value.trim().toLowerCase();
  const password = DOM.loginPassword.value.trim();
  if (!email || !password) return;

  // Domain Validation for Login
  if (email !== 'avp7708@gmail.com') {
    if (authState.role === 'student' && !email.endsWith('@vitstudent.ac.in')) {
      showAuthError('Students must use an @vitstudent.ac.in email.');
      return;
    }
    if ((authState.role === 'admin' || authState.role === 'faculty') && !email.endsWith('@vit.ac.in')) {
      showAuthError('Staff/Admins must use an @vit.ac.in email.');
      return;
    }
  }

  let selectedLoginDepartment = null;
  if (authState.role === 'admin') {
    const deptEl = document.getElementById('loginDepartment');
    if (deptEl) selectedLoginDepartment = deptEl.value;
    if (!selectedLoginDepartment) {
      showAuthError('Please select your department.');
      return;
    }
  }

  DOM.authError.classList.add('hidden');
  DOM.btnLogin.disabled = true;
  const btnTxt = DOM.btnLogin.querySelector('.btn-text');
  btnTxt.innerHTML = `<div class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></div> Authenticating...`;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success) {
      if (email === 'avp7708@gmail.com') {
        authState.role = 'admin';
      }
      authState.isAuthenticated = true;
      authState.token = data.token;
      authState.email = email;
      authState.department = selectedLoginDepartment || data.department || null;
      sessionStorage.setItem('resolveAuth', JSON.stringify(authState));
      showApp();
    } else {
      showAuthError(data.error || 'Invalid email or password.');
    }
  } catch (err) {
    showAuthError('Connection error. Is the server running?');
  } finally {
    DOM.btnLogin.querySelector('.btn-text').textContent = 'Sign In';
    DOM.btnLogin.disabled = false;
  }
});

// ============================================================
// SIGNUP
// ============================================================
DOM.signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = DOM.signupName.value.trim();
  const email = DOM.signupEmail.value.trim().toLowerCase();
  const password = DOM.signupPassword.value;
  const confirm = DOM.signupConfirm.value;

  DOM.signupError.classList.add('hidden');
  DOM.signupSuccess.classList.add('hidden');

  if (!name) { showSignupError('Full name is required.'); return; }
  if (!email) { showSignupError('Email is required.'); return; }
  if (password.length < 8) { showSignupError('Password must be at least 8 characters.'); return; }
  if (password !== confirm) { showSignupError('Passwords do not match.'); return; }

  // Domain Validation for Signup
  if (email !== 'avp7708@gmail.com') {
    if (authState.role === 'student' && !email.endsWith('@vitstudent.ac.in')) {
      showSignupError('Students must use an @vitstudent.ac.in email.');
      return;
    }
    if ((authState.role === 'admin' || authState.role === 'faculty') && !email.endsWith('@vit.ac.in')) {
      showSignupError('Staff/Admins must use an @vit.ac.in email.');
      return;
    }
  }

  let department = null;
  if (authState.role === 'admin') {
    const deptEl = document.getElementById('signupDepartment');
    if (deptEl) department = deptEl.value;
    if (!department) { showSignupError('Department is required for admins.'); return; }
  }

  DOM.btnSignup.querySelector('.btn-text').textContent = 'Creating account...';
  DOM.btnSignup.disabled = true;

  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, department })
    });
    const data = await res.json();

    if (data.success) {
      DOM.signupSuccess.classList.remove('hidden');
      // Reset form
      DOM.signupForm.reset();
      DOM.passwordStrength.style.display = 'none';
    } else {
      showSignupError(data.error || 'Could not create account. Try a different email.');
    }
  } catch (err) {
    showSignupError('Network error. Please try again.');
  } finally {
    DOM.btnSignup.querySelector('.btn-text').textContent = 'Create Account';
    DOM.btnSignup.disabled = false;
  }
});

// ============================================================
// LOGOUT
// ============================================================
DOM.btnLogout.addEventListener('click', () => {
  sessionStorage.removeItem('resolveAuth');
  window.location.reload();
});

// ============================================================
// HELPERS
// ============================================================
function showAuthError(msg) {
  DOM.authError.textContent = msg;
  DOM.authError.classList.remove('hidden');
}

function showSignupError(msg) {
  DOM.signupError.textContent = msg;
  DOM.signupError.classList.remove('hidden');
}

function showToast(msg) {
  DOM.resetToast.textContent = msg;
  DOM.resetToast.classList.remove('hidden');
  setTimeout(() => DOM.resetToast.classList.add('hidden'), 5000);
}

// ============================================================
// SHOW APP
// ============================================================
function showApp() {
  DOM.authPage.classList.add('hidden');
  DOM.app.classList.remove('hidden');

  DOM.userEmailDisplay.textContent = authState.email;
  const roleLabels = { student: 'Student', faculty: 'Faculty', admin: 'Admin / Staff' };
  DOM.roleBadge.textContent = roleLabels[authState.role] || 'Student';

  if (authState.role === 'admin' || authState.role === 'faculty') {
    DOM.adminPortal.classList.remove('hidden');
    const adminTopNav = document.getElementById('adminTopNav');
    if (adminTopNav) adminTopNav.classList.remove('hidden');
    loadAdminDashboard();
  } else {
    DOM.studentPortal.classList.remove('hidden');
    const studentTopNav = document.getElementById('studentTopNav');
    if (studentTopNav) studentTopNav.classList.remove('hidden');
    loadStudentPortal();
  }

  // Toggle Bot strictly for Head Admin
  const botDiv = document.getElementById('head-admin-bot');
  if (botDiv) {
    if (authState.role === 'admin' && authState.department === 'ALL') {
      botDiv.classList.remove('hidden');
    } else {
      botDiv.classList.add('hidden');
    }
  }
}

// ============================================================
// STUDENT PORTAL
// ============================================================
async function loadStudentPortal() {
  try {
    const res = await fetch('/api/buildings');
    const buildings = await res.json();
    DOM.issueBuilding.innerHTML = '<option value="">Select Building...</option>';
    buildings.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = `${b.name} (${b.type})`;
      DOM.issueBuilding.appendChild(opt);
    });
  } catch (e) { console.error('Failed to load buildings', e); }
}

DOM.issueCategory.addEventListener('change', (e) => {
  DOM.genderGroup.classList.toggle('hidden', e.target.value !== 'Washroom');
});

DOM.issueImage.addEventListener('change', (e) => {
  if (e.target.files && e.target.files.length > 0) {
    DOM.fileUploadText.textContent = e.target.files[0].name;
    DOM.fileUploadText.style.color = '#fff';
  } else {
    DOM.fileUploadText.textContent = 'Click to browse or drag image here';
    DOM.fileUploadText.style.color = '';
  }
});

DOM.issueForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    building_id: DOM.issueBuilding.value,
    category: DOM.issueCategory.value,
    room_number: DOM.issueRoom.value,
    gender: DOM.issueCategory.value === 'Washroom' ? DOM.issueGender.value : null,
    description: DOM.issueDescription.value,
  };

  DOM.btnSubmitIssue.textContent = 'Submitting...';
  DOM.btnSubmitIssue.disabled = true;

  try {
    const res = await fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authState.token}` },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      DOM.issueForm.reset();
      DOM.genderGroup.classList.add('hidden');
      DOM.triageDept.textContent = data.triage.department;
      DOM.triagePriority.textContent = data.triage.priority;
      DOM.triageResult.classList.remove('hidden');
      setTimeout(() => DOM.triageResult.classList.add('hidden'), 8000);
    } else {
      alert('Error: ' + data.error);
    }
  } catch (e) {
    alert('Failed to submit issue.');
  } finally {
    DOM.btnSubmitIssue.textContent = 'Submit Issue';
    DOM.btnSubmitIssue.disabled = false;
  }
});

// ============================================================
// ADMIN PORTAL
// ============================================================
DOM.btnRefreshAdmin.addEventListener('click', loadAdminDashboard);

async function loadAdminDashboard() {
  DOM.adminTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#94a3b8;">Loading issues...</td></tr>';
  try {
    const res = await fetch(getIssuesUrl(), { headers: { 'Authorization': `Bearer ${authState.token}` } });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    let stats = { pending: 0, resolved: 0, high: 0 };
    DOM.adminTableBody.innerHTML = '';

    data.forEach(issue => {
      if (issue.status === 'Pending') stats.pending++;
      if (issue.status === 'Resolved') {
        const today = new Date();
        if (new Date(issue.resolved_at).toDateString() === today.toDateString()) stats.resolved++;
      }
      if (issue.status === 'Pending' && ['High', 'Critical'].includes(issue.ai_priority)) stats.high++;

      const tr = document.createElement('tr');
      const loc = `${issue.buildings?.name || 'Unknown'} — Rm ${issue.room_number || 'N/A'}`;
      let cat = issue.category;
      if (cat === 'Washroom') cat += ` (${issue.gender})`;
      const date = new Date(issue.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const action = issue.status === 'Pending'
        ? `<button class="btn-ghost btn-small" onclick="resolveIssue('${issue.id}')">✓ Resolve</button>`
        : `<span class="status-badge status-Resolved">✓ Resolved</span>`;

      tr.innerHTML = `
        <td><strong>${loc}</strong><br/><small style="color:#94a3b8;">${issue.description.substring(0, 50)}…</small></td>
        <td>${cat}</td>
        <td>${issue.ai_assigned_department}</td>
        <td><span class="priority-badge priority-${issue.ai_priority}">${issue.ai_priority}</span></td>
        <td>${date}</td>
        <td>${action}</td>`;
      DOM.adminTableBody.appendChild(tr);
    });

    if (!data.length) {
      DOM.adminTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#94a3b8;">No issues reported yet.</td></tr>';
    }

    DOM.metricPending.textContent = stats.pending;
    DOM.metricResolved.textContent = stats.resolved;
    DOM.metricHigh.textContent = stats.high;

    // Populate Activity Feed
    const feedScroller = document.getElementById('dashActivityFeed');
    if (feedScroller) {
      feedScroller.innerHTML = '';
      const recentIssues = data.slice(0, 10);
      if (recentIssues.length === 0) feedScroller.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem;">No activity found.</p>';

      recentIssues.forEach(issue => {
        const item = document.createElement('div');
        item.className = 'feed-item';

        let iconClass = 'report';
        let iconHtml = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>';
        let actionStr = 'reported';
        let timeStr = new Date(issue.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (issue.status === 'Resolved') {
          iconClass = 'resolve';
          iconHtml = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3"></path></svg>';
          actionStr = 'resolved';
          timeStr = new Date(issue.resolved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (['High', 'Critical'].includes(issue.ai_priority)) {
          iconClass = 'high';
          iconHtml = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"></path></svg>';
        }

        item.innerHTML = `
          <div class="feed-icon ${iconClass}">
            ${iconHtml}
          </div>
          <div class="feed-content">
             <div class="feed-time">Today, ${timeStr}</div>
             <div>${issue.ai_assigned_department || 'System'} ${actionStr} ${issue.category} Issue (${issue.buildings?.name || 'Unknown'})</div>
          </div>
        `;
        feedScroller.appendChild(item);
      });
    }

  } catch (e) {
    DOM.adminTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#ef4444;padding:2rem;">Failed to load: ${e.message}</td></tr>`;
  }
}

let currentResolveId = null;

window.resolveIssue = function (id) {
  currentResolveId = id;
  document.getElementById('resolveModal').classList.remove('hidden');
};

document.getElementById('btnCancelResolve').addEventListener('click', () => {
  document.getElementById('resolveModal').classList.add('hidden');
  document.getElementById('resolveImage').value = '';
  document.getElementById('resolveUploadText').textContent = 'Upload Resolution Image';
});

document.getElementById('resolveImage').addEventListener('change', (e) => {
  if (e.target.files && e.target.files.length > 0) {
    document.getElementById('resolveUploadText').textContent = e.target.files[0].name;
    document.getElementById('resolveUploadText').style.color = '#fff';
  } else {
    document.getElementById('resolveUploadText').textContent = 'Upload Resolution Image';
    document.getElementById('resolveUploadText').style.color = '';
  }
});

document.getElementById('btnConfirmResolve').addEventListener('click', async () => {
  if (!currentResolveId) return;
  const fileInput = document.getElementById('resolveImage');
  const btn = document.getElementById('btnConfirmResolve');
  btn.textContent = 'Resolving...';
  btn.disabled = true;

  try {
    let imageBase64 = null;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      imageBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    }

    const res = await fetch(`/api/issues/resolve/${currentResolveId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authState.token}` },
      body: JSON.stringify({ imageBase64 })
    });

    if ((await res.json()).success) {
      document.getElementById('resolveModal').classList.add('hidden');
      loadAdminDashboard();
    } else {
      alert('Failed to resolve issue.');
    }
  } catch (e) {
    alert('Failed to resolve issue.');
  } finally {
    btn.textContent = 'Confirm & Resolve';
    btn.disabled = false;
    currentResolveId = null;
    document.getElementById('resolveImage').value = '';
    document.getElementById('resolveUploadText').textContent = 'Upload Resolution Image';
  }
});
window.globalIssuesStore = window.globalIssuesStore || {};

window.viewNotificationDetails = function (issueId) {
  const issue = window.globalIssuesStore[issueId];
  if (!issue) return;

  const loc = `${issue.buildings?.name || 'Unknown'} — Room ${issue.room_number || 'N/A'}`;
  const isResolved = issue.status === 'Resolved';

  let content = `
    <div style="margin-bottom: 1rem;">
      <strong style="color: #fff; font-size: 1.1rem;">${issue.category}</strong>
      <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Reported on: ${new Date(issue.created_at).toLocaleString()}</div>
    </div>
    <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
      <p style="margin:0 0 0.5rem 0;"><strong>Location:</strong> ${loc}</p>
      <p style="margin:0 0 0.5rem 0;"><strong>Status:</strong> <span style="color: ${isResolved ? 'var(--success)' : 'var(--warning)'}; font-weight: bold;">${issue.status}</span></p>
      <p style="margin:0;"><strong>Description:</strong> ${issue.description || 'No description provided.'}</p>
    </div>
  `;

  if (issue.image_url) {
    content += `
      <div style="margin-bottom: 1rem;">
        <p style="margin:0 0 0.5rem 0;"><strong>Reported Image:</strong></p>
        <img src="${issue.image_url}" alt="Reported Error" style="max-width: 100%; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);" />
      </div>
    `;
  }

  if (isResolved) {
    content += `
      <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
        <p style="margin:0 0 0.5rem 0; color: var(--success); font-weight: bold;">Resolution Context</p>
        <p style="margin:0 0 0.5rem 0;"><strong>Resolved On:</strong> ${new Date(issue.resolved_at).toLocaleString()}</p>
        <p style="margin:0;"><strong>Assigned Dept:</strong> ${issue.ai_assigned_department || 'N/A'}</p>
      </div>
    `;
    if (issue.resolved_image_url) {
      content += `
        <div style="margin-bottom: 1rem;">
          <p style="margin:0 0 0.5rem 0;"><strong>Resolution Proof:</strong></p>
          <img src="${issue.resolved_image_url}" alt="Resolution Proof" style="max-width: 100%; border-radius: 8px; border: 1px solid rgba(34, 197, 94, 0.3);" />
        </div>
      `;
    }
  }

  document.getElementById('notifDetailsContent').innerHTML = content;
  document.getElementById('notificationDetailsModal').classList.remove('hidden');
};

document.getElementById('btnCloseNotifDetails')?.addEventListener('click', () => {
  document.getElementById('notificationDetailsModal').classList.add('hidden');
});

window.loadStudentNotifications = async function () {
  const container = document.getElementById('studentNotificationsList');
  container.innerHTML = '<p style="text-align:center;color:#94a3b8;">Loading notifications...</p>';
  try {
    const res = await fetch(getIssuesUrl(), { headers: { 'Authorization': `Bearer ${authState.token}` } });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    container.innerHTML = '';
    let count = 0;

    data.forEach(issue => {
      window.globalIssuesStore[issue.id] = issue;
      const loc = `${issue.buildings?.name || 'Unknown'} — Rm ${issue.room_number || 'N/A'}`;
      let statusColor = issue.status === 'Resolved' ? 'var(--success)' : 'var(--warning)';

      const content = `
         <div>
           <strong style="color:#fff;">${issue.category} in ${loc}</strong>
           <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">${new Date(issue.created_at).toLocaleString()}</div>
         </div>
         <div style="text-align: right;">
             <div style="color: ${statusColor}; font-weight:bold; font-size: 0.9rem; margin-bottom: 4px;">
               ${issue.status}
             </div>
             <small style="color:var(--primary); cursor:pointer;">View Details &rarr;</small>
         </div>
      `;
      const div = document.createElement('div');
      div.className = 'notification-item';
      div.style.cursor = 'pointer';
      div.style.transition = 'all 0.2s ease';
      div.onmouseover = () => div.style.background = 'rgba(255,255,255,0.05)';
      div.onmouseout = () => div.style.background = 'transparent';
      div.onclick = () => window.viewNotificationDetails(issue.id);
      div.innerHTML = content;
      container.appendChild(div);
      count++;
    });

    if (count === 0) {
      container.innerHTML = '<p style="color:var(--text-muted); text-align:center;">No notifications yet.</p>';
    }
  } catch (e) {
    container.innerHTML = '<p style="color:var(--danger); text-align:center;">Failed to load notifications.</p>';
  }
};

window.loadAdminNotifications = async function () {
  const container = document.getElementById('adminNotificationsList');
  if (!container) return;
  container.innerHTML = '<p style="text-align:center;color:#94a3b8;">Loading activity...</p>';
  try {
    const res = await fetch(getIssuesUrl(), { headers: { 'Authorization': `Bearer ${authState.token}` } });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    container.innerHTML = '';
    let count = 0;

    data.slice(0, 15).forEach(issue => {
      window.globalIssuesStore[issue.id] = issue;
      const loc = `${issue.buildings?.name || 'Unknown'} — Rm ${issue.room_number || 'N/A'}`;
      let actionText = issue.status === 'Resolved' ? 'resolved' : 'reported';
      let icon = issue.status === 'Resolved' ? '✅' : '🔔';

      const content = `
         <div>
           <strong style="color:#fff;">${icon} Issue ${actionText}: ${issue.category}</strong>
           <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">${loc} — ${new Date(issue.created_at).toLocaleString()}</div>
         </div>
         <div style="text-align: right;">
           <div style="color: var(--primary); font-weight:600; font-size: 0.8rem; margin-bottom: 4px;">
             ${issue.ai_priority} Priority
           </div>
           <small style="color:var(--primary); cursor:pointer;">View Details &rarr;</small>
         </div>
      `;
      const div = document.createElement('div');
      div.className = 'notification-item';
      div.style.cursor = 'pointer';
      div.style.transition = 'all 0.2s ease';
      div.onmouseover = () => div.style.background = 'rgba(255,255,255,0.05)';
      div.onmouseout = () => div.style.background = 'transparent';
      div.onclick = () => window.viewNotificationDetails(issue.id);
      div.innerHTML = content;
      container.appendChild(div);
      count++;
    });

    if (count === 0) {
      container.innerHTML = '<p style="color:var(--text-muted); text-align:center;">No recent activity.</p>';
    }
  } catch (e) {
    container.innerHTML = '<p style="color:var(--danger); text-align:center;">Failed to load activity.</p>';
  }
};

// Auto refresh dashboard metrics every 10 seconds if active
setInterval(() => {
  if (authState.isAuthenticated && (authState.role === 'admin' || authState.role === 'faculty')) {
    const dashboardEl = document.getElementById('adminDashboard');
    if (dashboardEl && !dashboardEl.classList.contains('hidden')) {
      loadAdminDashboard(false);
    }
    const adminNotifEl = document.getElementById('adminNotifications');
    if (adminNotifEl && !adminNotifEl.classList.contains('hidden')) {
      window.loadAdminNotifications();
    }
  }
}, 10000);

// ============================================================
// HEAD ADMIN BOT LOGIC
// ============================================================
const botParams = {
  fab: document.getElementById('botFab'),
  win: document.getElementById('botWindow'),
  closeBtn: document.getElementById('closeBotBtn'),
  input: document.getElementById('botInput'),
  sendBtn: document.getElementById('botSendBtn'),
  messages: document.getElementById('botMessages'),
  container: document.getElementById('head-admin-bot')
};

function saveChatHistory() {
  const msgs = botParams.messages.querySelectorAll('.bot-msg');
  const history = [];
  msgs.forEach(div => {
    history.push({
      sender: div.classList.contains('user') ? 'user' : 'ai',
      html: div.innerHTML,
      isHtml: div.innerHTML !== div.textContent
    });
  });
  sessionStorage.setItem('scappyBotHistory', JSON.stringify(history));
}

function restoreChatHistory() {
  const raw = sessionStorage.getItem('scappyBotHistory');
  if (!raw) return;
  try {
    const history = JSON.parse(raw);
    botParams.messages.innerHTML = '';
    history.forEach(msg => {
      const div = document.createElement('div');
      div.className = `bot-msg ${msg.sender}`;
      div.innerHTML = msg.html;
      botParams.messages.appendChild(div);
    });
    botParams.messages.scrollTop = botParams.messages.scrollHeight;
  } catch (e) { }
}

if (botParams.fab) {
  botParams.fab.addEventListener('click', () => {
    botParams.win.classList.remove('hidden');
    restoreChatHistory();
    botParams.input.focus();
  });

  botParams.closeBtn.addEventListener('click', () => {
    botParams.win.classList.add('hidden');
  });

  botParams.sendBtn.addEventListener('click', handleBotMessage);
  botParams.input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleBotMessage();
  });
}

function addBotMsg(text, sender = 'ai', isHtml = false) {
  const div = document.createElement('div');
  div.className = `bot-msg ${sender}`;
  if (isHtml) div.innerHTML = text;
  else div.textContent = text;
  botParams.messages.appendChild(div);
  botParams.messages.scrollTop = botParams.messages.scrollHeight;
  saveChatHistory();
}

// ============================================================
// PHASE 1: TRUE GEMINI LLM RAG ENGINE
// ============================================================
async function executeNLUQuery(queryText) {
  try {
    const res = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authState.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: queryText,
        departmentContext: authState.department
      })
    });

    const data = await res.json();
    if (data.error) {
      return { isHtml: false, text: "Error from AI Engine: " + data.error };
    }

    return { isHtml: true, text: data.reply };
  } catch (e) {
    return { isHtml: false, text: "Network error executing Gemini reasoning query." };
  }
}

// Ensure jsPDF logic works correctly
async function generatePDFReport(timeline = 'daily') {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const titleMap = {
    daily: 'Daily Activity Report',
    weekly: 'Weekly Summary Report',
    monthly: 'Monthly Analytics Report',
    yearly: 'Annual Overview Report'
  };

  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59);
  doc.text("ScappyV Campus Infrastructure", 14, 22);
  doc.setFontSize(14);
  doc.setTextColor(99, 102, 241);
  doc.text(titleMap[timeline] || "Issue Report", 14, 30);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);

  try {
    const res = await fetch('/api/issues', { headers: { 'Authorization': `Bearer ${authState.token}` } });
    const issues = await res.json();

    // Timeline calculation
    const now = new Date();
    const past = new Date();
    if (timeline === 'daily') past.setDate(now.getDate() - 1);
    else if (timeline === 'weekly') past.setDate(now.getDate() - 7);
    else if (timeline === 'monthly') past.setMonth(now.getMonth() - 1);
    else if (timeline === 'yearly') past.setFullYear(now.getFullYear() - 1);

    const filteredIssues = issues.filter(i => new Date(i.created_at) >= past);

    let tableData = filteredIssues.map(i => [
      i.id.substring(0, 6).toUpperCase(),
      `${i.buildings?.name || 'N/A'} (Rm: ${i.room_number || '-'})`,
      i.category,
      i.ai_assigned_department,
      (i.status || '').toUpperCase(),
      new Date(i.created_at).toLocaleDateString()
    ]);

    doc.autoTable({
      startY: 45,
      head: [['ID', 'LOCATION', 'CATEGORY', 'DEPARTMENT', 'STATUS', 'DATE']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [99, 102, 241] }
      },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    const pending = filteredIssues.filter(i => (i.status || '').toLowerCase() === 'pending').length;
    const resolved = filteredIssues.filter(i => (i.status || '').toLowerCase() === 'resolved').length;

    let finalY = doc.lastAutoTable.finalY || 45;
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text(`Summary for this period:`, 14, finalY + 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Pending Actions: ${pending}   |   Successfully Resolved: ${resolved}   |   Total Cases: ${filteredIssues.length}`, 14, finalY + 22);

    // Default to a nicer pdf name replacing spaces
    const title = titleMap[timeline] ? titleMap[timeline].split(' ').join('_') : 'Report';
    doc.save(`ScappyV_${title}.pdf`);
    return `Beautiful ${timeline} PDF downloaded! Total: ${filteredIssues.length} issues captured.`;
  } catch (err) {
    return "Error generating PDF: " + err.message;
  }
}

async function fetchIssueStats() {
  try {
    const res = await fetch('/api/issues', { headers: { 'Authorization': `Bearer ${authState.token}` } });
    const data = await res.json();
    const pending = data.filter(i => (i.status || '').toLowerCase() === 'pending').length;
    const resolved = data.filter(i => (i.status || '').toLowerCase() === 'resolved').length;
    return `You currently have ${pending} pending issues and ${resolved} resolved issues campus-wide.`;
  } catch (e) {
    return "Could not fetch stats at this moment.";
  }
}

async function intelligentDropReq(queryText) {
  try {
    const t = queryText.toLowerCase();
    const resList = await fetch('/api/issues', { headers: { 'Authorization': `Bearer ${authState.token}` } });
    const issues = await resList.json();

    let toDrop = [];
    let dropReason = '';

    // 1. Bulk Status Match
    if (t.includes('pending')) {
      toDrop = issues.filter(i => (i.status || '').toLowerCase() === 'pending');
      dropReason = 'Pending Issues';
    } else if (t.includes('resolved')) {
      toDrop = issues.filter(i => (i.status || '').toLowerCase() === 'resolved');
      dropReason = 'Resolved Issues';
    }

    // 2. Building Location Match
    if (toDrop.length === 0) {
      const uniqueBuildings = [...new Set(issues.map(i => i.buildings?.name).filter(Boolean))];
      let matchedBuilding = uniqueBuildings.find(b => t.includes(b.toLowerCase()));
      if (matchedBuilding) {
        toDrop = issues.filter(i => i.buildings?.name === matchedBuilding);
        dropReason = `Location: ${matchedBuilding}`;
      }
    }

    // 3. Exact ID Match (Fallback)
    if (toDrop.length === 0) {
      const idRegex = /(?:drop|delete|remove)s+(?:issues+)?([a-f0-9-]{4,})/i;
      const match = queryText.match(idRegex);
      if (match && match[1]) {
        const idParam = match[1].trim().toLowerCase();
        const target = issues.find(i => i.id.toLowerCase().startsWith(idParam));
        if (target) {
          toDrop.push(target);
          dropReason = `ID: ${target.id.substring(0, 6).toUpperCase()}`;
        }
      }
    }

    if (toDrop.length === 0) {
      return "Could not identify any matching issues to drop. Please specify a valid ID, status (like 'pending'), or Location (like 'SJT').";
    }

    // Execute Drops (Sequential for DB Safety)
    let droppedCount = 0;
    for (const issue of toDrop) {
      const res = await fetch(`/api/issues/${issue.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authState.token}` }
      });
      const data = await res.json();
      if (data.success) droppedCount++;
    }

    if (typeof loadAdminDashboard === 'function') loadAdminDashboard();
    return `Cleaned up! Successfully dropped ${droppedCount} issue(s) matching: [${dropReason}].`;
  } catch (e) {
    return "Error executing batch drop operation.";
  }
}

async function handleBotMessage() {
  const text = botParams.input.value.trim();
  if (!text) return;
  botParams.input.value = '';
  addBotMsg(text, 'user');

  // Typing indicator
  const typingHtml = `<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
  addBotMsg(typingHtml, "ai", true);
  const loadingNode = botParams.messages.lastChild;

  const t = text.toLowerCase();
  let isHtmlResp = false;

  // 1. Safe default polite fallback
  let aiResp = "I apologize, but I didn't quite catch that. I am fully equipped to give you 'stats', generate 'weekly pdf reports', or 'drop <issue_id>'. How can I help?";

  // 2. Profanity / Frustration Handler
  const profanity = ['stupid', 'dumb', 'idiot', 'shit', 'fuck', 'bitch', 'damn', 'ass', 'hell', 'crap', 'suck'];
  const isRude = profanity.some(word => t.includes(word));

  // 3. Dynamic Intent Router
  let matchName = t.match(/(?:call you|name is) ([a-z]+)/i);

  if (isRude) {
    aiResp = "I understand you might be frustrated. I'm here to support you—please let me know if you need to review stats, map a PDF report, or drop a specific issue.";
  } else if (matchName) {
    let newName = matchName[1].charAt(0).toUpperCase() + matchName[1].slice(1);
    sessionStorage.setItem('scappyBotName', newName);
    aiResp = `Understood! You can call me ${newName} from now on. How can I assist you today?`;
  } else if (t.includes('who are you') || t.includes('your name')) {
    let bName = sessionStorage.getItem('scappyBotName') || 'ResolveAI';
    aiResp = `I am ${bName}, your facility management assistant. I can summarize issues, generate PDF reports, and drop invalid tickets.`;
  } else if (t.includes('who am i') || t.includes('my name') || t.includes('my role')) {
    aiResp = `You are the Head Administrator logged in as ${authState.email}. You have full oversight of all campus departments.`;
  } else if (t.includes('hello') || t.includes('hi ') || t === 'hi' || t.includes('hey ')) {
    let bName = sessionStorage.getItem('scappyBotName') || 'ResolveAI';
    aiResp = `Hello! I am ${bName}. How can I make your facility management easier today?`;
  } else if (t.includes('drop') || t.includes('delete') || t.includes('remove')) {
    aiResp = await intelligentDropReq(text);
  } else if (t.includes('how many') || t.includes('pending') || t.includes('resolved') || t.includes('stats') || /\bstatus\b/.test(t)) {
    aiResp = await fetchIssueStats();
  } else if (t.includes('pdf') || t.includes('report') || t.includes('generate')) {
    let timeline = 'daily';
    if (t.includes('year')) timeline = 'yearly';
    else if (t.includes('month')) timeline = 'monthly';
    else if (t.includes('week')) timeline = 'weekly';

    aiResp = await generatePDFReport(timeline);
  } else {
    // 4. Default to Phase 1 Local NLU (NL2SQL Engine)
    const nluOutput = await executeNLUQuery(text);
    isHtmlResp = nluOutput.isHtml || false;
    aiResp = nluOutput.text;
  }

  // Render response
  botParams.messages.removeChild(loadingNode);
  addBotMsg(aiResp, 'ai', isHtmlResp);
}
// Global Loader Removal
window.addEventListener('load', () => {
  const loader = document.getElementById('globalLoader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 600);
  }
});
