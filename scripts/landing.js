const header = document.querySelector('.lp-header');
window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 10);
});

const nav = document.getElementById('lpNav');
const burger = document.getElementById('lpBurger');

burger?.addEventListener('click', (e) => {
  e.stopPropagation();
  nav?.classList.toggle('open');
  burger?.classList.toggle('active');
});

document.addEventListener('click', (e) => {
  if (nav?.classList.contains('open') && !nav.contains(e.target) && e.target !== burger) {
    nav.classList.remove('open');
    burger?.classList.remove('active');
  }
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(
  '.lp-hero-left, .lp-hero-right, .lp-job, .lp-case, .lp-plan, .lp-cta-copy, .lp-cta-art, .lp-kicker, .lp-section > h2'
).forEach((el) => {
  el.classList.add('fade-in');
  observer.observe(el);
});

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    nav?.classList.remove('open');
    burger?.classList.remove('active');
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

/* Case modals */
const modalOverlay = document.getElementById('caseModal');
const modalBody = document.getElementById('caseModalBody');

function openModal(templateId) {
  const tpl = document.getElementById(templateId);
  if (!tpl || !modalOverlay || !modalBody) return;
  modalBody.innerHTML = tpl.innerHTML;
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay?.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-modal]').forEach((card) => {
  card.addEventListener('click', () => openModal(card.dataset.modal));
});

modalOverlay?.querySelector('.lp-modal-close')?.addEventListener('click', closeModal);
modalOverlay?.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
