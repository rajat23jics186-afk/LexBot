/**
 * controllers/chatController.js
 * Core logic: user message → Gemini API → save to MongoDB → return response
 * AI Provider: Google Gemini 1.5 Flash (Free)
 */

const axios   = require('axios');
const Chat    = require('../models/Chat');
const Session = require('../models/Session');
const {
  GEMINI_API_URL,
  SYSTEM_PROMPT,
} = require('../config/constants');

// ─────────────────────────────────────────────
// LOCAL LEGAL KNOWLEDGE BASE
// Fast-path: no API call needed for common topics
// ─────────────────────────────────────────────
const legalDB = {
  fir: {
    topic: 'FIR Filing Procedure',
    explanation:
      'An FIR (First Information Report) is a written document prepared by police when they receive information about a cognizable offence. Filing an FIR is your legal right under Section 154 CrPC — police CANNOT refuse to register it.',
    steps: [
      'Visit the nearest police station with jurisdiction over the crime location.',
      'Narrate the incident to the duty officer and request FIR registration.',
      'Provide your full name, address, and contact number.',
      'Give all details: date, time, location, description of crime, and accused details if known.',
      'Officer writes it in the register — you have the right to have it read back to you.',
      'Sign or put your thumb impression on the FIR.',
      'Collect a FREE copy of the FIR — your legal right under Section 154(2) CrPC.',
      'If police refuse, send written complaint to DSP/SP or file under Section 156(3) before a Magistrate.',
    ],
    tip: 'You can also file an e-FIR on your state police website for offences like theft or missing persons.',
    source: 'local_db',
  },
  cyber: {
    topic: 'Cyber Fraud Complaint',
    explanation:
      'Cyber fraud includes online scams, phishing, UPI fraud, and identity theft. Under IT Act 2000 and IT Amendment Act 2008, these are punishable offences. Act fast — report within 24 hours to freeze fraudulent transactions.',
    steps: [
      'Immediately call National Cyber Crime Helpline: 1930.',
      'Visit cybercrime.gov.in → Report Cyber Crime → Financial Frauds.',
      'Register and file complaint with all details and evidence.',
      'Collect evidence: screenshots, transaction IDs, email headers, chat records.',
      'Inform your bank immediately to freeze the fraudulent transaction.',
      'File a formal FIR at your nearest cyber crime police station.',
      'Contact your bank fraud department for chargeback if applicable.',
    ],
    tip: 'Under Section 66C and 66D of IT Act, cyber fraud is punishable with up to 3 years imprisonment and ₹1 lakh fine.',
    source: 'local_db',
  },
  consumer: {
    topic: 'Consumer Rights Complaint',
    explanation:
      'You are protected under the Consumer Protection Act 2019. You have the right to seek redressal for defective products, deficient services, unfair trade practices, and overcharging.',
    steps: [
      'Send a written complaint to seller/company via email or registered post.',
      'If unresolved within 30 days, call National Consumer Helpline: 1915.',
      'File online complaint at consumerhelpline.gov.in or edaakhil.nic.in.',
      'For claims up to ₹50 lakh → District Consumer Commission.',
      'For ₹50 lakh to ₹2 crore → State Consumer Commission.',
      'For above ₹2 crore → National Consumer Commission (NCDRC).',
      'Keep all bills, receipts, warranties, and correspondence as evidence.',
      'No lawyer required for District Commission — you can file yourself.',
    ],
    tip: 'Under Consumer Protection Act 2019, you can also file complaints about misleading advertisements and e-commerce platforms.',
    source: 'local_db',
  },
  rti: {
    topic: 'Right to Information (RTI) Application',
    explanation:
      'RTI Act 2005 gives every citizen the right to access information held by any public authority. It is a powerful tool for transparency. Any citizen can file RTI — it costs just ₹10.',
    steps: [
      'Identify the Public Information Officer (PIO) of the concerned department.',
      'Write RTI application clearly stating what specific information you need.',
      'Pay ₹10 as application fee (free for BPL cardholders).',
      'Submit by registered post or in person to the PIO.',
      'For central government departments, apply online at rtionline.gov.in.',
      'PIO must respond within 30 days (48 hours for life/liberty matters).',
      'If dissatisfied, file First Appeal with Appellate Authority within 30 days.',
      'If still unsatisfied, file Second Appeal with Central/State Information Commission within 90 days.',
    ],
    tip: 'Do NOT mention your reason for seeking information in RTI application. Just state what information you need.',
    source: 'local_db',
  },
  labour: {
    topic: 'Labour Rights in India',
    explanation:
      'Indian labour laws protect workers from exploitation and ensure fair wages, safe working conditions, and social security. Key laws include the Factories Act, Minimum Wages Act, and Payment of Wages Act.',
    steps: [
      'Identify the violation: non-payment of wages, wrongful termination, unsafe conditions, no PF/ESI.',
      'Raise the issue in writing to your employer or HR department first.',
      'If unresolved, contact the Labour Commissioner in your district.',
      'File a complaint with the Labour Court under the Industrial Disputes Act.',
      'For wage issues, approach the Labour Inspector for an official inspection.',
      'For PF/ESI issues, contact the EPFO/ESIC regional office.',
      'Workers can form or join trade unions under Trade Unions Act 1926.',
    ],
    tip: 'Every state publishes its own Minimum Wage schedule. Your employer is legally bound to pay at least that amount.',
    source: 'local_db',
  },
  bail: {
    topic: 'Understanding Bail in India',
    explanation:
      'Bail is the temporary release of an accused person awaiting trial. Under CrPC, there are three main types: Regular Bail, Anticipatory Bail, and Interim Bail.',
    steps: [
      'Regular Bail (Sec 437/439 CrPC): Applied after arrest in Sessions Court or High Court.',
      'Anticipatory Bail (Sec 438 CrPC): Applied BEFORE arrest when arrest is feared.',
      'Interim Bail: Short-term bail until main application is heard.',
      'Hire an advocate to file the bail application with supporting documents.',
      'Court considers: nature of offence, evidence, flight risk, criminal history.',
      'If denied in Sessions Court, apply in High Court, then Supreme Court.',
      'Bail conditions may include surety, regular police reporting, passport surrender.',
    ],
    tip: 'Under Article 21 of the Constitution, personal liberty is a fundamental right. Bail applications must be decided promptly.',
    source: 'local_db',
  },
};

