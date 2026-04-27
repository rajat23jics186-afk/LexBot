// ============================================================
// INIT
// ============================================================
AOS.init({ once: true, duration: 700, easing: 'ease-out-cubic' });
gsap.registerPlugin(ScrollTrigger);

// ============================================================
// DARK MODE
// ============================================================
function toggleDark() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('lexbot-theme', isDark ? 'light' : 'dark');
}

// Load saved theme
(function () {
  const saved = localStorage.getItem('lexbot-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
})();

// ============================================================
// MOBILE NAV
// ============================================================
function toggleMobileNav() {
  document.getElementById('mobileNav').classList.toggle('open');
}

// ============================================================
// TYPING ANIMATION (hero)
// ============================================================
const typingWords = ['FIR Filing', 'Cyber Law', 'Consumer Rights', 'RTI', 'Labour Rights', 'Property Law', 'Domestic Violence'];
let tIdx = 0, tChar = 0, tDeleting = false;

function typeLoop() {
  const el = document.getElementById('typingText');
  const word = typingWords[tIdx];
  if (!tDeleting) {
    el.textContent = word.slice(0, ++tChar);
    if (tChar === word.length) { tDeleting = true; setTimeout(typeLoop, 1800); return; }
  } else {
    el.textContent = word.slice(0, --tChar);
    if (tChar === 0) { tDeleting = false; tIdx = (tIdx + 1) % typingWords.length; }
  }
  setTimeout(typeLoop, tDeleting ? 60 : 100);
}
typeLoop();

// ============================================================
// STATS COUNTER ANIMATION
// ============================================================
const statsTargets = { s1: 50, s2: 10000, s3: 5000, s4: 24 };
const statSuffixes = { s1: '+', s2: '+', s3: '+', s4: '/7' };

function animateCounter(id, target, suffix) {
  const el = document.getElementById(id);
  let current = 0;
  const step = Math.ceil(target / 60);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current.toLocaleString() + suffix;
    if (current >= target) clearInterval(timer);
  }, 25);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      Object.entries(statsTargets).forEach(([id, val]) => animateCounter(id, val, statSuffixes[id]));
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.3 });
statsObserver.observe(document.querySelector('.stats-bar'));

// ============================================================
// GSAP ANIMATIONS
// ============================================================
gsap.from('#navbar', { y: -60, opacity: 0, duration: 0.8, ease: 'power3.out' });
gsap.from('.hero-badge',      { y: 30, opacity: 0, duration: 0.7, delay: 0.3, ease: 'power3.out' });
gsap.from('.hero-title',      { y: 40, opacity: 0, duration: 0.8, delay: 0.5, ease: 'power3.out' });
gsap.from('.hero-typing-wrap',{ y: 20, opacity: 0, duration: 0.6, delay: 0.7, ease: 'power3.out' });
gsap.from('.hero-desc',       { y: 20, opacity: 0, duration: 0.6, delay: 0.9, ease: 'power3.out' });
gsap.from('.hero-ask',        { y: 20, opacity: 0, duration: 0.6, delay: 1.0, ease: 'power3.out' });
gsap.from('.chip',            { y: 15, opacity: 0, duration: 0.5, delay: 1.1, stagger: 0.1, ease: 'power3.out' });

window.addEventListener('scroll', () => {
  const btn = document.getElementById('scrollTop');
  btn.classList.toggle('visible', window.scrollY > 400);
});

