'use strict';
/*
 * Panasuna Chits website - zero-dependency Node.js server.
 * Serves the page, the background video (bg.mp4) with its poster (poster.jpg),
 * and the enrollment endpoint. Run with: node server.js
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const MEDIA = {
  '/bg.mp4': { file: 'bg.mp4', type: 'video/mp4' },
  '/poster.jpg': { file: 'poster.jpg', type: 'image/jpeg' },
  '/logo.png': { file: 'logo.png', type: 'image/png' },
};

const DEFAULTS = { value: 500000, months: 25 };

/* ------------------------------------------------------------------ *
 * Copy (from A.md)
 * ------------------------------------------------------------------ */
const SITE = {
  meta: {
    title: 'Panasuna Chits - Modern Collective Wealth',
    description: 'Panasuna Chits Private Limited: Trusted chit fund savings and flexible borrowing schemes in Tamil Nadu since 1995. Registered under the Chit Funds Act 1982.',
  },
  marquee: [
    'GOVT. OF TAMIL NADU REGISTERED CHIT FUND',
    'CHIT FUNDS ACT 1982 COMPLIANT',
    'CIN: U65992TZ1995PTC005676',
    '30 YEARS OF COLLECTIVE PROSPERITY (1995-2026)',
    'SALEM HEADQUARTERS',
    'ICFA MEMBER',
    'ZERO MARKET RISK',
    'MONTHLY AUCTION DIVIDENDS',
    '100% SECURE BANK GUARANTEE',
  ],
  nav: {
    brand: 'PANASUNA CHITS',
    tagline: 'PVT LTD · SALEM · ESTD 1995',
    links: [
      { label: 'CHIT SCHEMES', href: '#schemes' },
      { label: 'CALCULATOR', href: '#calculator' },
      { label: 'HOW IT WORKS', href: '#how' },
      { label: 'AUCTIONS', href: '#auctions' },
      { label: 'GOVT LICENSE', href: '#trust' },
    ],
    cta: 'JOIN A CHIT',
    mobileExtras: [
      { label: 'CALCULATE', href: '#calculator' },
      { label: 'CIN & ROC', href: '#trust' },
    ],
  },
  hero: {
    badges: ['ESTABLISHED JAN 6, 1995 · 30 YEARS OF TRUST', '14% – 18% DIVIDENDS', '24H PRIZE DISBURSEMENT', 'CHIT FUNDS ACT 1982'],
    headline: 'PANASUNA CHITS',
    subtext: 'Small monthly coin investments grow into substantial wealth. Save with guaranteed auction dividends and secure emergency credit when you need it most.',
    buttons: ['EXPLORE CHIT SCHEMES', 'CALCULATE MY RETURNS', 'ENROLL IN NEW BATCH'],
  },
  calculator: {
    badge: 'DYNAMIC DIVIDEND ESTIMATOR',
    heading: 'CHIT CALCULATOR',
    intro: "Simulate your monthly dividend yield or early auction borrowing capital with Panasuna's transparent calculations.",
    objectives: [
      { key: 'save', label: 'SAVINGS & DIVIDENDS' },
      { key: 'borrow', label: 'EMERGENCY BORROWING' },
    ],
    presets: [
      [100000, '₹1 L'],
      [250000, '₹2.5 L'],
      [500000, '₹5 L'],
      [1000000, '₹10 L'],
      [2500000, '₹25 L'],
      [5000000, '₹50 L'],
    ],
    tenures: [25, 40, 50],
    cta: 'APPLY FOR THIS CHIT PLAN',
    disclaimer: '*Subject to Chit Funds Act 1982 guidelines and security verification.',
  },
  schemes: {
    badge: 'GOVERNMENT APPROVED GROUPS',
    heading: 'FEATURED SCHEMES',
    intro: 'Choose from micro-savings to high-volume commercial groups with guaranteed bank reserves and transparent monthly auctions.',
    filters: [
      { key: 'all', label: 'ALL SCHEMES' },
      { key: 'household', label: 'HOUSEHOLD & GOLD (₹1L - ₹2.5L)' },
      { key: 'business', label: 'BUSINESS EXPANSION (₹5L - ₹10L)' },
      { key: 'commercial', label: 'COMMERCIAL & HNI (₹25L - ₹50L)' },
    ],
  },
  how: {
    badges: ['TRANSPARENT 4-STAGE CYCLE', 'ZERO DEFAULTS', 'NO COLLATERAL REQUIRED'],
    heading: 'HOW A CHIT FUND WORKS',
    intro: 'A time-tested mutual financial model governed by the Central Chit Funds Act 1982. Save steadily or borrow without interest burdens.',
    steps: [
      { title: 'GROUP FORMATION & GOVT FILING', tag: '100% SECURE', body: '25 to 50 verified subscribers form a regulated chit group. Panasuna pre-deposits 100% of the aggregate chit value as a fixed deposit guarantee with the Govt Registrar before starting.' },
      { title: 'MONTHLY POOLED CONTRIBUTION', tag: 'TRANSPARENT', body: 'Each subscriber pays their monthly installment into the common chit kitty (e.g. ₹20,000 for a ₹10 Lakh group). Payments can be made via UPI, NetBanking, or branch counter.' },
      { title: 'OPEN REVERSE AUCTION', tag: 'INSTANT CAPITAL', body: 'Members in need of urgent funds bid an auction discount (up to 30% or 40% statutory cap). The subscriber accepting the highest discount wins the lump sum prize money within 24 hours.' },
      { title: 'EQUAL DIVIDEND DISTRIBUTION', tag: '14%-18% GAIN', body: "The auction discount (minus 5% foreman fee) is split equally among ALL group members as an auction dividend, reducing everyone's next installment by thousands of rupees!" },
    ],
    footer: 'GOVT REGULATED',
    digital: {
      badge: 'DIGITAL SUBSCRIBER ACCESS',
      heading: 'Track Auction Dates, Dividends & Pay Online',
      body: 'Access your monthly passbook statements, participate in digital proxy auctions, and settle installments via UPI/Netbanking from anywhere.',
      app: 'PANASUNA APP · PORTAL ACCESS',
      cta: 'GET STARTED',
    },
  },
  auctions: {
    badge: 'MONTHLY PUBLIC AUCTIONS',
    heading: 'AUCTION BULLETIN',
    tabs: [
      { key: 'upcoming', label: 'UPCOMING AUCTIONS' },
      { key: 'protocols', label: 'BIDDING PROTOCOLS' },
    ],
    location: 'Chinnakadai HQ & Online',
    cta: 'ATTEND / BID PROXY',
    upcoming: [
      { series: 'PS-5L-25', group: 'Batch 2024-C (Salem Central)', value: 500000, month: 14, total: 25, date: 'Nov 05, 2026', time: '11:00 AM IST', prev: 2850 },
      { series: 'PS-10L-50', group: 'Batch 2025-A (Agraharam Branch)', value: 1000000, month: 8, total: 50, date: 'Nov 12, 2026', time: '03:30 PM IST', prev: 3600 },
      { series: 'PS-25L-50', group: 'Batch 2024-E (Chinnakadai St HQ)', value: 2500000, month: 22, total: 50, date: 'Nov 18, 2026', time: '10:30 AM IST', prev: 8900 },
      { series: 'PS-1L-25', group: 'Batch 2026-B (Retail Micro)', value: 100000, month: 4, total: 25, date: 'Nov 25, 2026', time: '04:00 PM IST', prev: 620 },
    ],
    protocolsTitle: 'Panasuna Chits Reverse Auction Conduct Guidelines',
    protocols: [
      { title: 'Reverse Bidding Ceiling', body: 'As mandated by Tamil Nadu Chit Fund Rules, the maximum auction discount cannot exceed statutory limits (30% to 40%). If multiple members bid the ceiling, lots are drawn transparently.' },
      { title: 'Security Verification', body: 'Prize winners furnish simple guarantor documentation (salaried individuals, property deeds, or government employees) ensuring zero bad debt exposure for other members.' },
      { title: '24-Hour NEFT Disbursement', body: 'Once security vetting is confirmed, the prize sum is directly transferred via RTGS/NEFT to the subscriber\'s registered bank account within one banking day.' },
    ],
  },
  trust: {
    badge: 'STATUTORY GOVERNANCE & 30-YEAR LEGACY',
    heading: 'TRUST & LEGAL',
    intro: 'Complete transparency since January 6, 1995. Fully registered with the Registrar of Chits, Govt. of Tamil Nadu.',
    facts: [
      { number: '30+', label: 'Years of Operation', detail: 'Serving Salem and Tamil Nadu continuously since Jan 1995' },
      { number: '100%', label: 'Bank Guarantee with Registrar', detail: 'Full Chit Value pre-deposited with Govt. of Tamil Nadu before auctioning' },
      { number: '₹180Cr+', label: 'Cumulative Payouts', detail: 'Seamless, on-time auction prize disbursements with zero defaults' },
      { number: '15,000+', label: 'Prospering Subscribers', detail: 'Generations of families, traders, doctors, and enterprises' },
    ],
    certificate: {
      heading: 'Government Registration Certificate',
      name: 'PANASUNA CHITS PRIVATE LIMITED',
      text: 'Incorporated under the Companies Act, 1956 and actively registered with the Registrar of Companies (ROC) Coimbatore / Tamil Nadu.',
      cin: 'U65992TZ1995PTC005676',
      incorporated: '06 JAN 1995',
      highlightsTitle: 'Highlights',
      highlights: [
        { title: '100% Bank Guarantee', body: 'Every single chit group is backed by a 100% value fixed deposit with nationalized banks pledged to the Registrar of Chits.' },
        { title: 'ICFA Association Member', body: 'Proud accredited member of the Incorporated Chit Funds Association (ICFA), upholding rigorous ethical lending benchmarks.' },
        { title: 'Prompt Direct Settlement', body: 'Auction payouts are disbursed within 24 hours directly to registered beneficiary accounts via secure RTGS/NEFT protocols.' },
      ],
    },
    faqHeading: 'Frequently Asked Questions',
    faqBadge: 'CLEAR ANSWERS FOR SMARTER SAVINGS',
    faq: [
      { q: 'Is Panasuna Chits legally registered and regulated?', a: 'Yes, Panasuna Chits Private Limited is an incorporated non-banking chit entity (CIN: U65992TZ1995PTC005676) governed strictly under the Chit Funds Act, 1982 and Tamil Nadu Chit Funds Rules. We are active members of the Incorporated Chit Funds Association (ICFA) with over 30 years of impeccable regulatory standing.' },
      { q: 'How is my monthly money protected from default?', a: 'Under Section 20 of the Chit Funds Act, 1982, before commencing any chit series, Panasuna Chits must pre-deposit 100% of the aggregate chit value in a nationalized bank as a Fixed Deposit in the name of the Registrar of Chits. This statutory reserve guarantees that your funds remain 100% safe.' },
      { q: 'What is the dividend and how do I earn 14% - 18% annualized return?', a: 'When an auction takes place, borrowers bid a discount to access funds early. After deducting the 5% statutory foreman commission, the entire remaining discount is distributed back to all non-prized members as a monthly dividend deduction, yielding compound returns significantly higher than bank savings or recurring deposits.' },
      { q: 'Can I withdraw or bid for money if I have an urgent emergency?', a: 'Yes! From the 2nd month onwards, any active subscriber can participate in the monthly reverse auction (in person at our Salem branch or via our verified online portal) and take home the lump-sum prize money within 24 hours of submitting basic security guarantees.' },
    ],
  },
  cta: {
    heading: 'START SAVING IN 2026 WITH PANASUNA CHITS',
    tags: 'Government Protected · 100% Fixed Deposit Reserve · Transparent Digital Auctions',
    button: 'ENROLL IN CURRENT SERIES',
  },
  footer: {
    about: 'Panasuna Chits Private Limited is an esteemed, government-registered chit fund company founded in 1995 in Salem, Tamil Nadu. Empowering families, merchants, and small businesses with disciplined savings and collateral-free credit.',
    tags: ['CIN: U65992TZ1995PTC005676', 'ICFA ACCREDITED'],
    explore: [
      { label: 'Household & Gold (₹1L - ₹2.5L)', href: '#schemes' },
      { label: 'Business Capital (₹5L - ₹10L)', href: '#schemes' },
      { label: 'Corporate Syndicate (₹25L - ₹50L)', href: '#schemes' },
      { label: 'Dividend Calculator', href: '#calculator' },
      { label: 'Live Auction Calendar', href: '#auctions' },
    ],
    governance: ['Chit Funds Act, 1982', 'Tamil Nadu Chit Fund Rules', '100% FDR Deposit Mandate', 'Reverse Bidding Transparency', 'ICFA Code of Ethics'],
    contact: {
      address: '151-A (Upstairs), Chinnakadai Street, Salem, Tamil Nadu - 636001',
      phones: [
        { label: '+91 (0427) 226-5676', tel: '+914272265676' },
        { label: '226-1995', tel: '+914272261995' },
      ],
      email: 'contact@panasunachits.com',
      hours: 'Mon - Sat: 9:30 AM - 6:30 PM',
    },
    legal: '© 1995–2026 Panasuna Chits Private Limited. All rights reserved. Registered with Registrar of Companies (ROC) & State Registrar of Chits, Tamil Nadu.',
  },
  enroll: {
    heading: 'JOIN PANASUNA CHIT BATCH',
    intro: 'Fill in your details below to lock your subscriber slot for the upcoming monthly series.',
    submit: 'SUBMIT ENROLLMENT REQUEST',
    note: 'No upfront fees. Regulated under Chit Funds Act 1982.',
    done: {
      badge: 'ENROLLMENT CONFIRMED',
      heading: 'APPLICATION RECEIVED!',
      branch: 'Chinnakadai St, Salem (HQ)',
      close: 'CLOSE CONFIRMATION',
    },
  },
};