// ─────────────────────────────────────────────
// HELPER: Detect legal topic from user message
// ─────────────────────────────────────────────
function detectTopic(msg) {
  const m = msg.toLowerCase();
  if (m.includes('fir') || m.includes('police complaint') || m.includes('first information')) return 'fir';
  if (m.includes('cyber') || m.includes('fraud') || m.includes('scam') || m.includes('hacked') || m.includes('upi')) return 'cyber';
  if (m.includes('consumer') || m.includes('product') || m.includes('refund') || m.includes('defect')) return 'consumer';
  if (m.includes('rti') || m.includes('right to information')) return 'rti';
  if (m.includes('labour') || m.includes('worker') || m.includes('salary') || m.includes('wage') || m.includes('fired')) return 'labour';
  if (m.includes('bail') || m.includes('arrest') || m.includes('custody') || m.includes('jail')) return 'bail';
  return null;
}

// ─────────────────────────────────────────────
// HELPER: Call Google Gemini API
// ─────────────────────────────────────────────
async function callGeminiAPI(userMessage) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('xxxxxxxx')) {
    throw new Error('No valid Gemini API key configured in .env');
  }

  // Combine system prompt + user message for Gemini
  // (Gemini uses "contents" array — system context goes as first user turn)
  const response = await axios.post(
    `${GEMINI_API_URL}?key=${apiKey}`,
    {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\nUser Question: ${userMessage}`,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.4,      // Lower = more factual, consistent
        topP: 0.8,
        topK: 40,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000, // 30 second timeout
    }
  );

  // Extract text from Gemini response
  const candidates = response.data?.candidates;
  if (candidates && candidates[0]?.content?.parts[0]?.text) {
    return candidates[0].content.parts[0].text;
  }

  throw new Error('Empty or blocked response from Gemini API');
}

// ─────────────────────────────────────────────
// HELPER: Format local DB entry to structured text
// ─────────────────────────────────────────────
function formatLocalResponse(data) {
  const steps = data.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
  return `📌 TOPIC: ${data.topic}
📖 EXPLANATION: ${data.explanation}
📝 STEPS:
${steps}
💡 TIP: ${data.tip}
⚠️ DISCLAIMER: This is legal information only, not professional legal advice. Please consult a qualified advocate for your specific case.`;
}

// ─────────────────────────────────────────────
// CONTROLLER: POST /api/chat
// ─────────────────────────────────────────────
exports.sendMessage = async (req, res, next) => {
  try {
    const { message, sessionId, language = 'en' } = req.body;

    // ── Validate input ──────────────────────────
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message cannot be empty.' });
    }
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required.' });
    }

    const cleanMsg = message.trim();

    // ── Upsert Session record ───────────────────
    await Session.findOneAndUpdate(
      { sessionId },
      {
        $setOnInsert: { sessionId, language },
        $set: { lastActiveAt: Date.now(), isActive: true },
        $inc: { messageCount: 2 },
      },
      { upsert: true, new: true }
    );

    // ── Save user message to DB ─────────────────
    await Chat.create({ sessionId, role: 'user', message: cleanMsg });

    // ── Generate bot response ───────────────────
    let botText  = '';
    let topicKey = detectTopic(cleanMsg);
    let source   = 'gemini_api';

    if (topicKey && legalDB[topicKey]) {
      // ✅ Fast-path: local knowledge base (no API cost)
      botText = formatLocalResponse(legalDB[topicKey]);
      source  = 'local_db';
      console.log(`📚 Local DB used for topic: ${topicKey}`);
    } else {
      // 🌐 Call Gemini API for other questions
      try {
        botText = await callGeminiAPI(cleanMsg);
        source  = 'gemini_api';
        console.log(`🤖 Gemini API responded successfully`);
      } catch (apiErr) {
        console.warn('⚠️  Gemini API error:', apiErr.message);
        // Fallback: generic helpful response
        botText = `📌 TOPIC: General Legal Query
📖 EXPLANATION: Thank you for your question. For this specific topic, I recommend reaching out to official legal resources directly.
📝 STEPS:
1. Contact NALSA (National Legal Services Authority) Helpline: 15100 for free legal aid
2. Visit your nearest District Legal Services Authority (DLSA) office
3. Check india.gov.in for relevant government department contacts
4. For cyber issues call: 1930 | Consumer issues call: 1915
5. For women helpline call: 181 | Police emergency: 100
💡 TIP: NALSA provides FREE legal aid to women, SC/ST, persons with disabilities, and those earning below ₹1 lakh/year.
⚠️ DISCLAIMER: This is legal information only, not professional legal advice. Please consult a qualified advocate for your specific case.`;
        source = 'fallback';
      }
    }

    // ── Save bot reply to DB ────────────────────
    const botChat = await Chat.create({
      sessionId,
      role    : 'bot',
      message : botText,
      topic   : topicKey || null,
      source,
    });

    // ── Update topics discussed in Session ──────
    if (topicKey) {
      await Session.findOneAndUpdate(
        { sessionId },
        { $addToSet: { topicsDiscussed: topicKey } }
      );
    }

    // ── Send response to frontend ───────────────
    res.status(200).json({
      success: true,
      data: {
        messageId : botChat._id,
        sessionId,
        message   : botText,
        topic     : topicKey,
        source,
        timestamp : botChat.createdAt,
      },
    });

  } catch (err) {
    next(err);
  }
};