// ============================================================
// FAQ ACCORDION
// ============================================================
function toggleFAQ(el) {
  const item = el.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// ============================================================
// CHAT ENGINE
// ============================================================

const legalDB = {
  'fir': {
    title: 'FIR Filing Procedure',
    explanation: 'An FIR (First Information Report) is a written document prepared by police when they receive information about a cognizable offence. Filing an FIR is your legal right under Section 154 of CrPC and the police cannot refuse to register it.',
    steps: [
      'Visit the nearest police station (preferably the one with jurisdiction over the area where the crime occurred).',
      'Narrate the incident to the duty officer and request to register an FIR.',
      'Provide your full name, address, and contact details.',
      'Give all relevant details: date, time, location, description of the crime, and names/descriptions of accused (if known).',
      'The officer writes it in the FIR register — you have the right to have it read back to you.',
      'Sign or put your thumb impression on the FIR.',
      'Get a free copy of the FIR — this is your legal right under Section 154(2) CrPC.',
      'If police refuse, you can send written complaint to DSP/SP or file a complaint in Magistrate Court under Section 156(3).',
    ],
    tip: '💡 Tip: You can also file an e-FIR online on your state police website for certain offences like theft, missing person, etc.'
  },
  'cyber': {
    title: 'Cyber Fraud Complaint',
    explanation: 'Cyber fraud includes online scams, phishing, UPI fraud, identity theft, and more. Under the IT Act 2000 and IT Amendment Act 2008, these are punishable offences. Act quickly — report within 24 hours to freeze transactions.',
    steps: [
      'Immediately call the National Cyber Crime Helpline: 1930 to report financial fraud.',
      'Visit cybercrime.gov.in and click "Report Cyber Crime" → "Financial Frauds".',
      'Create an account on the portal and file your complaint with all details.',
      'Collect evidence: screenshots, transaction IDs, email headers, chat records.',
      'Inform your bank immediately to freeze/block the fraudulent transaction.',
      'File a formal FIR at your local cyber crime police station.',
      'If significant amount is involved, contact your bank\'s fraud department for chargeback.',
    ],
    tip: '💡 Tip: Under Section 66C and 66D of IT Act, cyber fraud is punishable with up to 3 years imprisonment and ₹1 lakh fine.'
  },
  'consumer': {
    title: 'Consumer Rights Complaint',
    explanation: 'As a consumer, you are protected under the Consumer Protection Act 2019. You have the right to seek redressal for defective products, deficient services, unfair trade practices, and overcharging.',
    steps: [
      'First, try to resolve the issue directly with the seller/company (send a written complaint via email/registered post).',
      'If unresolved, call the National Consumer Helpline: 1915 or visit consumerhelpline.gov.in.',
      'File an online complaint on the E-Daakhil portal: edaakhil.nic.in.',
      'For claims up to ₹50 lakh → District Consumer Commission.',
      'For ₹50 lakh to ₹2 crore → State Consumer Commission.',
      'For above ₹2 crore → National Consumer Commission (NCDRC).',
      'Keep all bills, receipts, warranties, correspondence as evidence.',
      'You can file the complaint yourself (no lawyer required for District Commission).',
    ],
    tip: '💡 Tip: Under the Consumer Protection Act 2019, you can also file complaints about misleading advertisements and e-commerce platforms.'
  },
  'rti': {
    title: 'Right to Information (RTI)',
    explanation: 'RTI Act 2005 gives every citizen the right to access information held by any public authority. It is a powerful tool for transparency and accountability in government. Any citizen can file an RTI — it costs just ₹10.',
    steps: [
      'Identify the Public Information Officer (PIO) of the concerned department.',
      'Write an RTI application clearly mentioning what specific information you need.',
      'Pay ₹10 as application fee (₹2 per page for BPL card holders it is free).',
      'Submit by post (registered) or in person to the PIO, or apply online at rtionline.gov.in for central government departments.',
      'The PIO must respond within 30 days (48 hours for life/liberty matters).',
      'If dissatisfied or no response, file First Appeal with the First Appellate Authority within 30 days.',
      'If still unsatisfied, file Second Appeal with Central/State Information Commission within 90 days.',
    ],
    tip: '💡 Tip: Do NOT mention the reason for seeking information in your RTI application. Keep it simple and specific.'
  },
  'labour': {
    title: 'Labour Rights in India',
    explanation: 'Indian labour laws protect workers from exploitation, ensure fair wages, safe working conditions, and provide for social security. Key laws include the Factories Act, Minimum Wages Act, Payment of Wages Act, and the new Labour Codes.',
    steps: [
      'Identify the violation: non-payment of wages, wrongful termination, unsafe conditions, no PF/ESI, etc.',
      'First, raise the issue in writing to your employer/HR department.',
      'If unresolved, contact the Labour Commissioner in your district.',
      'File a complaint with the Labour Court under the Industrial Disputes Act.',
      'For wage-related issues, approach the Labour Inspector for inspection.',
      'For PF/ESI issues, contact the EPFO/ESIC regional office.',
      'Workers can form or join trade unions under the Trade Unions Act 1926.',
    ],
    tip: '💡 Tip: Under the Minimum Wages Act, every state has its own minimum wage schedule. Your employer is legally bound to pay at least that amount.'
  },
  'bail': {
    title: 'Understanding Bail in India',
    explanation: 'Bail is the temporary release of an accused person awaiting trial or appeal. Under CrPC, there are three main types of bail, each with different procedures and applicability.',
    steps: [
      'Regular Bail (Section 437/439 CrPC): Applied after arrest. File application in Sessions Court or High Court.',
      'Anticipatory Bail (Section 438 CrPC): Applied BEFORE arrest when you fear imminent arrest. File in Sessions Court or High Court.',
      'Interim Bail: Temporary bail granted for a short period until the main bail application is heard.',
      'Hire an advocate to file the bail application with supporting documents.',
      'The court considers: nature of offence, evidence, flight risk, criminal history, and impact on witnesses.',
      'If bail is denied in Sessions Court, apply in High Court; then Supreme Court.',
      'Bail conditions may include: surety, regular police station reporting, passport surrender.',
    ],
    tip: '💡 Tip: Under Article 21 of the Constitution, personal liberty is a fundamental right. Bail applications should be decided promptly.'
  },
};

function detectTopic(msg) {
  const m = msg.toLowerCase();
  if (m.includes('fir') || m.includes('police') || m.includes('report') || m.includes('crime'))   return 'fir';
  if (m.includes('cyber') || m.includes('fraud') || m.includes('scam') || m.includes('online') || m.includes('hack')) return 'cyber';
  if (m.includes('consumer') || m.includes('product') || m.includes('refund') || m.includes('defect')) return 'consumer';
  if (m.includes('rti') || m.includes('information') || m.includes('government data')) return 'rti';
  if (m.includes('labour') || m.includes('worker') || m.includes('salary') || m.includes('job') || m.includes('wage') || m.includes('fired')) return 'labour';
  if (m.includes('bail') || m.includes('arrest') || m.includes('custody') || m.includes('jail')) return 'bail';
  return null;
}

function buildBotHTML(data) {
  const stepsHTML = data.steps.map((s, i) =>
    `<li data-n="${i + 1}.">${s}</li>`
  ).join('');
  return `
    <div class="bot-structured">
      <div class="bot-section-title">📌 ${data.title}</div>
      <p style="font-size:0.88rem;line-height:1.6;">${data.explanation}</p>
      <div class="bot-section-title">📝 Steps to Follow</div>
      <ol class="bot-steps">${stepsHTML}</ol>
      <div class="bot-tip">${data.tip}</div>
    </div>`;
}

// Generate or get sessionId from localStorage
function getSessionId() {
  let sessionId = localStorage.getItem('lexbot-sessionId');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('lexbot-sessionId', sessionId);
  }
  return sessionId;
}