/* Chit schemes (Featured Schemes table in A.md) */
const SCHEMES = [
  { code: 'PS-1L-25', cat: 'household', title: 'Grihalakshmi Monthly Savings', badge: 'POPULAR FOR FAMILIES', value: 100000, tenure: 25, subscribers: 25, gross: 4000, avgNet: 3450, dividend: 13750, maxBorrow: 70000, slots: 4, launch: '1st of Next Month', bestFor: 'School fees, festive jewelry, and emergency backup fund' },
  { code: 'PS-2.5L-50', cat: 'household', title: 'Suraksha Long-Term Wealth', badge: 'STEADY DIVIDEND', value: 250000, tenure: 50, subscribers: 50, gross: 5000, avgNet: 4100, dividend: 45000, maxBorrow: 175000, slots: 6, launch: '10th of Next Month', bestFor: 'Gold accumulation, daughter marriage deposit, two-wheeler purchase' },
  { code: 'PS-5L-25', cat: 'business', title: 'Vyapar Capital Booster', badge: 'HIGH DEMAND', value: 500000, tenure: 25, subscribers: 25, gross: 20000, avgNet: 17200, dividend: 70000, maxBorrow: 350000, slots: 2, launch: '5th of Next Month', bestFor: 'Retail inventory stocking, working capital, trade machinery' },
  { code: 'PS-10L-50', cat: 'business', title: 'Udyog Growth Series', badge: 'PRIME BIZ CHOICE', value: 1000000, tenure: 50, subscribers: 50, gross: 20000, avgNet: 16400, dividend: 180000, maxBorrow: 700000, slots: 5, launch: '15th of Next Month', bestFor: 'SME factory expansion, commercial lease deposit, multi-axle vehicle' },
  { code: 'PS-25L-50', cat: 'commercial', title: 'Samruddhi Commercial Series', badge: 'COMMERCIAL GRADE', value: 2500000, tenure: 50, subscribers: 50, gross: 50000, avgNet: 41500, dividend: 425000, maxBorrow: 1750000, slots: 3, launch: '20th of Next Month', bestFor: 'Real estate acquisition, turnkey industrial equipment, wholesale expansion' },
  { code: 'PS-50L-50', cat: 'commercial', title: 'Imperial Corporate Syndicate', badge: 'FLAGSHIP SERIES', value: 5000000, tenure: 50, subscribers: 50, gross: 100000, avgNet: 83000, dividend: 850000, maxBorrow: 3500000, slots: 1, launch: '25th of Next Month', bestFor: 'HNI high-yield treasury, institutional scale capital, export consignment financing' },
];

