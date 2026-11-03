const settings = {
  essentialCheckout: 'https://xpag.global/pay/gmf9fdfF',
  premiumCheckout: 'https://xpag.global/pay/exL0zKDR',
  offerEndsAt: '',
};

const get = (id) => document.getElementById(id);
const offer = get('offer');
const sticky = get('sticky');
const plans = get('planes');
const checkoutStatus = get('checkout-status');
const checkoutLinks = [...document.querySelectorAll('.checkout')];
let expired = false;
const video = get('mini-vsl');
const playerSurface = get('play-vsl');
const listenPrompt = get('vsl-listen');
const preview = get('vsl-preview');

function updatePlaybackLabel() {
  if (video.hidden) return;
  const stopped = video.paused || video.ended;
  playerSurface.setAttribute('aria-label', stopped ? 'Reproducir video' : 'Pausar video');
}

for (const event of ['play', 'pause', 'ended']) {
  video.addEventListener(event, updatePlaybackLabel);
}

playerSurface.addEventListener('click', () => {
  if (video.hidden) {
    preview.pause();
    preview.hidden = true;
    video.hidden = false;
    listenPrompt.hidden = true;
  } else if (!video.paused && !video.ended) {
    video.pause();
    return;
  }
  video.play().catch(updatePlaybackLabel);
});

function updateCheckoutLinks() {
  const urls = { essential: settings.essentialCheckout, premium: settings.premiumCheckout };
  checkoutLinks.forEach((link) => {
    const url = urls[link.dataset.plan];
    if (!expired && /^https:\/\//i.test(url)) {
      link.href = url;
      link.removeAttribute('aria-disabled');
    } else {
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
    }
  });
  checkoutStatus.hidden = checkoutLinks.every((link) => link.hasAttribute('href'));
}
updateCheckoutLinks();

const endTime = Date.parse(settings.offerEndsAt);
if (Number.isFinite(endTime)) {
  get('deadline').hidden = false;
  const formatter = new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Mexico_City',
  });
  get('deadline-label').textContent = 'Disponible hasta el ' + formatter.format(endTime) + ' (hora de Ciudad de México)';
  function updateCountdown() {
    const seconds = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    if (seconds === 0) {
      expired = true;
      get('countdown').textContent = 'Oferta finalizada';
      updateCheckoutLinks();
      checkoutStatus.textContent = 'El plazo para agregar este complemento terminó.';
      return;
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds / 60) % 60;
    const remainder = seconds % 60;
    get('countdown').textContent = [hours, minutes, remainder].map((n) => String(n).padStart(2, '0')).join(':');
    setTimeout(updateCountdown, 1000);
  }
  updateCountdown();
}

function updateSticky() {
  const rect = plans.getBoundingClientRect();
  sticky.hidden = offer.hidden || window.scrollY < 350 || (rect.top < window.innerHeight && rect.bottom > 0);
}
window.addEventListener('scroll', updateSticky, { passive: true });
window.addEventListener('resize', updateSticky);
updateSticky();

get('decline').onclick = () => {
  video.pause();
  preview.pause();
  offer.hidden = true;
  get('finished').hidden = false;
  updateSticky();
  window.scrollTo(0, 0);
  get('return').focus();
};
get('return').onclick = () => {
  get('finished').hidden = true;
  offer.hidden = false;
  window.scrollTo(0, 0);
  offer.querySelector('a').focus();
};
