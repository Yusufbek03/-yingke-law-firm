// Custom cursor
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cursor.style.left = mx + 'px'; cursor.style.top = my + 'px'; });
function animateRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();
document.querySelectorAll('a,button,.service-card,.why-item,.team-card,.review-card,.price-card,.contact-item').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.style.width='18px'; cursor.style.height='18px'; ring.style.width='50px'; ring.style.height='50px'; ring.style.opacity='0.3'; });
  el.addEventListener('mouseleave', () => { cursor.style.width='10px'; cursor.style.height='10px'; ring.style.width='36px'; ring.style.height='36px'; ring.style.opacity='0.6'; });
});

// Navbar scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  const toTop = document.getElementById('toTop');
  toTop.classList.toggle('visible', window.scrollY > 300);
});

// Reveal animation
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.12 });
reveals.forEach(r => observer.observe(r));

// Counter animation
const counters = document.querySelectorAll('.counter');
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.classList.contains('counted')) {
      e.target.classList.add('counted');
      const target = +e.target.dataset.target;
      const duration = 1800;
      const step = target / (duration / 16);
      let current = 0;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        e.target.textContent = Math.floor(current);
      }, 16);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => counterObserver.observe(c));

// Gold particles
const pContainer = document.getElementById('particles');
for (let i = 0; i < 30; i++) {
  const p = document.createElement('div');
  p.className = 'particle';
  p.style.left = Math.random() * 100 + '%';
  p.style.setProperty('--d', (6 + Math.random() * 10) + 's');
  p.style.setProperty('--delay', (Math.random() * 8) + 's');
  p.style.setProperty('--tx', (Math.random() * 60 - 30) + 'px');
  pContainer.appendChild(p);
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// CTA button feedback
document.querySelector('.cta-btn').addEventListener('click', function() {
  this.textContent = '✓ Отправлено!';
  this.style.background = '#4CAF50';
  setTimeout(() => { this.textContent = 'Отправить'; this.style.background = ''; }, 3000);
});

// ── PRICE MODAL ──
const modal = document.getElementById('modal');
const modalPlan = document.getElementById('modalPlan');
const modalClose = document.getElementById('modalClose');
const modalForm = document.getElementById('modalForm');

// ══════════════════════════════════════════════
const EMAILJS_PUBLIC_KEY = '8fMiV_ZXHbugQuVYY';
const EMAILJS_SERVICE_ID = 'service_e9wuu4n';
const EMAILJS_TEMPLATE_ID = 'template_ygki1cw';
// ══════════════════════════════════════════════

// Initialize EmailJS
(function() {
  if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }
})();

document.querySelectorAll('.btn-price').forEach(btn => {
  btn.addEventListener('click', function() {
    const card = this.closest('.price-card');
    const planName = card.querySelector('.price-name').textContent;
    modalPlan.textContent = 'Тариф: ' + planName;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', function(e) {
  if (e.target === modal) closeModal();
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
});

modalForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const submitBtn = this.querySelector('.modal-submit');
  const originalText = submitBtn.textContent;
  const inputs = this.querySelectorAll('.modal-input');

  // Get current plan name
  const plan = modalPlan.textContent.replace('Тариф: ', '');

  const fromName = inputs[0].value.trim();
  const phone = inputs[1].value.trim();
  const message = inputs[2].value.trim() || 'Не указано';

  console.log('📋 Данные заявки:', { from_name: fromName, phone, message, plan });

  // Check if EmailJS is configured
  if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
    submitBtn.textContent = '✓ Отправлено!';
    submitBtn.style.background = '#4CAF50';
    console.log('⚠️ EmailJS не настроен. Откройте EMAILJS_SETUP.md для инструкции.');
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.style.background = '';
      this.reset();
      closeModal();
    }, 2500);
    return;
  }

  // Check if emailjs library loaded
  if (typeof emailjs === 'undefined') {
    submitBtn.textContent = '❌ Ошибка загрузки';
    submitBtn.style.background = '#f44336';
    console.error('❌ Библиотека EmailJS не загрузилась. Проверьте интернет-соединение.');
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.style.background = '';
      submitBtn.disabled = false;
    }, 3000);
    return;
  }

  // Send email via EmailJS
  submitBtn.textContent = '⏳ Отправка...';
  submitBtn.disabled = true;

  const templateParams = {
    from_name: fromName,
    phone: phone,
    message: message,
    plan: plan
  };

  console.log('📤 Отправка через EmailJS...');

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
    .then(function(response) {
      console.log('✅ Письмо отправлено!', response.status, response.text);
      submitBtn.textContent = '✓ Отправлено!';
      submitBtn.style.background = '#4CAF50';
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
        modalForm.reset();
        closeModal();
      }, 2500);
    })
    .catch(function(error) {
      console.error('❌ EmailJS Error:', error);
      const errorMsg = error.text || error.message || 'Неизвестная ошибка';
      submitBtn.textContent = '❌ ' + errorMsg.substring(0, 20);
      submitBtn.style.background = '#f44336';
      console.log('💡 Проверьте:');
      console.log('1. В Email Templates создан шаблон с переменными: from_name, phone, message, plan');
      console.log('2. В шаблоне "To Email" указан: mahmuthanovy@gmail.com');
      console.log('3. Email Service подключён к Gmail');
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
      }, 4000);
    });
});

// ── CTA FORM (bottom section) ──
const ctaBtn = document.querySelector('.cta-btn');
const ctaInputs = document.querySelectorAll('.cta-input');

if (ctaBtn && ctaInputs.length >= 2) {
  ctaBtn.addEventListener('click', function() {
    const name = ctaInputs[0].value.trim();
    const phone = ctaInputs[1].value.trim();
    const message = ctaInputs[2] ? ctaInputs[2].value.trim() : 'Не указано';

    if (!name || !phone) {
      alert('Пожалуйста, заполните имя и телефон');
      return;
    }

    // Check if EmailJS is configured
    if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
      this.textContent = '✓ Отправлено!';
      this.style.background = '#4CAF50';
      setTimeout(() => { this.textContent = 'Отправить'; this.style.background = ''; }, 3000);
      return;
    }

    if (typeof emailjs === 'undefined') {
      this.textContent = '❌ Ошибка загрузки';
      this.style.background = '#f44336';
      setTimeout(() => { this.textContent = 'Отправить'; this.style.background = ''; }, 3000);
      return;
    }

    this.textContent = '⏳ Отправка...';
    this.disabled = true;

    const templateParams = {
      from_name: name,
      phone: phone,
      message: message || 'Бесплатная консультация с главной страницы',
      plan: 'Консультация'
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
      .then(() => {
        ctaBtn.textContent = '✓ Отправлено!';
        ctaBtn.style.background = '#4CAF50';
        ctaInputs[0].value = '';
        ctaInputs[1].value = '';
        if (ctaInputs[2]) ctaInputs[2].value = '';
        setTimeout(() => {
          ctaBtn.textContent = 'Отправить';
          ctaBtn.style.background = '';
          ctaBtn.disabled = false;
        }, 3000);
      })
      .catch((error) => {
        console.error('CTA Form EmailJS Error:', error);
        ctaBtn.textContent = '❌ Ошибка';
        ctaBtn.style.background = '#f44336';
        setTimeout(() => {
          ctaBtn.textContent = 'Отправить';
          ctaBtn.style.background = '';
          ctaBtn.disabled = false;
        }, 3000);
      });
  });
}
