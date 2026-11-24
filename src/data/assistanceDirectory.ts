import { AssistanceOrg } from '../types/mebt';

/**
 * Fictional Assistance & Emergency Directory (F08).
 * All contact numbers, emails, and websites are clearly labelled mock demonstration data.
 * No real calls, WhatsApp messages, or external emails are triggered.
 */
export const ASSISTANCE_DIRECTORY: AssistanceOrg[] = [
  {
    id: 'org-emergency-desk',
    name: 'Habesha & Migrant Emergency Legal Protection Desk (Mock Demo)',
    category: 'emergency_legal_protection',
    province: 'Gauteng',
    city: 'Johannesburg',
    summary:
      'Simulated 24/7 emergency referral desk for urgent detention questions, unlawful confiscation concerns, or immediate legal protection guidance. Always free.',
    languages: ['English', 'Amharic', 'Tigrinya'],
    hoursLabel: '24/7 Emergency Helpline (Simulated)',
    isEmergencyFree: true,
    mockPhone: '+27 00 555 0199 (Mock)',
    mockWhatsApp: '+27 00 555 0198 (Mock)',
    mockEmail: 'emergency-demo@example.mebt.invalid',
    mockWebsite: 'https://demo-emergency.mebt.invalid',
    escalationNote:
      'Prepare your location, case reference label, and family contact before initiating an urgent referral.',
    verificationStatus: 'mock_pending_verification',
  },
  {
    id: 'org-refugee-clinic-jhb',
    name: 'Johannesburg Refugee & Asylum Rights Clinic (Mock Demo)',
    category: 'refugee_assistance',
    province: 'Gauteng',
    city: 'Johannesburg',
    summary:
      'Demonstrates a free non-profit legal clinic assisting asylum seekers and recognised refugees with permit renewal blockers, appeals, and family documentation.',
    languages: ['English', 'Amharic', 'Tigrinya', 'Oromo'],
    hoursLabel: 'Mon–Fri, 08:30–16:00 (Mock)',
    isEmergencyFree: true,
    mockPhone: '+27 00 555 0112 (Mock)',
    mockWhatsApp: '+27 00 555 0113 (Mock)',
    mockEmail: 'refugee-clinic-demo@example.mebt.invalid',
    mockWebsite: 'https://demo-refugee-clinic.mebt.invalid',
    escalationNote:
      'Bring your case timeline summary and any copies of prior online renewal receipts when requesting an intake review.',
    verificationStatus: 'mock_pending_verification',
  },
  {
    id: 'org-cape-legal-aid',
    name: 'Cape Metro Community Legal Advice Centre (Mock Demo)',
    category: 'legal_assistance',
    province: 'Western Cape',
    city: 'Cape Town',
    summary:
      'Demonstrates community-based legal advice for permanent residence delays, civil registration obstacles, and administrative fairness letters.',
    languages: ['English', 'Amharic'],
    hoursLabel: 'Mon–Thu, 09:00–15:30 (Mock)',
    isEmergencyFree: true,
    mockPhone: '+27 00 555 0145 (Mock)',
    mockWhatsApp: '+27 00 555 0146 (Mock)',
    mockEmail: 'cape-legal-demo@example.mebt.invalid',
    mockWebsite: 'https://demo-cape-legal.mebt.invalid',
    escalationNote:
      'Export your MEBT case report before requesting an appointment so an advisor can review your documented attempts quickly.',
    verificationStatus: 'mock_pending_verification',
  },
  {
    id: 'org-dha-contact-demo',
    name: 'Civic & Immigration Service Contact Centre (Mock Demo)',
    category: 'government_departments',
    province: 'National',
    city: 'Pretoria / National',
    summary:
      'Demonstration profile illustrating a national administrative department contact channel for citizenship, permanent residence, and civil record inquiries.',
    languages: ['English'],
    hoursLabel: 'Mon–Fri, 08:00–16:30 (Mock)',
    isEmergencyFree: true,
    mockPhone: '+27 00 555 0100 (Mock)',
    mockWhatsApp: 'Not available (Mock)',
    mockEmail: 'civic-inquiries-demo@example.mebt.invalid',
    mockWebsite: 'https://demo-civic-office.mebt.invalid',
    escalationNote:
      'Always request a call reference number or email ticket ID and log it in your MEBT case timeline.',
    verificationStatus: 'mock_pending_verification',
  },
  {
    id: 'org-ombud-demo',
    name: 'Public Administrative Oversight & Complaints Office (Mock Demo)',
    category: 'complaint_institutions',
    province: 'National',
    city: 'Pretoria / Regional Desks',
    summary:
      'Demonstration profile representing an independent administrative oversight body for unresolved delays after direct follow-ups have failed.',
    languages: ['English'],
    hoursLabel: 'Mon–Fri, 08:00–16:00 (Mock)',
    isEmergencyFree: true,
    mockPhone: '+27 00 555 0177 (Mock)',
    mockWhatsApp: '+27 00 555 0178 (Mock)',
    mockEmail: 'oversight-complaints-demo@example.mebt.invalid',
    mockWebsite: 'https://demo-oversight.mebt.invalid',
    escalationNote:
      'Oversight bodies usually require evidence of prior written follow-ups. Attach your saved MEBT correspondence log when preparing an escalation.',
    verificationStatus: 'mock_pending_verification',
  },
  {
    id: 'org-durban-refugee-hub',
    name: 'KZN Habesha & Newcomer Support Network (Mock Demo)',
    category: 'refugee_assistance',
    province: 'KwaZulu-Natal',
    city: 'Durban',
    summary:
      'Demonstrates a community navigation hub offering translation preparation, appointment readiness guidance, and referrals to legal practitioners.',
    languages: ['English', 'Amharic', 'Tigrinya'],
    hoursLabel: 'Tue–Sat, 09:00–15:00 (Mock)',
    isEmergencyFree: true,
    mockPhone: '+27 00 555 0161 (Mock)',
    mockWhatsApp: '+27 00 555 0162 (Mock)',
    mockEmail: 'kzn-support-demo@example.mebt.invalid',
    mockWebsite: 'https://demo-kzn-support.mebt.invalid',
    escalationNote:
      'Community hubs offer administrative organisation support, not formal legal representation.',
    verificationStatus: 'mock_pending_verification',
  },
];
