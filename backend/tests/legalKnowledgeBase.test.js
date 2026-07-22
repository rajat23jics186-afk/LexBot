const { detectTopic, legalDB, formatLocalResponse } = require('../services/legalKnowledgeBase');

describe('detectTopic', () => {
  it('detects FIR-related queries', () => {
    expect(detectTopic('How do I file an FIR?')).toBe('fir');
    expect(detectTopic('I want to make a police complaint')).toBe('fir');
  });

  it('detects cyber fraud queries', () => {
    expect(detectTopic('My UPI account got hacked')).toBe('cyber');
    expect(detectTopic('I think this is a scam')).toBe('cyber');
  });

  it('detects consumer rights queries', () => {
    expect(detectTopic('I want a refund for a defective product')).toBe('consumer');
  });

  it('detects RTI queries', () => {
    expect(detectTopic('How to file an RTI application?')).toBe('rti');
  });

  it('detects labour queries', () => {
    expect(detectTopic('My employer is not paying my salary')).toBe('labour');
  });

  it('detects bail queries', () => {
    expect(detectTopic('What is the process for anticipatory bail?')).toBe('bail');
  });

  it('returns null for unrelated/unknown queries', () => {
    expect(detectTopic('What is the weather today?')).toBeNull();
  });

  it('is case-insensitive', () => {
    expect(detectTopic('FIR KAISE FILE KAREN')).toBe('fir');
  });
});

describe('formatLocalResponse', () => {
  it('includes topic, explanation, numbered steps, tip, and disclaimer', () => {
    const formatted = formatLocalResponse(legalDB.fir);

    expect(formatted).toContain('📌 TOPIC: FIR Filing Procedure');
    expect(formatted).toContain('1. Visit the nearest police station');
    expect(formatted).toContain('💡 TIP:');
    expect(formatted).toContain('⚠️ DISCLAIMER:');
  });
});