const TOWNS = ['Salem (HQ)', 'Erode', 'Namakkal', 'Dharmapuri', 'Coimbatore', 'Tirupur', 'Chennai', 'Other Tamil Nadu / South'];
const GOALS = ['DISCIPLINED SAVINGS', 'BUSINESS', 'LOAN LIQUIDITY'];

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */
const esc = (v) => String(v)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const rupee = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

/* Chit calculation (A.md "Calculation logic"). Kept self-contained so the
 * same source is shipped to the browser for live updates. */
function calculate(value, months) {
  const gross = value / months;
  const avgDividend = gross * 0.16;
  const netMonthly = gross - avgDividend;
  const discount = value * 0.28;
  return {
    netMonthly: Math.round(netMonthly),
    totalDividends: Math.round(avgDividend * months),
    totalOutlay: Math.round(netMonthly * months),
    discount: Math.round(discount),
    netPrize: Math.round(value - discount),
  };
}

const ARROW = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 12h8m-3-3 3 3-3 3"/></svg>';
const BURGER_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';

/* ------------------------------------------------------------------ *
 * Styles (original panasuna-site design tokens and classes)
 * ------------------------------------------------------------------ */
const CSS = `
:root{--font-heading:'Helvetica Now Display Bold','Helvetica Neue',Arial,sans-serif;--font-body:'Inter',system-ui,sans-serif;--text:#192837;--accent:#7342E2;--bg:#F2F2EE;--glass:rgba(242,242,238,.66);--line:rgba(25,40,55,.12)}
*{box-sizing:border-box;margin:0}html{scroll-behavior:smooth;scroll-padding-top:84px}
body{font-family:var(--font-body);color:var(--text);line-height:1.6;background:#cfc8c5;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
.bg{position:fixed;inset:0;z-index:-2;overflow:hidden;background:#cfc8c5 url(/poster.jpg) center/cover no-repeat}
.bg video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:62% 50%;pointer-events:none}
.bg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(242,242,238,0) 0%,rgba(242,242,238,.10) 55%,rgba(242,242,238,.26) 100%);transition:opacity .6s ease}
h1,h2,h3{font-family:var(--font-heading);font-weight:400;letter-spacing:-.01em;line-height:1.08}
.wrap{max-width:1280px;margin:0 auto;padding:0 clamp(20px,4vw,32px)}
section{padding:clamp(56px,9vw,104px) 0}
.eyebrow{font-size:.78rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:12px}
h2{font-size:clamp(1.65rem,4.2vw,2.75rem);margin-bottom:14px}
.lead{max-width:600px;opacity:.82;margin-bottom:36px}
.glass{background:var(--glass);backdrop-filter:blur(22px) saturate(1.35);-webkit-backdrop-filter:blur(22px) saturate(1.35);border:1px solid rgba(255,255,255,.6);border-radius:24px;box-shadow:0 8px 40px rgba(25,40,55,.10),inset 0 1px 0 rgba(255,255,255,.75)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:44px;padding:12px 24px;border-radius:50px;border:0;font:600 .95rem var(--font-body);cursor:pointer;text-decoration:none;transition:transform .25s cubic-bezier(.22,1,.36,1),filter .25s,box-shadow .25s;color:var(--text);background:var(--bg)}
.btn.p{background:var(--accent);color:#fff;box-shadow:0 4px 24px rgba(115,66,226,.28)}
.btn.p{background:linear-gradient(135deg,#8454ee,#6431d6)}
.btn.p:hover{box-shadow:0 8px 32px rgba(115,66,226,.42)}
.btn:hover{transform:scale(1.04);filter:brightness(1.06)}.btn:active{transform:scale(.96)}
:focus-visible{outline:3px solid var(--accent);outline-offset:3px}
[hidden]{display:none!important}
/* marquee (A.md banner) */
.marquee{position:relative;z-index:21;overflow:hidden;background:rgba(25,40,55,.94);color:var(--bg);font-size:.72rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap}
.marquee-track{display:flex;width:max-content;animation:marq 70s linear infinite}
.marquee-track>div{display:flex;flex-shrink:0}
.marquee span{padding:11px 0;margin:0 26px}
.marquee span::after{content:"·";margin-left:26px;opacity:.55}
@keyframes marq{to{transform:translateX(-50%)}}
/* nav */
nav{position:sticky;top:0;z-index:20;padding:14px 0}
.bar{display:flex;align-items:center;justify-content:space-between;padding:10px 12px 10px 20px;border-radius:50px;transition:box-shadow .3s,background .3s}
.brand{display:flex;align-items:center;gap:10px;font:400 1.05rem var(--font-heading);color:var(--text);text-decoration:none}
.brand img{display:block;height:54px;width:auto;max-width:100%;mix-blend-mode:multiply}
@media(max-width:560px){.brand img{height:42px}}
.links{display:flex;gap:26px}
.links a{position:relative;font-size:.9rem;font-weight:500;color:var(--text);text-decoration:none;opacity:.85;transition:opacity .2s}
.links a:hover{opacity:.5}
.links a::after{content:"";position:absolute;left:0;right:0;bottom:-4px;height:2px;border-radius:2px;background:var(--accent);transform:scaleX(0);transform-origin:left;transition:transform .3s cubic-bezier(.22,1,.36,1)}
.links a:hover::after{transform:scaleX(1)}
.cta{display:flex;gap:8px}
.burger{display:none;background:none;border:0;width:44px;height:44px;cursor:pointer;color:var(--text)}
nav.scrolled .bar{box-shadow:0 14px 48px rgba(25,40,55,.18);background:rgba(242,242,238,.8)}
@media(max-width:900px){.links,.cta{display:none}.burger{display:block}.menu.open{display:flex}}
.menu{display:none;flex-direction:column;gap:4px;margin-top:8px;padding:16px;border-radius:24px}
.menu a{padding:12px;color:var(--text);text-decoration:none;font-weight:500}
@media(min-width:901px){.menu{display:none!important}}
/* hero */
.hero{min-height:calc(100svh - 110px);display:flex;align-items:center;padding-top:clamp(40px,8vw,72px)}
.hero .wrap{width:100%}
.hero h1{font-size:clamp(2.1rem,6.4vw,4.4rem);margin-bottom:24px;max-width:780px;letter-spacing:-.025em}
.hero p{font-size:clamp(.95rem,2.5vw,1.15rem);opacity:.82;max-width:560px;margin-bottom:32px}
.hero-cta{display:flex;flex-wrap:wrap;gap:12px}
.hero-cta .arrow{min-width:210px;justify-content:space-between;gap:32px}
.chips{display:flex;flex-wrap:wrap;gap:12px;margin-top:40px}
.chips.tight{margin:0 0 28px}
.chip{display:inline-flex;align-items:center;gap:10px;padding:12px 18px;border-radius:50px;font-size:.88rem;font-weight:600}
.chip::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 4px rgba(115,66,226,.18);flex-shrink:0}
/* shared cards */
.g3{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.card{padding:28px;transition:transform .3s cubic-bezier(.22,1,.36,1),box-shadow .3s}
.card:hover{transform:translateY(-4px);box-shadow:0 18px 56px rgba(25,40,55,.16),inset 0 1px 0 rgba(255,255,255,.8)}
.card h3{font-size:1.25rem;margin:14px 0 8px}
.card p{font-size:.94rem;opacity:.82}
.ico{width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,#8a5cf0,#5b2fcf);box-shadow:0 6px 18px rgba(115,66,226,.35);color:#fff;display:grid;place-items:center;font:700 .82rem var(--font-body);letter-spacing:.04em}
.tag{display:inline-flex;align-items:center;padding:6px 12px;border-radius:50px;background:rgba(115,66,226,.12);color:var(--accent);font-size:.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap}
.rows{list-style:none;padding:0}
.rows li{display:flex;justify-content:space-between;align-items:baseline;gap:16px;font-size:.9rem;padding:9px 0;border-top:1px solid var(--line)}
.rows li>span{opacity:.8}
.rows strong{text-align:right;font-weight:600}
/* filters / pills (also used for tabs) */
.tools{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:24px;align-items:center}
.tools button{min-height:44px;padding:0 18px;border-radius:50px;border:1px solid var(--line);background:var(--glass);font:500 .88rem var(--font-body);color:var(--text);cursor:pointer;transition:background .25s,color .25s}
.tools button[aria-pressed=true]{background:var(--text);color:#fff}
/* plans */
.plan{padding:24px;display:flex;flex-direction:column}
.plan small{opacity:.65;font-size:.78rem;text-transform:uppercase;letter-spacing:.08em;font-weight:600}
.plan b{display:block;font:400 1.9rem var(--font-heading);margin:2px 0 12px}
.plan h3{font-size:1.2rem;margin:4px 0 6px}
.plan .rows{margin-top:12px}
.plan .btn{width:100%;margin-top:auto}
.sc-top{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px}
.best{font-size:.88rem;opacity:.85;margin:14px 0 0}
.best small{display:block;font-size:.72rem;opacity:.65;text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:2px}
.slots{font-size:.82rem;font-weight:700;color:var(--accent);margin:14px 0 0}
#schemeGrid .plan .btn{margin-top:18px}
/* calculator */
.calc{display:grid;grid-template-columns:1.1fr 1fr;gap:20px;align-items:start}
@media(max-width:800px){.calc{grid-template-columns:1fr}}
.ctrl,.sum{padding:clamp(24px,4vw,40px)}
.ctrl-label{display:block;font-size:.75rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.65;margin:26px 0 12px}
.ctrl>.ctrl-label:first-child,.sum>.ctrl-label:first-child{margin-top:0}
.calc .tools{margin-bottom:0}
.calc-value{display:block;font:400 clamp(1.8rem,4vw,2.4rem)/1.1 var(--font-heading);color:var(--accent);margin-bottom:14px}
.calc input[type=range]{width:100%;accent-color:var(--accent);min-height:44px;cursor:pointer}
.sum .tag{margin-bottom:6px}
.sum-val{display:block;font:400 clamp(2.2rem,5vw,3.2rem)/1.05 var(--font-heading);color:var(--accent);margin:4px 0 10px}
.sum-note{font-size:.88rem;opacity:.8;margin-bottom:18px}
.sum .rows{margin-top:6px}
.sum .btn.p{width:100%;margin:22px 0 14px}
.disclaimer{font-size:.76rem;opacity:.6}
/* how it works */
.step-foot{margin-top:18px;padding-top:12px;border-top:1px solid var(--line);font-size:.7rem;font-weight:700;letter-spacing:.12em;opacity:.6}
.split{display:grid;grid-template-columns:1.2fr 1fr;gap:24px;align-items:center;margin-top:20px;padding:clamp(24px,4vw,40px)}
@media(max-width:800px){.split{grid-template-columns:1fr}}
.split h3{font-size:clamp(1.4rem,3vw,1.9rem);margin:14px 0 10px}
.app{padding:28px;border-radius:20px;display:flex;flex-direction:column;gap:16px;align-items:flex-start}
.app small{font-size:.74rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.7}
/* auctions */
#aucUpcoming{margin-top:20px}
#aucProtocols{margin-top:20px;padding:clamp(24px,4vw,40px)}
#aucProtocols h3{font-size:clamp(1.3rem,3vw,1.7rem);margin-bottom:12px}
.prev small{display:block;font-size:.72rem;opacity:.65;font-weight:500}
.protocols{padding-left:22px;display:grid;gap:14px;margin-top:14px}
.protocols li::marker{color:var(--accent);font-weight:700}
.protocols strong{font-weight:700}
/* trust */
.stat{display:block;font:400 clamp(2.1rem,5vw,3rem)/1 var(--font-heading);color:var(--accent);margin-bottom:12px}
.cert{margin-top:20px;padding:clamp(24px,4vw,40px)}
.cert h3{font-size:clamp(1.4rem,3vw,1.9rem);margin:12px 0 10px}
.cert>p{opacity:.85;max-width:720px}
.cert .rows{margin:18px 0 24px}
.hl-title{font-size:.75rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:12px}
.hl{list-style:none;padding:0;display:grid;gap:12px}
.hl li{position:relative;padding-left:22px;font-size:.94rem}
.hl li::before{content:"";position:absolute;left:0;top:.6em;width:8px;height:8px;border-radius:50%;background:var(--accent)}
.hl strong{font-weight:700}
.sub{font-size:clamp(1.4rem,3.2vw,1.9rem);margin:56px 0 8px}
.faq-badge{margin-bottom:20px}
summary{list-style:none;cursor:pointer;min-height:56px;padding:12px 0;display:flex;align-items:center;justify-content:space-between;gap:16px;font:400 1.15rem/1.3 var(--font-heading)}
summary::-webkit-details-marker{display:none}
summary::after{content:"+";font:300 1.6rem var(--font-body);color:var(--accent);transition:transform .3s;flex-shrink:0}
details[open] summary::after{transform:rotate(45deg)}
details{padding:0 24px;margin-bottom:12px;transition:box-shadow .3s}
details:hover{box-shadow:0 12px 44px rgba(25,40,55,.14),inset 0 1px 0 rgba(255,255,255,.75)}
details p{padding-bottom:20px;opacity:.85;max-width:760px}
/* CTA + footer */
.quote{padding:clamp(28px,5vw,56px);text-align:center}
.quote h2{max-width:820px;margin:0 auto 14px;font-size:clamp(1.6rem,4vw,2.6rem)}
.quote .tags-line{opacity:.8;font-size:.92rem;margin-bottom:26px}
.site-foot{padding:clamp(48px,7vw,72px) 0 28px;font-size:.9rem;opacity:1;text-align:left;margin-top:8px}
.foot-grid{display:grid;grid-template-columns:1.3fr 1fr 1fr 1.2fr;gap:32px}
@media(max-width:900px){.foot-grid{grid-template-columns:1fr 1fr}}
@media(max-width:560px){.foot-grid{grid-template-columns:1fr}}
.site-foot h4{font-family:var(--font-heading);font-weight:400;font-size:1.05rem;margin-bottom:12px}
.site-foot ul{list-style:none;padding:0;display:grid;gap:8px}
.site-foot a{color:var(--text);text-decoration:none;opacity:.85;transition:opacity .2s}
.site-foot a:hover{opacity:.5}
.site-foot p+p{margin-top:8px}
.site-foot .tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
.site-foot .tags span{padding:8px 14px;border-radius:50px;background:rgba(255,255,255,.6);font-size:.74rem;font-weight:600;letter-spacing:.04em}
.foot-logo{display:block;height:60px;width:auto;max-width:100%;margin-bottom:16px;mix-blend-mode:multiply}
.legal{margin-top:40px;padding-top:20px;border-top:1px solid var(--line);font-size:.8rem;opacity:.7;display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px}
/* enrollment modal */
dialog.modal{width:min(560px,calc(100vw - 32px));max-height:calc(100svh - 32px);overflow:auto;border:0;padding:0;background:var(--bg);color:var(--text);border-radius:24px;box-shadow:0 30px 90px rgba(25,40,55,.35)}
dialog.modal::backdrop{background:rgba(25,40,55,.4);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.modal-body{position:relative;padding:clamp(24px,4vw,36px)}
.modal h2{font-size:clamp(1.5rem,4vw,2.1rem);padding-right:44px;margin-bottom:10px}
.modal .lead{margin-bottom:22px}
.modal .close{position:absolute;top:14px;right:14px;width:44px;height:44px;border:0;border-radius:50%;background:var(--glass);font-size:1.5rem;line-height:1;cursor:pointer;color:var(--text)}
.field{margin-bottom:16px}
.field label{display:block}
.field .lbl{display:block;font-size:.75rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.7;margin-bottom:6px}
.field input,.field select{width:100%;min-height:48px;padding:0 16px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.75);font:500 .95rem var(--font-body);color:var(--text)}
.field.bad input,.field.bad select{border-color:#B3261E}
.err{display:block;color:#B3261E;font-size:.82rem;margin-top:6px}
.err:empty{display:none}
.modal .btn.p{width:100%;margin-top:6px}
.modal-note{font-size:.8rem;opacity:.7;margin-top:14px;text-align:center}
.receipt{margin:18px 0 24px}
/* reveal + hint + peek (original behaviour) */
.rv{opacity:0;transform:translateY(28px);transition:opacity .6s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1)}
.rv.in{opacity:1;transform:none}
.hero .wrap>.rv:nth-child(1){transition-delay:.05s}.hero .wrap>.rv:nth-child(2){transition-delay:.15s}.hero .wrap>.rv:nth-child(3){transition-delay:.25s}.hero .wrap>.rv:nth-child(4){transition-delay:.35s}
@media(prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important}.rv{opacity:1;transform:none}.marquee-track{animation:none}}
@media(max-width:700px){.bg::after{background:linear-gradient(180deg,rgba(242,242,238,.5),rgba(242,242,238,.3))}.bg video{object-position:70% 50%}}
nav,main,footer,.marquee{transition:opacity .55s cubic-bezier(.22,1,.36,1),transform .65s cubic-bezier(.22,1,.36,1),filter .55s}
body.peek nav,body.peek main,body.peek footer,body.peek .marquee{opacity:0;transform:scale(.985);filter:blur(10px);pointer-events:none}
body.peek{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;cursor:grabbing}
body.peek .bg::after{opacity:0}
.hint{position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom));z-index:40;transform:translate(-50%,12px);padding:10px 18px;border-radius:50px;font-size:.84rem;font-weight:600;opacity:0;pointer-events:none;transition:opacity .4s,transform .4s cubic-bezier(.22,1,.36,1);white-space:nowrap}
.hint.show{opacity:1;transform:translate(-50%,0)}
`;