async function callBackendAPI(userMessage) {
  const BACKEND_URL = 'https://lexbot-backend.onrender.com';
  const sessionId = getSessionId();

  try {
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
        sessionId: sessionId,
        language: 'en'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.success && data.data && data.data.message) {
      return data.data.message;
    }
    throw new Error('No response from backend');
  } catch (err) {
    console.warn('Backend API call failed:', err);
    return null;
  }
}

function formatBotResponse(text) {
  // The backend returns formatted text, so we just need to add styling
  let html = text
    .replace(/\n\n/g, '</p><p style="margin-top:8px;">')
    .replace(/\n(\d+)\.\s/g, '</p><p style="margin-top:4px;"><span style="font-weight:700;color:var(--accent);">$1.</span> ')
    .replace(/\n[-•]\s/g, '</p><p style="margin-top:4px;">• ')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^(📌|📖|📝|💡|⚠️)(.+?)$/gm, '<div style="font-weight:600;margin-top:8px;">$1$2</div>');
  return `<div style="font-size:0.88rem;line-height:1.6;"><p>${html}</p></div>`;
}

function renderMessage(content, role, isHTML = false) {
  const wrap = document.createElement('div');
  wrap.className = `msg ${role}`;
  const avatar = document.createElement('div');
  avatar.className = `msg-avatar ${role === 'bot' ? 'bot-avatar' : 'user-avatar'}`;
  avatar.textContent = role === 'bot' ? '⚖️' : '👤';
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  if (isHTML) bubble.innerHTML = content;
  else bubble.textContent = content;
  wrap.appendChild(avatar);
  wrap.appendChild(bubble);
  return wrap;
}

