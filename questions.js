// Server-side question bank.
// This module is required by server.js and NEVER sent to the browser as-is.
// The client receives a stripped version (no `correct` or `why` fields)
// until the user submits, at which point the server returns scored results.

const SECTIONS = [
  { key: 'A', name: 'Phone Etiquette & Call Handling' },
  { key: 'B', name: 'Infiniti Product & Model Knowledge' },
  { key: 'C', name: 'Lead Qualification & Appointment Setting' },
  { key: 'D', name: 'Objection Handling & Closing' },
];

const QUESTIONS = [
  /* ============ SECTION A — ETIQUETTE ============ */
  { s:'A',
    q: 'The phone rings. Which opening is the strongest?',
    a: [
      'Hello?',
      'Thanks for calling Infiniti of [Dealership], this is [Name] — how can I help you?',
      "What's up, how can I help you?",
      'Infiniti, one moment please.'
    ],
    correct: 1,
    why: 'A strong greeting identifies the dealership, the rep by name, and invites the caller in. It sets tone, builds trust, and — critically — confirms the caller reached the right place.'
  },
  { s:'A',
    q: 'A customer opens with "How much is a QX60?" Best response?',
    a: [
      'Quote the MSRP range immediately to be transparent.',
      '"Let me get you to someone who can help."',
      'Thank them, introduce yourself, get their name, and ask a couple of quick discovery questions before quoting.',
      'Tell them the pricing is all on the website.'
    ],
    correct: 2,
    why: 'Price shopping calls convert dramatically better when you capture name/number and learn what they actually need first. Quoting cold gives them a number to compare against without giving them a reason to come in.'
  },
  { s:'A',
    q: 'If you must place a caller on hold, you should check back within roughly:',
    a: [
      '30–45 seconds, and keep updating them every ~30 seconds.',
      '2–3 minutes is fine.',
      '5 minutes is fine.',
      'However long it takes — they understand.'
    ],
    correct: 0,
    why: 'The industry standard is to ask permission before holding and to check back every 30–45 seconds so the caller never feels forgotten.'
  },
  { s:'A',
    q: 'A lead fills out a form at 2:07 PM. You should respond by:',
    a: [
      'End of business day.',
      'Within 24 hours.',
      'As close to immediately as possible — ideally within 5–10 minutes.',
      'Whenever your next walk-in is done.'
    ],
    correct: 2,
    why: 'Contact rates drop off steeply after the first 5 minutes. The dealership that calls first very often wins the deal, regardless of price.'
  },
  { s:'A',
    q: 'A caller asks something you don\'t know. Best response?',
    a: [
      'Make an educated guess so you sound knowledgeable.',
      'Say "I don\'t know" and leave it at that.',
      '"Great question — I want to get you the right answer. Can I grab your number and call you back within 15 minutes with the exact info?"',
      'Transfer them to Service.'
    ],
    correct: 2,
    why: 'Honesty plus a time-bound commitment builds trust and, more importantly, gives you a reason to call back — a second touch that re-starts the sales conversation.'
  },
  { s:'A',
    q: 'Someone asks for a specific salesperson who is with another customer. Best move?',
    a: [
      'Take a detailed message and a callback number.',
      '"They\'re busy — call back later."',
      'Offer to help them yourself first; if they prefer [Name], take a thorough message with name, number, vehicle of interest, and best time to reach back.',
      'Put them on hold indefinitely until [Name] is free.'
    ],
    correct: 2,
    why: 'Never let a live call turn cold. Offer immediate help, and if they decline, capture enough to make [Name]\'s callback productive.'
  },
  { s:'A',
    q: 'Which is the single MOST important thing to capture on every inbound call before it ends?',
    a: [
      'Email address.',
      'Name AND a callback number.',
      'Model of interest.',
      'Trade-in details.'
    ],
    correct: 1,
    why: 'Everything else is recoverable on the next call. Without a name and a number you have no second chance.'
  },
  { s:'A',
    q: 'A customer sounds frustrated from the first sentence. The FIRST thing to do is:',
    a: [
      'Defend the dealership.',
      'Acknowledge, apologize, and listen — let them explain the entire issue before responding.',
      'Transfer to the manager immediately.',
      'Offer a discount.'
    ],
    correct: 1,
    why: 'Frustrated customers need to be heard before they can be helped. Interrupting or jumping to fixes makes them escalate.'
  },
  { s:'A',
    q: 'Which of these phrases should be avoided on sales calls?',
    a: [
      '"No problem."',
      '"I can\'t help you with that."',
      '"To be honest with you..."',
      'All of the above.'
    ],
    correct: 3,
    why: '"No problem" minimizes their request, "I can\'t help" is a dead end, and "to be honest" implies the rest of the conversation wasn\'t. Small phrasings compound.'
  },
  { s:'A',
    q: 'The correct way to transfer a call is:',
    a: [
      'Hit transfer and hang up.',
      'Warm transfer: announce the caller and the situation to the receiving person, then bridge them in and drop off.',
      'Tell the caller to hang up and call back asking for the other person.',
      'Transfer without telling the caller.'
    ],
    correct: 1,
    why: 'A warm transfer saves the caller from repeating themselves and saves the receiving rep from walking in cold. It\'s a small effort with outsized impact on conversion.'
  },

  /* ============ SECTION B — PRODUCT ============ */
  { s:'B',
    q: 'Which vehicle is Infiniti\'s full-size flagship SUV?',
    a: ['QX50', 'QX60', 'QX80', 'Q50'],
    correct: 2,
    why: 'The QX80 is the 8-passenger, full-size flagship SUV and the halo vehicle of the brand.'
  },
  { s:'B',
    q: 'Which current Infiniti models have three rows of seating?',
    a: [
      'QX50 and QX60.',
      'QX60 and QX80.',
      'Only the QX80.',
      'Only the QX60.'
    ],
    correct: 1,
    why: 'QX60 (7-passenger) and QX80 (8-passenger) are the three-row options. QX50 is a two-row crossover.'
  },
  { s:'B',
    q: 'What is "VC-Turbo"?',
    a: [
      'A trim level.',
      'Infiniti\'s Variable Compression turbocharged engine.',
      'A towing package.',
      'A warranty program.'
    ],
    correct: 1,
    why: 'VC-Turbo is the 2.0L Variable Compression turbocharged engine. It\'s a genuine technical differentiator worth raising on product calls.'
  },
  { s:'B',
    q: 'Which engine powers the current 2026 QX80?',
    a: [
      '2.0L VC-Turbo 4-cylinder.',
      '5.6L V8.',
      '3.5L twin-turbo V6.',
      'All-electric powertrain.'
    ],
    correct: 2,
    why: 'The redesigned QX80 moved from the legacy 5.6L V8 to a 3.5L twin-turbo V6 — a common point of confusion because the prior generation used the V8.'
  },
  { s:'B',
    q: 'A caller asks what\'s new in the Infiniti lineup. The biggest upcoming model to mention is:',
    a: [
      'QX55.',
      'QX65 (new two-row crossover arriving Spring 2026).',
      'Q45.',
      'EX30.'
    ],
    correct: 1,
    why: 'The QX65 is the all-new two-row crossover arriving Spring 2026. QX55 has been replaced. There is no current sedan lineup and no EX30.'
  },
  { s:'B',
    q: 'INFINITI InTouch® on new 2026 vehicles includes:',
    a: [
      'A paint warranty.',
      'Connected vehicle services with a three-year Premium subscription.',
      'A dealer service voucher program.',
      'Floor mats only.'
    ],
    correct: 1,
    why: 'InTouch® provides connected services (remote start, navigation, etc.) and comes with a three-year Premium subscription on new 2026 vehicles so equipped.'
  },
  { s:'B',
    q: 'The INFINITI Premium Care program on new 2026 vehicles covers roughly:',
    a: [
      'Free tires for life.',
      'Up to 3 oil changes and 3 tire rotations over 3 years (or the designated mileage period).',
      'Free fuel for 6 months.',
      'Unlimited collision repair.'
    ],
    correct: 1,
    why: 'Premium Care is a scheduled-maintenance benefit: up to 3 oil changes and 3 tire rotations over the first 3 years or the designated mileage — whichever comes first.'
  },
  { s:'B',
    q: 'On the QX60, which trims come standard with all-wheel drive?',
    a: [
      'Pure only.',
      'Luxe only.',
      'Sport and Autograph.',
      'All four trims.'
    ],
    correct: 2,
    why: 'Pure and Luxe come standard in FWD (AWD available); Sport and Autograph are AWD standard.'
  },
  { s:'B',
    q: 'A caller asks which Infiniti sedan they should look at. You should:',
    a: [
      'Explain that Infiniti\'s current lineup is all SUVs and crossovers, then pivot to which model best fits their need.',
      'Push them toward a QX60 as a "sedan alternative" without first asking what they actually need.',
      'Tell them Infiniti doesn\'t make cars.',
      'Transfer them to used cars.'
    ],
    correct: 0,
    why: 'The current new-vehicle lineup is crossovers and SUVs. Own the fact confidently, then redirect to needs — don\'t dismiss the caller.'
  },
  { s:'B',
    q: 'A caller asks what new Infiniti vehicles are on the lot right now. The most accurate answer is:',
    a: [
      'QX50, QX55, QX60, and QX80 — our full four-model lineup.',
      'New production is QX60 and QX80 only; remaining QX50 / QX55 units are carryover inventory while supplies last, and the all-new QX65 arrives Spring 2026.',
      'Just the QX80 — it\'s our flagship.',
      'Every Infiniti model Nissan makes worldwide, including sedans.'
    ],
    correct: 1,
    why: 'QX50 and QX55 production ended at the end of 2025. Current new-production lineup is QX60 and QX80, with the all-new QX65 two-row crossover arriving Spring 2026. Reps should narrate the transition confidently and without overselling discontinued inventory.'
  },

  /* ============ SECTION C — QUALIFICATION ============ */
  { s:'C',
    q: 'The primary goal of an inbound sales call is to:',
    a: [
      'Quote the best price immediately.',
      'Set a specific appointment with a day and time.',
      'Qualify the caller out.',
      'Send them a brochure.'
    ],
    correct: 1,
    why: 'A phone is not a showroom. Information closes; the appointment sells. Every inbound call should end with a booked time.'
  },
  { s:'C',
    q: '"Just checking availability." Best follow-up question?',
    a: [
      '"What\'s your budget?"',
      '"What color are you looking for?"',
      '"Great — what brought you to the Infiniti brand? And what are you driving right now?"',
      '"We have it, when do you want to come in?"'
    ],
    correct: 2,
    why: 'Open-ended discovery builds rapport and surfaces the real motivation. Jumping to availability turns the call into a logistics exchange.'
  },
  { s:'C',
    q: 'BANT stands for:',
    a: [
      'Budget, Authority, Need, Timeline.',
      'Brand, Age, Name, Trade.',
      'Before Anyone Needs Test-drive.',
      'Best Asking Negotiation Tactic.'
    ],
    correct: 0,
    why: 'BANT is the classic qualification framework: can they afford it, do they decide, do they actually need it, and when. On the phone you won\'t nail every one, but you\'re always listening for them.'
  },
  { s:'C',
    q: 'Which is the stronger appointment ask?',
    a: [
      '"When would you like to come in?"',
      '"Does Thursday at 5:30 work for you, or would Saturday at 10:30 be better?"',
      '"Come by whenever you\'re free."',
      '"Can you be here in an hour?"'
    ],
    correct: 1,
    why: 'The alternate-choice close gives the caller two yeses instead of one yes-or-no. It dramatically raises set rate and show rate.'
  },
  { s:'C',
    q: '"We\'re still just starting to look." You should:',
    a: [
      'Disqualify them — not a real buyer yet.',
      'Send them to the website.',
      'Lean in — early shoppers are the perfect time to build rapport and get them in for a low-pressure look, before a competitor hooks them first.',
      'Refer them to CarMax.'
    ],
    correct: 2,
    why: 'Early shoppers are the highest-value long-term leads. The rep who provides real value at this stage wins when they\'re ready.'
  },
  { s:'C',
    q: 'After setting an appointment, you should:',
    a: [
      'Hang up and hope they show.',
      'Send a confirmation (text or email) with your name, the date/time, and what specifically you\'ll have pulled up for them.',
      'Call them 5 times before the appointment.',
      'Wait until they arrive to prepare.'
    ],
    correct: 1,
    why: 'Show rate roughly doubles with a personalized, specific confirmation. It also establishes your direct line for the customer to use.'
  },
  { s:'C',
    q: 'A caller asks about a specific VIN they saw online. Before quoting, you should:',
    a: [
      'Confirm the vehicle is physically still on the lot and unsold — in real time.',
      'Just read them the listed price.',
      'Start a trade-in conversation.',
      'Transfer to finance.'
    ],
    correct: 0,
    why: 'Nothing kills a relationship faster than setting an appointment for a vehicle that was sold yesterday. Eyes on the car, or a real-time inventory check, before you commit.'
  },
  { s:'C',
    q: 'The caller mentions their spouse is the actual decision-maker. Best move?',
    a: [
      'Tell the caller to have the spouse call you directly.',
      'Ignore it and keep selling to the person on the phone.',
      'Acknowledge it: "That makes sense — let\'s set the appointment when you can both come in together, so nothing has to be repeated."',
      'End the call — they aren\'t a real buyer.'
    ],
    correct: 2,
    why: 'Decisions made without all decision-makers present are the #1 reason deals collapse at the desk. Get them all in the same place from the start.'
  },
  { s:'C',
    q: 'A confirmed appointment no-shows. Best follow-up?',
    a: [
      'Never — they had their shot.',
      'Same day, non-judgmental message: "Missed you today — did life happen? Want to reschedule?"',
      'An angry voicemail.',
      'Wait a week, then follow up.'
    ],
    correct: 1,
    why: 'No-shows are almost never malicious; they\'re logistics. A warm, same-day reset converts a surprising percentage of missed appointments into kept ones.'
  },
  { s:'C',
    q: 'Which is the strongest appointment confirmation?',
    a: [
      '"See you sometime this week."',
      '"I\'ve got you down for Thursday 10/15 at 5:30 PM. I\'ll have the QX60 Autograph pulled up and ready. Texting you my direct line now — save it."',
      '"If you can make it, come by."',
      '"We\'re open till 8."'
    ],
    correct: 1,
    why: 'Specificity is the confirmation. Name, day, time, vehicle, and a direct line — the customer now has four reasons to show and one person to ask for.'
  },

  /* ============ SECTION D — OBJECTIONS / CLOSE ============ */
  { s:'D',
    q: '"Your price is too high." Best first response?',
    a: [
      'Immediately drop the price.',
      '"Too high compared to what?" — isolate the objection before you answer it.',
      '"Sorry, that\'s the best we can do."',
      'End the call.'
    ],
    correct: 1,
    why: 'Isolating is always step one. "Too high" can mean a competitor\'s quote, payment shock, trade valuation, or just a reflex. You can\'t address the real issue until you surface it.'
  },
  { s:'D',
    q: '"I\'m just looking." You should:',
    a: [
      'Tell them to come back when they\'re serious.',
      'Acknowledge warmly: "Perfect — most of our best customers started exactly there. What\'s caught your eye so far?"',
      'Push harder to close them on the call.',
      'Ignore the statement.'
    ],
    correct: 1,
    why: '"Just looking" is a defense mechanism, not a disqualifier. Warm acknowledgment disarms it and opens discovery.'
  },
  { s:'D',
    q: 'Customer insists their trade is worth more than it is. Best approach?',
    a: [
      'Give them whatever they ask.',
      'Tell them their car is worthless.',
      'Shift the conversation to the total out-the-door figure / payment, and explain how the trade fits into the complete deal.',
      'Refuse to discuss the trade.'
    ],
    correct: 2,
    why: 'Don\'t fight on individual numbers — win on the total picture. Payment and total cost-to-own are what the customer actually buys.'
  },
  { s:'D',
    q: '"I need to think about it" usually means:',
    a: [
      'They will definitely not buy.',
      'They have a specific concern they haven\'t said out loud yet — your job is to surface it.',
      'They are genuinely thinking and will call back.',
      'They want a free gift.'
    ],
    correct: 1,
    why: '"Let me think about it" almost always masks a specific concern — price, spouse, trade, timing. Respond with a curious follow-up, not a pause.'
  },
  { s:'D',
    q: 'Which is an example of an assumptive close?',
    a: [
      '"So are you going to buy it or not?"',
      '"Would you like it in black or white?" / "Are you financing or leasing?"',
      '"Please, please buy it."',
      '"This is your last chance."'
    ],
    correct: 1,
    why: 'Assumptive closes move the customer past the yes/no and into the how. It\'s a gentle, natural way to advance the sale.'
  },
  { s:'D',
    q: '"I saw it cheaper at another dealer." Best response?',
    a: [
      'Match the price immediately, no questions asked.',
      'Ask them to forward the written quote so you can compare apples-to-apples — same VIN, same fees, same incentives, same trade valuation.',
      'Tell them to go buy it at the other dealer.',
      'Ignore it.'
    ],
    correct: 1,
    why: 'Most "cheaper quotes" don\'t survive a fee-by-fee comparison. Never match a price blind — you\'ll leave money on the table or match a quote that doesn\'t even exist as described.'
  },
  { s:'D',
    q: '"My credit isn\'t great, I probably won\'t qualify." Best response?',
    a: [
      '"You\'re right — sorry we can\'t help."',
      '"We work with a wide range of lenders and programs — let\'s get you in so we can look at your real options. You may be surprised."',
      'Tell them to come back in a year after fixing their credit.',
      'Quote them a very high rate over the phone to be safe.'
    ],
    correct: 1,
    why: 'Self-disqualification is often wrong, and over-the-phone rate quotes are always wrong. Get them in, run it properly, show them actual options.'
  },
  { s:'D',
    q: '"Feel-felt-found" is used to:',
    a: [
      'Close on price.',
      'Handle objections empathetically — acknowledge how they feel, share that others felt the same, then describe what those customers found once they moved forward.',
      'Qualify trade-ins.',
      'Run credit.'
    ],
    correct: 1,
    why: 'Feel-felt-found is a classic objection framework: it validates the customer without capitulating, and it reframes through social proof.'
  },
  { s:'D',
    q: '"What\'s my payment going to be?" — over the phone. Best answer?',
    a: [
      'Quote a specific payment without knowing credit tier, down payment, term, or trade.',
      'Refuse to discuss payment at all.',
      'Explain that an accurate payment depends on credit, down payment, term, and taxes — offer to run it properly in person or with a soft credit pull rather than give a guess that will change later.',
      '"Around $500" — just to keep them engaged.'
    ],
    correct: 2,
    why: 'A phantom payment quote creates a grievance when the real number comes back higher. Coach the customer on why an honest number requires real inputs.'
  },
  { s:'D',
    q: 'The strongest way to end a sales call is to:',
    a: [
      '"Talk to you later."',
      'Recap next steps, reconfirm the appointment time, repeat your direct contact, and thank them sincerely.',
      'Hang up first so they know you\'re busy.',
      '"Call us back if you want."'
    ],
    correct: 1,
    why: 'A strong close of the call is a down-payment on a strong opening of the appointment. Recap, reconfirm, re-share your contact — then thank them.'
  },
];

// Client-safe version: same questions but without `correct` or `why` fields.
function clientQuestions() {
  return QUESTIONS.map(({ s, q, a }) => ({ s, q, a }));
}

// Score a set of submitted answers. Returns correctCount, sectionScores map,
// and a per-question scored array that includes the correct answer and explanation
// (used to render the review screen).
function score(answers) {
  const sectionScores = {};
  SECTIONS.forEach(s => { sectionScores[s.key] = { correct: 0, total: 0 }; });
  let correctCount = 0;
  const scored = QUESTIONS.map((q, i) => {
    const answered = answers[i] === undefined ? null : answers[i];
    const isCorrect = answered !== null && answered === q.correct;
    if (isCorrect) correctCount++;
    sectionScores[q.s].total++;
    if (isCorrect) sectionScores[q.s].correct++;
    return {
      idx: i,
      section: q.s,
      question: q.q,
      options: q.a,
      answered,
      correct: q.correct,
      isCorrect,
      why: q.why,
    };
  });
  return { correctCount, totalQuestions: QUESTIONS.length, sectionScores, scored };
}

module.exports = {
  QUESTIONS,
  SECTIONS,
  clientQuestions,
  score,
};