/* ------------------------------------------------------------------ *
 * Browser script. Uses the same calculate() as the server, so the
 * defaults rendered in HTML and the live updates always agree.
 * ------------------------------------------------------------------ */
const CLIENT_JS = `
(function () {
  'use strict';
  var calculate = ${calculate.toString()};
  var $ = function (s, root) { return (root || document).querySelector(s); };
  var $$ = function (s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); };
  var rupee = function (n) { return '₹' + Math.round(n).toLocaleString('en-IN'); };
  var calmMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* mobile menu */
  var burger = $('.burger'), menu = $('.menu');
  burger.onclick = function () {
    var open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  };
  $$('.menu a').forEach(function (a) {
    a.onclick = function () { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); };
  });

  /* enrollment dialog */
  var dlg = $('#enroll'), form = $('#enrollForm');
  var formView = $('#enrollFormView'), doneView = $('#enrollDone');
  var FIELDS = ['scheme', 'name', 'mobile', 'town', 'goal'];

  function showForm() { formView.hidden = false; doneView.hidden = true; $('#formErr').textContent = ''; }
  function openEnroll(code) {
    if (code) form.elements.scheme.value = code;
    if (!dlg.open) dlg.showModal();
    form.elements.name.focus();
  }
  function setErr(field, msg) {
    var box = form.elements[field].closest('.field');
    box.classList.toggle('bad', !!msg);
    box.querySelector('.err').textContent = msg || '';
  }
  function fail(field, msg) {
    if (field && form.elements[field]) { setErr(field, msg); form.elements[field].focus(); }
    else { $('#formErr').textContent = msg; }
  }
  function showDone(r, d) {
    $('[data-d=name]').textContent = d.name.trim();
    $('[data-d=mobile]').textContent = d.mobile.replace(/\\s+/g, '');
    $('[data-d=receipt]').textContent = r.receipt + ' (PROVISIONAL SEAT)';
    $('[data-d=group]').textContent = r.group;
    $('[data-d=tenure]').textContent = r.tenure + ' months';
    $('[data-d=net]').textContent = rupee(r.monthlyNet);
    formView.hidden = true;
    doneView.hidden = false;
  }

  dlg.addEventListener('close', showForm);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  $$('[data-close]').forEach(function (b) { b.onclick = function () { dlg.close(); }; });
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-enroll]');
    if (!t) return;
    e.preventDefault();
    openEnroll(t.getAttribute('data-scheme'));
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = {};
    FIELDS.forEach(function (f) { data[f] = form.elements[f].value; setErr(f, ''); });
    $('#formErr').textContent = '';
    if (data.name.trim().length < 2) return fail('name', 'Please enter your full name');
    if (!/^\\d{10}$/.test(data.mobile.replace(/\\s+/g, ''))) return fail('mobile', 'Enter a valid 10-digit mobile number');

    var btn = $('#enrollSubmit');
    btn.disabled = true;
    fetch('/api/enroll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (res) { return res.json().then(function (body) { return { ok: res.ok, body: body }; }); })
      .then(function (res) {
        if (!res.ok) return fail(res.body.field, res.body.error);
        showDone(res.body, data);
      })
      .catch(function () { $('#formErr').textContent = 'Could not reach the server. Please try again.'; })
      .then(function () { btn.disabled = false; });
  });

  /* pill helpers */
  function pressed(attr, val) {
    $$('[' + attr + ']').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute(attr) === String(val)));
    });
  }

  /* calculator */
  var state = { mode: 'save', value: ${DEFAULTS.value}, months: ${DEFAULTS.months} };
  var range = $('#calcRange');
  function setK(key, text) { $$('[data-k=' + key + ']').forEach(function (el) { el.textContent = text; }); }
  function renderCalc() {
    var r = calculate(state.value, state.months), borrow = state.mode === 'borrow';
    $('#calcValue').textContent = rupee(state.value);
    range.value = state.value;
    range.setAttribute('aria-valuetext', rupee(state.value));
    pressed('data-mode', state.mode);
    pressed('data-preset', state.value);
    pressed('data-months', state.months);
    $('#sumBadge').textContent = borrow ? 'BORROWER PLAN' : 'SAVER PLAN';
    $('#sumLabel').textContent = borrow ? 'LUMP-SUM PRIZE MONEY' : 'NET MONTHLY INSTALLMENT';
    $('#sumValue').textContent = rupee(borrow ? r.netPrize : r.netMonthly);
    $('#sumNote').hidden = !borrow;
    setK('chit', rupee(state.value));
    setK('tenure', state.months + ' months');
    $('#divLabel').textContent = borrow ? 'Estimated Auction Discount' : 'Total Dividends Earned';
    setK('div', rupee(borrow ? r.discount : r.totalDividends));
    setK('outlay', rupee(r.totalOutlay));
    setK('annual', borrow ? 'No Processing Fees' : '14% - 17% p.a.');
  }
  $$('[data-mode]').forEach(function (b) { b.onclick = function () { state.mode = b.getAttribute('data-mode'); renderCalc(); }; });
  $$('[data-preset]').forEach(function (b) { b.onclick = function () { state.value = +b.getAttribute('data-preset'); renderCalc(); }; });
  $$('[data-months]').forEach(function (b) { b.onclick = function () { state.months = +b.getAttribute('data-months'); renderCalc(); }; });
  range.oninput = function () { state.value = +range.value; renderCalc(); };
  renderCalc();

  /* scheme filters */
  $$('[data-f]').forEach(function (b) {
    b.onclick = function () {
      var f = b.getAttribute('data-f');
      pressed('data-f', f);
      $$('#schemeGrid > [data-cat]').forEach(function (c) {
        c.hidden = f !== 'all' && c.getAttribute('data-cat') !== f;
      });
    };
  });

  /* auction tabs */
  $$('[data-auc]').forEach(function (b) {
    b.onclick = function () {
      var t = b.getAttribute('data-auc');
      pressed('data-auc', t);
      $('#aucUpcoming').hidden = t !== 'upcoming';
      $('#aucProtocols').hidden = t !== 'protocols';
    };
  });

  /* reveal on scroll */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  new MutationObserver(function () { $$('.rv:not(.in)').forEach(function (n) { io.observe(n); }); })
    .observe(document.body, { childList: true, subtree: true });
  $$('.rv').forEach(function (n) { io.observe(n); });

  /* background video + hold-to-reveal */
  (function () {
    var v = $('#bgv'), hint = $('#hint'), body = document.body;
    var play = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    if (calmMotion) { v.pause(); }
    else {
      play();
      v.addEventListener('loadeddata', play);
      document.addEventListener('visibilitychange', function () { if (!document.hidden) play(); });
      addEventListener('pointerdown', play, { once: true });
    }

    var nav = $('nav');
    var sc = function () { nav.classList.toggle('scrolled', scrollY > 12); };
    addEventListener('scroll', sc, { passive: true });
    sc();

    var IDLE = 'Hold left click to see the full video';
    var SKIP = 'a,button,input,select,textarea,summary,label,dialog,[role=tab],.menu,.tools';
    var timer = null, on = false, sx = 0, sy = 0, used = false;
    function peek(s) {
      if (s === on) return;
      on = s;
      body.classList.toggle('peek', s);
      if (s) {
        used = true;
        try { getSelection().removeAllRanges(); } catch (_) {}
        hint.textContent = 'Release to return';
        hint.classList.add('show');
      } else {
        hint.classList.remove('show');
        setTimeout(function () { hint.textContent = IDLE; }, 400);
      }
    }
    document.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (dlg.open || e.target.closest(SKIP)) return;
      sx = e.clientX; sy = e.clientY;
      clearTimeout(timer);
      timer = setTimeout(function () { peek(true); }, e.pointerType === 'mouse' ? 160 : 420);
    });
    document.addEventListener('pointermove', function (e) {
      if (timer && !on && e.pointerType !== 'mouse' && Math.hypot(e.clientX - sx, e.clientY - sy) > 10) {
        clearTimeout(timer); timer = null;
      }
    });
    var end = function () { clearTimeout(timer); timer = null; peek(false); };
    ['pointerup', 'pointercancel', 'blur'].forEach(function (n) { addEventListener(n, end); });
    document.documentElement.addEventListener('mouseleave', end);
    document.addEventListener('contextmenu', function (e) { if (on) e.preventDefault(); });
    document.addEventListener('dragstart', function (e) { if (on || timer) e.preventDefault(); });
    /* keyboard alternative: hold V */
    document.addEventListener('keydown', function (e) {
      if (e.key.toLowerCase() !== 'v' || e.repeat || e.ctrlKey || e.metaKey || e.altKey || dlg.open || e.target.closest('input,textarea,select')) return;
      peek(true);
    });
    document.addEventListener('keyup', function (e) { if (e.key.toLowerCase() === 'v') peek(false); });
    /* one-time gentle hint */
    setTimeout(function () {
      if (!used) {
        hint.classList.add('show');
        setTimeout(function () { if (!on) hint.classList.remove('show'); }, 6000);
      }
    }, 1600);
  })();
})();
`;

