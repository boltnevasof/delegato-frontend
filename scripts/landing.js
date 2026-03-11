const nav = document.getElementById('lpNav');
const burger = document.getElementById('lpBurger');

burger?.addEventListener('click', () => nav?.classList.toggle('open'));

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    nav?.classList.remove('open');
    target.scrollIntoView({ behavior: 'smooth' });
  });
});
