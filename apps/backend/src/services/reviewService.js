import { AI_SUGGESTION_COUNT } from '../constants/aiReviews.js';
import { generateReviewsWithLlm } from './aiProvider.js';

const fallback5 = [
  'Stopped in on a whim and left really happy — flavors were on point and the staff made us feel welcome.',
  'Solid meal, generous portions, and the place had a nice buzz without being too loud.',
  'Fresh ingredients, quick service, and everything arrived hot. Already told a friend to try it.',
  'We loved the vibe and the food matched it. Dessert was a highlight.',
  'Great spot for a casual dinner; fair prices and genuinely friendly team.',
  'Coffee and pastry were excellent; would happily make this my weekend routine.',
  'Host seated us quickly even though it was busy — food came out fast and tasted great.',
  'Kids menu was a hit and adults enjoyed the mains too. Clean, bright dining room.',
  'Reservation was easy; wine list had good picks by the glass. Will return for a date night.',
  'Lunch special was a steal — fresh salad, hot soup, and the sandwich hit the spot.',
];

const fallback4 = [
  'Really good overall — a couple tiny misses but I would come back.',
  'Enjoyed the meal and the service; one dish was a bit salty but the rest was excellent.',
  'Nice atmosphere and friendly staff. Food was tasty though pacing was slightly slow.',
  'Good value and tasty plates. Not perfect, but definitely above average.',
  'Pleasant experience — would recommend with the caveat that it can get busy at peak times.',
  'Mostly great — one appetizer was lukewarm but mains and dessert made up for it.',
  'Solid four-star visit: friendly check-in, cozy table, mains were flavorful if not flashy.',
  'Would come again; only nitpick is parking was tight and we waited a few minutes at the door.',
  'Good flavors and fair portions; service was attentive though a refill took a while.',
  'Happy with the meal overall — one side was underseasoned but the entrée was very good.',
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Fresh suggestions on every call (no server cache) so each visitor/refresh can get a new AI pack.
 * Falls back to shuffled static lines if LLM is off or fails.
 */
export async function getOrCreateReviews({ rating, business }) {
  const r = Number(rating);
  if (r !== 4 && r !== 5) {
    throw new Error('Rating must be 4 or 5');
  }

  const ctx = {
    businessName: business.name,
    rating: r,
    location: business.location || {},
    serverName: business.serverName || '',
  };

  let reviews;
  try {
    reviews = await generateReviewsWithLlm(ctx);
  } catch {
    reviews = null;
  }
  if (!reviews || reviews.length !== AI_SUGGESTION_COUNT) {
    reviews = shuffle(r === 5 ? [...fallback5] : [...fallback4]);
  }

  return shuffle(reviews);
}