/* ------------------------------------------------------------------ *
 * Page sections
 * ------------------------------------------------------------------ */
function marquee() {
  const group = SITE.marquee.map((t) => `<span>${esc(t)}</span>`).join('');
  return `<div class="marquee" role="region" aria-label="Key facts"><div class="marquee-track"><div>${group}</div><div aria-hidden="true">${group}</div></div></div>`;
}

function nav() {
  const links = SITE.nav.links.map((l) => `<a href="${l.href}">${esc(l.label)}</a>`).join('');
  const mobile = [...SITE.nav.links, ...SITE.nav.mobileExtras]
    .map((l) => `<a href="${l.href}">${esc(l.label)}</a>`).join('');
  return `<nav><div class="wrap"><div class="bar glass">
<a class="brand" href="#top"><img src="/logo.png" width="361" height="76" alt="${esc(SITE.nav.brand)} logo"></a>
<div class="links">${links}</div>
<div class="cta"><a class="btn p" href="#enroll" data-enroll>${esc(SITE.nav.cta)}</a></div>
<button class="burger" type="button" aria-label="Open menu" aria-expanded="false">${BURGER_ICON}</button>
</div>
<div class="menu glass">${mobile}<a href="#enroll" data-enroll>${esc(SITE.nav.cta)}</a></div></div></nav>`;
}

