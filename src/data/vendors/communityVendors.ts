import type { VendorGuideTemplate } from './weddingVendors';

const COND_OUTDOOR = {
  ruleId: 'OUTDOOR' as const,
  questions: ['What storm drainage and mud mitigation measures are available on the grounds?'],
  requiredChecks: ['Confirm weather backup plan and outdoor electrical safety checks'],
};

const COND_OPEN_BAR = {
  ruleId: 'OPEN_BAR' as const,
  questions: ['What temporary alcohol retail permits and perimeter fencing are mandated?'],
  requiredChecks: ['Verify liquor liability and local server permit verification'],
};

const COND_ACCESSIBILITY = {
  ruleId: 'ACCESSIBILITY' as const,
  questions: ['Are accessible parking bays, curb ramps, and accessible toilets verified?'],
  requiredChecks: ['Confirm step-free guest access and accessible restroom confirmation'],
};

const COND_DIETARY = {
  ruleId: 'DIETARY_CULTURAL' as const,
  questions: ['Are designated food stalls clearly labeled for specific cultural dietary needs?'],
  requiredChecks: ['Verify separate-preparation and cross-contamination check'],
};

const COND_ALLERGY = {
  ruleId: 'ALLERGY_ALERT' as const,
  questions: ['Are top allergen notices prominently displayed at all food distribution points?'],
  requiredChecks: ['Verify allergen labeling protocol and written allergy policy check'],
};

export const COMMUNITY_VENDOR_GUIDES: readonly VendorGuideTemplate[] = [
  {
    id: 'venue_permits',
    name: 'Venue & Local Permits',
    scope: 'Public park, plaza, street closure, municipal hall, and associated civic permits.',
    questions: [
      'What local government permits, park approvals, or street closure filings are required?',
      'What is the lead time required for municipal council and emergency service approvals?',
      'What are the load-in, event duration, and curfew requirements for public grounds?',
      'What bond or security deposit is required by the local authority for site remediation?',
      'What is the severe weather or air quality cancellation policy for the venue?',
    ],
    requiredChecks: ['Confirm municipal permits and public liability insurance coverage limits'],
    contractWatchouts: [
      'Strict municipal permit cancellation forfeiture clauses with no weather recourse',
    ],
    conditional: [COND_OUTDOOR, COND_OPEN_BAR, COND_ACCESSIBILITY],
  },
  {
    id: 'production_av',
    name: 'Stage, Sound & AV Production',
    scope: 'Stages, trussing, PA sound systems, microphones, lighting, and generator power.',
    questions: [
      'Does the quote include certified technicians for setup, live mixing, and teardown?',
      'What is the power distribution plan, including generator fuel and backup units?',
      'How is electrical equipment protected against rain, wind, and ground moisture?',
      'What are the stage dimensions, load limits, guardrails, and accessible ramp options?',
      'What is the delivery, sound check, and strike schedule relative to permit hours?',
    ],
    requiredChecks: ['Confirm public sound volume complies with local community noise ordinances'],
    contractWatchouts: [
      'Exclusion of electrical cables, sub-distribution boards, or fuel costs from quote',
    ],
    conditional: [COND_OUTDOOR],
  },
  {
    id: 'food_beverage',
    name: 'Food & Beverage Operations',
    scope: 'Food stalls, food trucks, community kitchens, hydration stations, and concessionaires.',
    questions: [
      'How many independent food service points are required to serve expected crowd volume?',
      'Does the vendor provide self-contained power, water supply, and waste containment?',
      'What is the concession revenue sharing or fixed pitch fee structure for the event?',
      'What food safety handling and temperature storage procedures are followed on-site?',
      'What provisions are made for handwashing stations and continuous gray water disposal?',
    ],
    requiredChecks: ['Ask for proof of any licences or insurance required locally for food stalls'],
    contractWatchouts: [
      'Vendor withdrawal clauses without notice penalties leaving attendees without food',
    ],
    conditional: [COND_DIETARY, COND_ALLERGY, COND_OPEN_BAR],
  },
  {
    id: 'programming_entertainment',
    name: 'Programming & Entertainment',
    scope: 'Master of ceremonies, community artists, cultural performers, and stage schedule.',
    questions: [
      'How many performers or community acts are scheduled across the program timeline?',
      'What stage setup, technical inputs, and sound check time does each act require?',
      'Does the performer contract include hospitality, meals, or travel stipends?',
      'What is the cancellation or wet weather policy for outdoor performance stages?',
      'Who is responsible for coordinating the run-of-show cues and artist stage entrances?',
    ],
    requiredChecks: ['Confirm public performance and music rights clearances for scheduled pieces'],
    contractWatchouts: [
      'Excessive hospitality rider requirements exceeding community event budgets',
    ],
  },
  {
    id: 'safety_security',
    name: 'Safety, Medical & Security',
    scope:
      'Crowd marshals, security guards, first aid station, emergency egress, and lost child tent.',
    questions: [
      'What is the ratio of licensed crowd marshals to anticipated attendee crowd volume?',
      'How will emergency vehicle access lanes and clear egress gates be kept unblocked?',
      'What medical first aid capabilities, defibrillator equipment, and medics are on site?',
      'How are lost children, missing persons, and vulnerable attendees reunited with guardians?',
      'What incident response protocol is established for severe weather or site evacuation?',
    ],
    requiredChecks: [
      'Confirm security personnel and medical team possess required local registrations',
    ],
    contractWatchouts: [
      'Guard staffing shortages without advance notice penalties on event morning',
    ],
  },
  {
    id: 'sanitation_logistics',
    name: 'Sanitation & Site Logistics',
    scope:
      'Portable restrooms, hand sanitizers, waste bins, recycling sorting, and litter cleanup.',
    questions: [
      'How many portable toilets and accessible units are provided based on crowd size?',
      'What is the pump-out and servicing schedule during peak event operating hours?',
      'Are handwashing stations equipped with soap, water, and paper towel replenishments?',
      'What waste management, recycling separation, and trash hauling services are included?',
      'What is the post-event ground sweep timeline to restore the site to original condition?',
    ],
    requiredChecks: [
      'Confirm local environmental waste disposal compliance and transport manifests',
    ],
    contractWatchouts: [
      'Surcharges for contaminated recycling bins or overweight dumpster containers',
    ],
  },
  {
    id: 'insurance_admin',
    name: 'Insurance & Event Administration',
    scope:
      'Public liability insurance, event cancellation coverage, volunteer accident policies, and legal waivers.',
    questions: [
      'What is the aggregate limit of public liability and third-party property damage coverage?',
      'Does the policy name the local municipality, landowners, and event sponsors as additional insureds?',
      'What specific activities (e.g. bounce houses, fireworks, alcohol) are excluded from coverage?',
      'Does the policy cover adverse weather cancellation or forced municipal shutdown?',
      'What is the deductible or excess amount payable by the organizers per incident claim?',
    ],
    requiredChecks: [
      'Verify insurance certificate of currency names all legally required entities',
    ],
    contractWatchouts: ['Exclusion clauses for common festival activities hidden in endorsements'],
  },
];
