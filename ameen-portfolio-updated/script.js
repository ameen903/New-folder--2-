// Portfolio interactions — progressive enhancement, no framework required.

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Icons are optional: the site remains usable if the CDN is unavailable.
if (window.lucide?.createIcons) window.lucide.createIcons();

// Keep the intro visible long enough for the letter animation to finish.
const loadingScreen = $('#loadingScreen');
function hideLoadingScreen() {
  if (!loadingScreen) return;
  window.setTimeout(() => {
    loadingScreen.classList.add('is-hidden');
    loadingScreen.setAttribute('aria-hidden', 'true');
  }, 2000);
}
if (document.readyState === 'complete') hideLoadingScreen();
else window.addEventListener('load', hideLoadingScreen, { once: true });

// Mobile navigation: close on selection, Escape, or when returning to desktop.
const menuButton = $('.menu-toggle');
const nav = $('#navLinks');
function setMenu(open) {
  if (!menuButton || !nav) return;
  nav.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.innerHTML = open ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
  if (window.lucide?.createIcons) window.lucide.createIcons();
}
menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
$$('#navLinks a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });
window.matchMedia('(min-width: 851px)').addEventListener?.('change', event => { if (event.matches) setMenu(false); });

// Scroll reveal with a safe fallback for browsers without IntersectionObserver.
const revealItems = $$('.reveal, .skills, .about, .service-card, .project-card, .testimonial-label, .contact-form-wrap');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
  revealItems.forEach(item => revealObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('visible'));
}

// Reading progress indicator.
const progressBar = $('#scrollProgress');
let scrollTicking = false;
function updateScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (progressBar) progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  scrollTicking = false;
}
window.addEventListener('scroll', () => {
  if (!scrollTicking) { window.requestAnimationFrame(updateScrollProgress); scrollTicking = true; }
}, { passive: true });
updateScrollProgress();

// Current year stays accurate without changing the visual style.
const year = $('#currentYear');
if (year) year.textContent = new Date().getFullYear();

// Project detail modal. Replace the sample case-study copy with verified project facts before publishing.
const projects = [
  { category: 'PROJECT / 01 — WEB DEVELOPMENT', title: 'PERSONAL PORTFOLIO WEBSITE', description: 'A responsive personal portfolio built from scratch to present education, skills, and projects, with a clean visual design.', role: 'TOOLS: HTML5 / CSS3 / JAVASCRIPT', focus: 'FOCUS: RESPONSIVE WEB DEVELOPMENT' },
  { category: 'PROJECT / 02 — ALGORITHMS', title: 'DSA PRACTICE PROGRAMS', description: 'A collection of data structures and algorithms implementations covering sorting, searching, trees, and graph traversal for coursework and self-practice.', role: 'TOOLS: PYTHON / C++', focus: 'FOCUS: DATA STRUCTURES / ALGORITHMS' },
  { category: 'PROJECT / 03 — EXPLORATION', title: 'CYBERSECURITY & AI MINI-PROJECTS', description: 'Exploratory projects in network fundamentals and applied AI, connecting classroom theory with hands-on practice.', role: 'TOOLS: PYTHON / NETWORKING', focus: 'FOCUS: CYBERSECURITY / AI BASICS' }
];
const modal = $('#projectDetails');
let lastFocusedElement = null;
function openProject(index) {
  const project = projects[index];
  if (!project || !modal) return;
  lastFocusedElement = document.activeElement;
  $('#projectModalCategory').textContent = project.category;
  $('#projectModalTitle').textContent = project.title;
  $('#projectModalDescription').textContent = project.description;
  $('#projectModalRole').textContent = project.role;
  $('#projectModalFocus').textContent = project.focus;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  $('.modal-close', modal)?.focus();
}
function closeProject() {
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  lastFocusedElement?.focus();
}
$$('[data-project]').forEach(card => card.addEventListener('click', event => {
  event.preventDefault();
  openProject(Number(card.dataset.project));
}));
$$('[data-close-modal]').forEach(control => control.addEventListener('click', closeProject));
$('#projectModalCta')?.addEventListener('click', closeProject);

// Contact form opens a pre-filled email. This is not a server-side submission endpoint.
$('#contactForm')?.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const recipient = 'ausfat.ameen.10@gmail.com';
  const subject = encodeURIComponent(data.get('subject') || 'Portfolio enquiry');
  const body = encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`);
  const note = $('#formNote');
  if (note) note.textContent = 'Opening your email app with the message prepared. Please review and send it there.';
  window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
});

// Subtle tilt is limited to fine-pointer devices and disabled for reduced-motion users.
const canTilt = window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (canTilt) {
  $$('.hero-art, .service-card, .project-card, .stat').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1100px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-3px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

// Custom cursor is decorative only; native pointer behavior remains intact.
const cursor = $('.custom-cursor');
if (cursor && canTilt) {
  document.addEventListener('pointermove', event => {
    cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    cursor.classList.add('is-visible');
  }, { passive: true });
  $$('a, button, input, textarea').forEach(el => {
    el.addEventListener('pointerenter', () => cursor.classList.add('is-hovering'));
    el.addEventListener('pointerleave', () => cursor.classList.remove('is-hovering'));
  });
} else if (cursor) cursor.remove();