let typingEl = null;

function showTyping() {
  const wrap = document.createElement('div');
  wrap.className = 'msg bot'; wrap.id = 'typingMsg';
  const av = document.createElement('div');
  av.className = 'msg-avatar bot-avatar'; av.textContent = '⚖️';
  const ind = document.createElement('div');
  ind.className = 'typing-indicator';
  ind.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  wrap.appendChild(av); wrap.appendChild(ind);
  typingEl = wrap;
  chatMsgs.appendChild(wrap);
  scrollChat();
}

function hideTyping() {
  if (typingEl) { typingEl.remove(); typingEl = null; }
}

const chatMsgs = document.getElementById('chatMessages');

function scrollChat() {
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

async function sendMessage(forcedMsg) {
  const input = document.getElementById('chatInput');
  const msg = (forcedMsg || input.value).trim();
  if (!msg) return;

  chatMsgs.appendChild(renderMessage(msg, 'user'));
  input.value = '';
  input.style.height = 'auto';
  scrollChat();

  showTyping();

  // Small delay for better UX
  await new Promise(r => setTimeout(r, 400));

  hideTyping();

  let botMsg;
  
  // Call backend API
  const apiResp = await callBackendAPI(msg);
  if (apiResp) {
    botMsg = renderMessage(formatBotResponse(apiResp), 'bot', true);
  } else {
    const fallback = `<div style="font-size:0.88rem;line-height:1.7;">
      <p>⚠️ Unable to reach the backend server at <strong>http://localhost:5000</strong></p>
      <p style="margin-top:8px;"><strong>Make sure your backend is running:</strong></p>
      <p style="margin-top:4px;">From the backend folder, run: <code style="background:#f0f0f0;padding:2px 4px;">npm run dev</code></p>
      <p style="margin-top:8px;"><strong>For this topic, you can also:</strong></p>
      <p style="margin-top:4px;"><span style="font-weight:700;color:var(--accent);">1.</span> Call NALSA Helpline: <strong>15100</strong></p>
      <p style="margin-top:4px;"><span style="font-weight:700;color:var(--accent);">2.</span> Visit india.gov.in for government resources</p>
      <p style="margin-top:4px;"><span style="font-weight:700;color:var(--accent);">3.</span> Contact your District Legal Services Authority (DLSA)</p>
      <div class="bot-tip" style="margin-top:8px;">⚠️ Remember: This is general information only. Please consult a qualified advocate for advice specific to your situation.</div>
    </div>`;
    botMsg = renderMessage(fallback, 'bot', true);
  }

  chatMsgs.appendChild(botMsg);
  scrollChat();

  saveChatHistory(msg, botMsg.querySelector('.msg-bubble').innerHTML);
}

function quickAsk(msg) {
  document.getElementById('chatInput').value = msg;
  document.getElementById('chat').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => sendMessage(msg), 500);
}

function heroAsk() {
  const val = document.getElementById('heroInput').value.trim();
  if (!val) return;
  document.getElementById('heroInput').value = '';
  document.getElementById('chat').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => sendMessage(val), 600);
}