function hero() {
  const h = SITE.hero;
  return `<section class="hero"><div class="wrap">
<h1 class="rv">${esc(h.headline)}</h1>
<p class="rv">${esc(h.subtext)}</p>
<div class="rv hero-cta">
<a class="btn p arrow" href="#schemes">${esc(h.buttons[0])} ${ARROW}</a>
<a class="btn" href="#calculator">${esc(h.buttons[1])}</a>
<a class="btn" href="#enroll" data-enroll>${esc(h.buttons[2])}</a>
</div>
<div class="chips rv">${h.badges.map((b) => `<span class="chip glass">${esc(b)}</span>`).join('')}</div>
</div></section>`;
}

function calculatorSection() {
  const C = SITE.calculator;
  const d = calculate(DEFAULTS.value, DEFAULTS.months);
  const objectives = C.objectives.map((o, i) =>
    `<button type="button" data-mode="${o.key}" aria-pressed="${i === 0}">${esc(o.label)}</button>`).join('');
  const presets = C.presets.map(([v, label]) =>
    `<button type="button" data-preset="${v}" aria-pressed="${v === DEFAULTS.value}">${esc(label)}</button>`).join('');
  const tenures = C.tenures.map((m) =>
    `<button type="button" data-months="${m}" aria-pressed="${m === DEFAULTS.months}">${m} MONTHS</button>`).join('');
  return `<section id="calculator"><div class="wrap">
<p class="eyebrow">${esc(C.badge)}</p>
<h2>${esc(C.heading)}</h2>
<p class="lead">${esc(C.intro)}</p>
<div class="calc">
<div class="glass ctrl rv">
<span class="ctrl-label">1 · Select your financial objective</span>
<div class="tools" role="group" aria-label="Financial objective">${objectives}</div>
<span class="ctrl-label">2 · Desired chit value</span>
<b class="calc-value" id="calcValue">${rupee(DEFAULTS.value)}</b>
<input id="calcRange" type="range" min="100000" max="5000000" step="50000" value="${DEFAULTS.value}" aria-label="Desired chit value" aria-valuetext="${rupee(DEFAULTS.value)}">
<div class="tools" role="group" aria-label="Chit value presets" style="margin-top:14px;margin-bottom:0">${presets}</div>
<span class="ctrl-label">3 · Tenure / duration</span>
<div class="tools" role="group" aria-label="Tenure">${tenures}</div>
</div>
<div class="glass sum rv" aria-live="polite">
<span class="tag" id="sumBadge">SAVER PLAN</span>
<span class="ctrl-label" id="sumLabel">NET MONTHLY INSTALLMENT</span>
<b class="sum-val" id="sumValue">${rupee(d.netMonthly)}</b>
<p class="sum-note" id="sumNote" hidden>Disbursed in 24 hours upon reverse auction completion</p>
<ul class="rows">
<li><span>Nominal Chit Value</span><strong data-k="chit">${rupee(DEFAULTS.value)}</strong></li>
<li><span>Scheme Tenure</span><strong data-k="tenure">${DEFAULTS.months} months</strong></li>
<li><span id="divLabel">Total Dividends Earned</span><strong data-k="div">${rupee(d.totalDividends)}</strong></li>
<li><span>Total Net Outlay</span><strong data-k="outlay">${rupee(d.totalOutlay)}</strong></li>
<li><span>Annualized Benefit</span><strong data-k="annual">14% - 17% p.a.</strong></li>
</ul>
<button class="btn p" type="button" data-enroll>${esc(C.cta)}</button>
<p class="disclaimer">${esc(C.disclaimer)}</p>
</div>
</div></div></section>`;
}

