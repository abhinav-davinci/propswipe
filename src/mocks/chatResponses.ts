import type { Property } from '../types/property';

const genericResponses = [
  "Yes, this property is still available! Would you like to schedule a visit?",
  "Great choice! I can arrange a site visit at your convenience. When works best for you?",
  "Thank you for your interest! Let me share some more details about this property.",
  "I'd be happy to help! This is one of the best units in this project.",
  "Absolutely! I can also share the floor plan and brochure if you'd like.",
];

const availabilityResponses = [
  "Yes, it's available! There's been quite a bit of interest though, so I'd recommend visiting soon.",
  "This unit is still on the market. Would you like to book a site visit this weekend?",
  "Available and ready for possession! Shall I arrange a walkthrough?",
];

const visitResponses = [
  "Of course! I'm available this weekend — Saturday or Sunday, which works better?",
  "I can show you the property tomorrow afternoon or this weekend. What suits you?",
  "Let's set up a visit! I'll send you the exact location and meeting point.",
];

const priceResponses = (property: Property) => [
  `The listed price is ${formatPrice(property.price, property.transactionType)}. There's some room for negotiation for serious buyers.`,
  `At ${formatPrice(property.price, property.transactionType)}, this is competitively priced for ${property.location.area}. Happy to discuss.`,
  `The owner is firm at ${formatPrice(property.price, property.transactionType)}, but I can try to negotiate if you're interested.`,
];

const societyResponses = (property: Property) => [
  `${property.title} has excellent amenities — ${property.specs.amenities.slice(0, 3).join(', ')} and more. The society is well-maintained.`,
  `It's a great community! The ${property.specs.amenities[0]} and ${property.specs.amenities[1]} are top-notch. Very family-friendly.`,
  `The society has ${property.specs.amenities.length} amenities including ${property.specs.amenities.slice(0, 2).join(' and ')}. Maintenance is around ₹4-5/sqft.`,
];

function formatPrice(price: number, type: string): string {
  if (type === 'rent') return `₹${(price / 1000).toFixed(0)}K/month`;
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
  return `₹${(price / 100000).toFixed(1)} L`;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateAgentReply(userMessage: string, property: Property): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes('available') || lower.includes('still listed')) {
    return pickRandom(availabilityResponses);
  }
  if (lower.includes('visit') || lower.includes('schedule') || lower.includes('see the')) {
    return pickRandom(visitResponses);
  }
  if (lower.includes('price') || lower.includes('lowest') || lower.includes('negotiate') || lower.includes('cost')) {
    return pickRandom(priceResponses(property));
  }
  if (lower.includes('society') || lower.includes('amenities') || lower.includes('community')) {
    return pickRandom(societyResponses(property));
  }

  // Property-aware generic response
  const contextual = [
    ...genericResponses,
    `This ${property.specs.bedrooms}BHK in ${property.location.area} is a great pick! Let me know if you have any questions.`,
    `The ${property.specs.carpetArea} sqft layout is very well designed. Would you like to see the floor plan?`,
  ];
  return pickRandom(contextual);
}