function setTopic(topic) {
  quickAsk(`Tell me about ${topic}`);
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

// Welcome message on load
window.addEventListener('DOMContentLoaded', () => {
  const welcome = `<div class="bot-structured">
    <div class="bot-section-title">👋 Welcome to LexBot!</div>
    <p style="font-size:0.88rem;line-height:1.6;">I'm your AI Legal Information Assistant. I can help you understand your rights and legal procedures in simple language.</p>
    <div class="bot-section-title">🗂️ You can ask me about:</div>
    <ol class="bot-steps">
      <li data-n="📋">FIR filing procedure</li>
      <li data-n="💻">Cyber fraud complaints</li>
      <li data-n="🛒">Consumer rights & complaints</li>
      <li data-n="📂">RTI applications</li>
      <li data-n="👷">Labour rights</li>
      <li data-n="🔐">Bail procedures</li>
    </ol>
    <div class="bot-tip">⚠️ Disclaimer: I provide legal information only, not professional legal advice. For specific cases, please consult a qualified advocate.</div>
  </div>`;
  chatMsgs.appendChild(renderMessage(welcome, 'bot', true));
});

// ============================================================
// CHAT HISTORY (localStorage)
// ============================================================
function saveChatHistory(userMsg, botHTML) {
  try {
    const history = JSON.parse(localStorage.getItem('lexbot-history') || '[]');
    history.push({ ts: new Date().toISOString(), user: userMsg, bot: botHTML });
    if (history.length > 50) history.shift();
    localStorage.setItem('lexbot-history', JSON.stringify(history));
  } catch (e) {}
}

// ============================================================
// PDF DOWNLOAD
// ============================================================
function downloadChatPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('LexBot – Chat History', 20, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('AI Legal Information System | ' + new Date().toLocaleString(), 20, 28);
  doc.text('Disclaimer: This document contains legal information only, not professional legal advice.', 20, 34);

  doc.setLineWidth(0.3);
  doc.line(20, 37, 190, 37);

  let y = 45;
  const messages = chatMsgs.querySelectorAll('.msg');
  messages.forEach(msg => {
    const isUser = msg.classList.contains('user');
    const bubble = msg.querySelector('.msg-bubble');
    const text = bubble ? bubble.innerText : '';
    if (!text.trim()) return;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(isUser ? 43 : 66, isUser ? 108 : 153, isUser ? 176 : 225);
    doc.text(isUser ? 'You:' : 'LexBot:', 20, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    const lines = doc.splitTextToSize(text, 165);
    lines.forEach(line => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.text(line, 25, y);
      y += 5;
    });
    y += 4;
  });

  doc.save('LexBot-Chat-' + Date.now() + '.pdf');
}

// ============================================================
// VOICE INPUT (Web Speech API)
// ============================================================
let recognition = null;
let isListening = false;

function toggleVoice() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    alert('Voice input is not supported in your browser. Please use Chrome or Edge.');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const btn = document.getElementById('voiceBtn');

  if (isListening) {
    recognition.stop();
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = currentLang === 'hi' ? 'hi-IN' : 'en-IN';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isListening = true;
    btn.classList.add('listening');
    btn.title = 'Listening... (click to stop)';
  };

  recognition.onresult = (e) => {
    const transcript = Array.from(e.results)
      .map(r => r[0].transcript).join('');
    document.getElementById('chatInput').value = transcript;
  };

  recognition.onend = () => {
    isListening = false;
    btn.classList.remove('listening');
    btn.title = 'Voice input';
  };

  recognition.onerror = (e) => {
    isListening = false;
    btn.classList.remove('listening');
    console.error('Speech error:', e.error);
  };

  recognition.start();
}

// ============================================================
// MULTILINGUAL (EN/HI)
// ============================================================
let currentLang = 'en';

const i18n = {
  en: {
    badge:          'AI-Powered Legal Assistant',
    heroTitle1:     'Understand Law in',
    heroTitle2:     'Simple Language',
    typingLabel:    'Ask about:',
    heroDesc:       'Get clear, step-by-step guidance on common legal issues — FIR filing, cyber fraud, consumer rights, and more. No jargon, no confusion. Just plain language explanations.',
    heroPlaceholder:'e.g. How to file an FIR?',
  },
  hi: {
    badge:          'AI-संचालित कानूनी सहायक',
    heroTitle1:     'कानून को समझें',
    heroTitle2:     'सरल भाषा में',
    typingLabel:    'पूछें:',
    heroDesc:       'FIR दर्ज करना, साइबर धोखाधड़ी, उपभोक्ता अधिकार और अधिक — सरल हिंदी में स्पष्ट, चरण-दर-चरण मार्गदर्शन प्राप्त करें।',
    heroPlaceholder:'जैसे: FIR कैसे दर्ज करें?',
  }
};

function setLang(lang) {
  currentLang = lang;
  document.getElementById('btnEn').classList.toggle('active', lang === 'en');
  document.getElementById('btnHi').classList.toggle('active', lang === 'hi');

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang][key]) el.textContent = i18n[lang][key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (i18n[lang][key]) el.placeholder = i18n[lang][key];
  });
}