function schemeCard(s) {
  const slots = `Only ${s.slots} slot${s.slots === 1 ? '' : 's'} left`;
  return `<article class="plan card glass rv" data-cat="${s.cat}">
<div class="sc-top"><small>${esc(s.code)}</small><span class="tag">${esc(s.badge)}</span></div>
<h3>${esc(s.title)}</h3>
<small>Total Chit Value</small>
<b>${rupee(s.value)}</b>
<ul class="rows">
<li><span>Tenure</span><strong>${s.tenure} months</strong></li>
<li><span>Subscribers</span><strong>${s.subscribers}</strong></li>
<li><span>Monthly Gross</span><strong>${rupee(s.gross)}</strong></li>
<li><span>Avg Net (After Dividend)</span><strong>${rupee(s.avgNet)}</strong></li>
<li><span>Estimated Dividend Gain</span><strong>${rupee(s.dividend)}</strong></li>
<li><span>Max Borrowable</span><strong>${rupee(s.maxBorrow)}</strong></li>
<li><span>Batch Launch</span><strong>${esc(s.launch)}</strong></li>
</ul>
<p class="best"><small>Best Suited For</small>${esc(s.bestFor)}</p>
<p class="slots">${slots}</p>
<button class="btn p" type="button" data-enroll data-scheme="${s.code}">JOIN THIS BATCH</button>
</article>`;
}

function schemesSection() {
  const S = SITE.schemes;
  const filters = S.filters.map((f, i) =>
    `<button type="button" data-f="${f.key}" aria-pressed="${i === 0}">${esc(f.label)}</button>`).join('');
  return `<section id="schemes"><div class="wrap">
<p class="eyebrow">${esc(S.badge)}</p>
<h2>${esc(S.heading)}</h2>
<p class="lead">${esc(S.intro)}</p>
<div class="tools" role="group" aria-label="Filter schemes">${filters}</div>
<div class="g3" id="schemeGrid">${SCHEMES.map(schemeCard).join('')}</div>
</div></section>`;
}

function howSection() {
  const H = SITE.how;
  const steps = H.steps.map((s, i) => `<div class="card glass rv">
<span class="ico">${String(i + 1).padStart(2, '0')}</span>
<h3>${esc(s.title)}</h3>
<span class="tag">${esc(s.tag)}</span>
<p style="margin-top:14px">${esc(s.body)}</p>
<p class="step-foot">${esc(H.footer)}</p>
</div>`).join('');
  const D = H.digital;
  return `<section id="how"><div class="wrap">
<div class="chips tight">${H.badges.map((b) => `<span class="chip glass">${esc(b)}</span>`).join('')}</div>
<h2>${esc(H.heading)}</h2>
<p class="lead">${esc(H.intro)}</p>
<div class="g3">${steps}</div>
<div class="glass split rv">
<div>
<span class="tag">${esc(D.badge)}</span>
<h3>${esc(D.heading)}</h3>
<p>${esc(D.body)}</p>
</div>
<div class="app glass">
<small>${esc(D.app)}</small>
<a class="btn p" href="#enroll" data-enroll>${esc(D.cta)}</a>
</div>
</div>
</div></section>`;
}

function auctionSection() {
  const A = SITE.auctions;
  const tabs = A.tabs.map((t, i) =>
    `<button type="button" data-auc="${t.key}" aria-pressed="${i === 0}">${esc(t.label)}</button>`).join('');
  const cards = A.upcoming.map((a) => `<article class="card glass rv">
<div class="sc-top"><small>${esc(a.series)}</small><span class="tag">MONTH ${a.month} OF ${a.total}</span></div>
<h3>${esc(a.group)}</h3>
<ul class="rows">
<li><span>Chit Value</span><strong>${rupee(a.value)}</strong></li>
<li><span>Date &amp; Time</span><strong>${esc(a.date)} · ${esc(a.time)}</strong></li>
<li class="prev"><span>Prev Dividend<small>Per Subscriber Discount</small></span><strong>${rupee(a.prev)}</strong></li>
<li><span>Location</span><strong>${esc(A.location)}</strong></li>
</ul>
<button class="btn p" type="button" style="width:100%;margin-top:18px" data-enroll data-scheme="${a.series}">${esc(A.cta)}</button>
</article>`).join('');
  const protocols = A.protocols.map((p) => `<li><strong>${esc(p.title)}</strong> – ${esc(p.body)}</li>`).join('');
  return `<section id="auctions"><div class="wrap">
<p class="eyebrow">${esc(A.badge)}</p>
<h2>${esc(A.heading)}</h2>
<div class="tools" role="group" aria-label="Auction bulletin">${tabs}</div>
<div class="g3" id="aucUpcoming">${cards}</div>
<div class="glass" id="aucProtocols" hidden>
<h3>${esc(A.protocolsTitle)}</h3>
<ol class="protocols">${protocols}</ol>
</div>
</div></section>`;
}

function trustSection() {
  const T = SITE.trust;
  const C = T.certificate;
  const facts = T.facts.map((f) => `<div class="card glass rv">
<b class="stat">${esc(f.number)}</b>
<h3>${esc(f.label)}</h3>
<p>${esc(f.detail)}</p>
</div>`).join('');
  const highlights = C.highlights.map((h) => `<li><strong>${esc(h.title)}</strong> – ${esc(h.body)}</li>`).join('');
  const faq = T.faq.map((q) => `<details class="glass"><summary>${esc(q.q)}</summary><p>${esc(q.a)}</p></details>`).join('');
  return `<section id="trust"><div class="wrap">
<p class="eyebrow">${esc(T.badge)}</p>
<h2>${esc(T.heading)}</h2>
<p class="lead">${esc(T.intro)}</p>
<div class="g3">${facts}</div>
<div class="glass cert rv">
<p class="eyebrow">${esc(C.heading)}</p>
<h3>${esc(C.name)}</h3>
<p>${esc(C.text)}</p>
<ul class="rows">
<li><span>Corporate ID (CIN)</span><strong>${esc(C.cin)}</strong></li>
<li><span>Incorporation Date</span><strong>${esc(C.incorporated)}</strong></li>
</ul>
<p class="hl-title">${esc(C.highlightsTitle)}</p>
<ul class="hl">${highlights}</ul>
</div>
<h3 class="sub">${esc(T.faqHeading)}</h3>
<p class="eyebrow faq-badge">${esc(T.faqBadge)}</p>
${faq}
</div></section>`;
}

function ctaBanner() {
  const C = SITE.cta;
  return `<section class="cta-sec"><div class="wrap"><div class="glass quote rv">
<h2>${esc(C.heading)}</h2>
<p class="tags-line">${esc(C.tags)}</p>
<a class="btn p" href="#enroll" data-enroll>${esc(C.button)}</a>
</div></div></section>`;
}

function footer() {
  const F = SITE.footer;
  const explore = F.explore.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join('');
  const governance = F.governance.map((g) => `<li>${esc(g)}</li>`).join('');
  const phones = F.contact.phones.map((p) => `<a href="tel:${p.tel}">${esc(p.label)}</a>`).join(' / ');
  return `<footer class="site-foot"><div class="wrap">
<div class="foot-grid">
<div>
<img class="foot-logo" src="/logo.png" width="361" height="76" alt="Panasuna Chits (P) Ltd. logo" loading="lazy">
<p>${esc(F.about)}</p>
<div class="tags">${F.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
</div>
<div>
<h4>Explore Schemes</h4>
<ul>${explore}</ul>
</div>
<div>
<h4>Governance &amp; Statutes</h4>
<ul>${governance}</ul>
</div>
<div>
<h4>Head Office &amp; Contact</h4>
<p><strong>Address:</strong> ${esc(F.contact.address)}</p>
<p><strong>Phone:</strong> ${phones}</p>
<p><strong>Email:</strong> <a href="mailto:${F.contact.email}">${esc(F.contact.email)}</a></p>
<p><strong>Hours:</strong> ${esc(F.contact.hours)}</p>
</div>
</div>
<div class="legal"><span>${esc(F.legal)}</span><a href="#top">BACK TO TOP</a></div>
</div></footer>`;
}

function enrollDialog() {
  const E = SITE.enroll;
  const field = (label, control) =>
    `<div class="field"><label><span class="lbl">${label}</span>${control}</label><span class="err"></span></div>`;
  const schemeOptions = SCHEMES.map((s) =>
    `<option value="${s.code}">${s.code} — ${rupee(s.value)} (${s.tenure} months @ ~${rupee(s.avgNet)}/mo)</option>`).join('');
  const townOptions = TOWNS.map((t) => `<option>${esc(t)}</option>`).join('');
  const goalOptions = GOALS.map((g) => `<option>${esc(g)}</option>`).join('');
  return `<dialog id="enroll" class="modal" aria-labelledby="enrollTitle">
<div class="modal-body">
<button class="close" type="button" data-close aria-label="Close">&times;</button>
<div id="enrollFormView">
<h2 id="enrollTitle">${esc(E.heading)}</h2>
<p class="lead">${esc(E.intro)}</p>
<form id="enrollForm" novalidate>
${field('CHOOSE CHIT SCHEME', `<select name="scheme">${schemeOptions}</select>`)}
${field('YOUR FULL NAME', '<input name="name" type="text" autocomplete="name" placeholder="e.g. S. Ramanathan / K. Priya">')}
${field('MOBILE NUMBER', '<input name="mobile" type="tel" inputmode="numeric" autocomplete="tel" maxlength="10" placeholder="10-digit number">')}
${field('TOWN / CITY', `<select name="town">${townOptions}</select>`)}
${field('PRIMARY GOAL', `<select name="goal">${goalOptions}</select>`)}
<button id="enrollSubmit" class="btn p" type="submit">${esc(E.submit)}</button>
<p id="formErr" class="err" role="alert"></p>
<p class="modal-note">${esc(E.note)}</p>
</form>
</div>
<div id="enrollDone" hidden>
<span class="tag">${esc(E.done.badge)}</span>
<h2 style="margin-top:14px">${esc(E.done.heading)}</h2>
<p>Thank you, <strong data-d="name"></strong>. A dedicated Chit Advisor from our ${esc(E.done.branch)} branch will call you at <strong data-d="mobile"></strong> within 2 banking hours with your subscriber passbook allocation.</p>
<ul class="rows receipt">
<li><span>RECEIPT NO</span><strong data-d="receipt"></strong></li>
<li><span>Selected Group</span><strong data-d="group"></strong></li>
<li><span>Tenure</span><strong data-d="tenure"></strong></li>
<li><span>Monthly Approx Net</span><strong data-d="net"></strong></li>
<li><span>Branch Handling</span><strong>${esc(E.done.branch)}</strong></li>
</ul>
<button class="btn p" type="button" data-close>${esc(E.done.close)}</button>
</div>
</div>
</dialog>`;
}

function renderPage() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(SITE.meta.title)}</title>
<meta name="description" content="${esc(SITE.meta.description)}">
<link rel="stylesheet" href="https://db.onlinewebfonts.com/c/04e6981992c0e2e7642af2074ebe3901?family=Helvetica+Now+Display+Bold">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>
<div class="bg"><video id="bgv" autoplay muted loop playsinline preload="auto" poster="/poster.jpg" disablepictureinpicture aria-hidden="true"><source src="/bg.mp4" type="video/mp4"></video></div>
${marquee()}
${nav()}
<main id="top">
${hero()}
${calculatorSection()}
${schemesSection()}
${howSection()}
${auctionSection()}
${trustSection()}
${ctaBanner()}
</main>
${footer()}
<div class="hint glass" id="hint" aria-hidden="true">Hold left click to see the full video</div>
${enrollDialog()}
<script>${CLIENT_JS}</script>
</body>
</html>`;
}

const PAGE = renderPage();

/* ------------------------------------------------------------------ *
 * Enrollment API
 * ------------------------------------------------------------------ */
function validateEnrollment(b) {
  const name = String(b.name || '').trim();
  const mobile = String(b.mobile || '').replace(/\s+/g, '');
  const scheme = SCHEMES.find((s) => s.code === b.scheme);
  if (name.length < 2) return { error: 'Please enter your full name', field: 'name' };
  if (!/^\d{10}$/.test(mobile)) return { error: 'Enter a valid 10-digit mobile number', field: 'mobile' };
  if (!scheme) return { error: 'Choose a chit scheme', field: 'scheme' };
  if (!TOWNS.includes(b.town)) return { error: 'Choose your town / city', field: 'town' };
  if (!GOALS.includes(b.goal)) return { error: 'Choose your primary goal', field: 'goal' };
  return { scheme };
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

function handleEnroll(req, res) {
  let raw = '';
  req.setEncoding('utf8');
  req.on('data', (chunk) => {
    raw += chunk;
    if (raw.length > 10000) {
      sendJson(res, 413, { error: 'Request too large' });
      req.destroy();
    }
  });
  req.on('end', () => {
    if (res.headersSent) return;
    let body;
    try {
      body = JSON.parse(raw || '{}');
    } catch (_) {
      return sendJson(res, 400, { error: 'Invalid request' });
    }
    const check = validateEnrollment(body);
    if (check.error) return sendJson(res, 400, check);

    const receipt = `PS-2026-${1000 + Math.floor(Math.random() * 9000)}`;
    // Personal details are deliberately not logged. Storage is not wired up yet.
    console.log(`Enrollment ${receipt} for ${check.scheme.code}`);
    sendJson(res, 200, {
      receipt,
      group: `${check.scheme.code} · ${check.scheme.title}`,
      tenure: check.scheme.tenure,
      monthlyNet: check.scheme.avgNet,
    });
  });
}

/* ------------------------------------------------------------------ *
 * Static media (video with Range support so seeking and looping work)
 * ------------------------------------------------------------------ */
function sendMedia(req, res, media) {
  const filePath = path.join(ROOT, media.file);
  fs.stat(filePath, (err, stat) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not found');
    }
    const size = stat.size;
    const headers = {
      'Content-Type': media.type,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400',
    };
    const range = req.headers.range;
    if (range) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      let start;
      let end;
      if (m && (m[1] !== '' || m[2] !== '')) {
        if (m[1] === '') {
          start = Math.max(size - Number(m[2]), 0);
          end = size - 1;
        } else {
          start = Number(m[1]);
          end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
        }
      }
      if (start === undefined || start > end || start >= size) {
        res.writeHead(416, { 'Content-Range': `bytes */${size}` });
        return res.end();
      }
      res.writeHead(206, {
        ...headers,
        'Content-Length': end - start + 1,
        'Content-Range': `bytes ${start}-${end}/${size}`,
      });
      if (req.method === 'HEAD') return res.end();
      return fs.createReadStream(filePath, { start, end }).pipe(res);
    }
    res.writeHead(200, { ...headers, 'Content-Length': size });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
}

/* ------------------------------------------------------------------ *
 * Server
 * ------------------------------------------------------------------ */
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const isGet = req.method === 'GET' || req.method === 'HEAD';

  if (req.method === 'POST' && url.pathname === '/api/enroll') return handleEnroll(req, res);

  if (isGet && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    return res.end(req.method === 'HEAD' ? undefined : PAGE);
  }

  if (isGet && MEDIA[url.pathname]) return sendMedia(req, res, MEDIA[url.pathname]);

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Panasuna Chits running at http://localhost:${PORT}`);
});
