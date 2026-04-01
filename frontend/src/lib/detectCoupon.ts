/**
 * Smart coupon detection engine
 * Pattern-matches codes to brands, categories, types, and detects warnings
 */

export type CouponCategory = "Food" | "Grocery" | "Shopping" | "Entertainment" | "Travel" | "Payment" | "Other";
export type CouponType = "Percentage" | "FlatAmount" | "Cashback" | "FreeShipping" | "BuyOne" | "OtherDeal";

export interface DetectionResult {
  brand: string;
  category: CouponCategory;
  type: CouponType;
  confidence: number; // 0-100
  warning?: string;
  isFoodDelivery?: boolean;
  isPaymentApp?: boolean;
  transferable: boolean;
  suggestedDescription?: string;
}

interface BrandPattern {
  patterns: RegExp[];
  category: CouponCategory;
  type: CouponType;
  transferable: boolean;
  warning?: string;
  isPaymentApp?: boolean;
  suggestedDescription?: string;
}

const BRAND_PATTERNS: Record<string, BrandPattern> = {
  // FOOD DELIVERY
  "Swiggy": {
    patterns: [/swiggy|swigy|swg|50%|₹100|₹50|free delivery/i],
    category: "Food",
    type: "Percentage",
    transferable: true,
  },
  "Zomato": {
    patterns: [/zomato|zom|50% off|₹80|free delivery|flat 50/i],
    category: "Food",
    type: "Percentage",
    transferable: true,
  },
  "Domino's": {
    patterns: [/domino|pizza|buy one get one|bogo|pepperoni|₹99/i],
    category: "Food",
    type: "BuyOne",
    transferable: true,
    suggestedDescription: "BOGO or discount on pizza",
  },
  "McDonald's": {
    patterns: [/mcd|mcdonalds|burger|fries|₹99|free burger/i],
    category: "Food",
    type: "OtherDeal",
    transferable: true,
  },
  "EatSure": {
    patterns: [/eatsure|eat sure/i],
    category: "Food",
    type: "Percentage",
    transferable: true,
  },

  // GROCERY
  "Blinkit": {
    patterns: [/blinkit|blinkid|₹50|free delivery|groceries/i],
    category: "Grocery",
    type: "FlatAmount",
    transferable: true,
  },
  "Zepto": {
    patterns: [/zepto|₹100|₹50|grocery|delivery/i],
    category: "Grocery",
    type: "FlatAmount",
    transferable: true,
  },
  "BigBasket": {
    patterns: [/bigbasket|big basket|₹100|₹200|grocery|₹75/i],
    category: "Grocery",
    type: "FlatAmount",
    transferable: true,
  },
  "Instamart": {
    patterns: [/instamart|instant|grocery/i],
    category: "Grocery",
    type: "FlatAmount",
    transferable: true,
  },

  // SHOPPING
  "Amazon": {
    patterns: [/amazon|₹200|₹500|₹100|flat off|discount|free delivery/i],
    category: "Shopping",
    type: "FlatAmount",
    transferable: true,
  },
  "Flipkart": {
    patterns: [/flipkart|flip|₹500|₹1000|₹200|coupon|flat/i],
    category: "Shopping",
    type: "FlatAmount",
    transferable: true,
  },
  "Myntra": {
    patterns: [/myntra|fashion|clothing|₹500|₹1000|discount|off/i],
    category: "Shopping",
    type: "Percentage",
    transferable: true,
  },
  "Nykaa": {
    patterns: [/nykaa|beauty|cosmetics|₹300|₹500|₹50|off/i],
    category: "Shopping",
    type: "FlatAmount",
    transferable: true,
  },
  "Meesho": {
    patterns: [/meesho|fashion|clothing|₹500|₹100|cashback/i],
    category: "Shopping",
    type: "Cashback",
    transferable: true,
  },

  // ENTERTAINMENT
  "BookMyShow": {
    patterns: [/bookmyshow|bms|movie|ticket|₹150|₹200|₹100|film/i],
    category: "Entertainment",
    type: "FlatAmount",
    transferable: true,
  },
  "PVR": {
    patterns: [/pvr|cinema|movie|ticket|₹150|₹200/i],
    category: "Entertainment",
    type: "FlatAmount",
    transferable: true,
  },
  "Netflix": {
    patterns: [/netflix|streaming|month free|free subscription|₹99/i],
    category: "Entertainment",
    type: "OtherDeal",
    transferable: false,
    warning: "Netflix codes usually non-transferable. Verify terms.",
  },
  "Hotstar": {
    patterns: [/hotstar|disney|streaming|free|month|subscription/i],
    category: "Entertainment",
    type: "OtherDeal",
    transferable: false,
    warning: "Account-specific. May not be transferable.",
  },
  "Spotify": {
    patterns: [/spotify|music|subscription|month free|₹99/i],
    category: "Entertainment",
    type: "OtherDeal",
    transferable: false,
    warning: "Spotify credits are usually non-transferable.",
  },

  // TRAVEL
  "MakeMyTrip": {
    patterns: [/makemytrip|mmt|travel|hotel|flight|₹300|₹500|booking/i],
    category: "Travel",
    type: "FlatAmount",
    transferable: true,
  },
  "Goibibo": {
    patterns: [/goibibo|travel|flight|hotel|booking|₹500/i],
    category: "Travel",
    type: "FlatAmount",
    transferable: true,
  },
  "IRCTC": {
    patterns: [/irctc|train|railway|booking|ticket|₹200/i],
    category: "Travel",
    type: "FlatAmount",
    transferable: true,
  },
  "Rapido": {
    patterns: [/rapido|auto|ride|₹50|₹100|free ride/i],
    category: "Travel",
    type: "FlatAmount",
    transferable: true,
  },
  "Ola": {
    patterns: [/ola|ride|auto|cab|₹100|₹50|free ride|discount/i],
    category: "Travel",
    type: "FlatAmount",
    transferable: true,
  },
  "Uber": {
    patterns: [/uber|uber eats|ride|cab|₹200|₹100|free ride/i],
    category: "Travel",
    type: "FlatAmount",
    transferable: true,
  },

  // PAYMENT APPS
  "Paytm": {
    patterns: [/paytm|cashback|₹50|₹100|₹75|payment/i],
    category: "Payment",
    type: "Cashback",
    transferable: false,
    isPaymentApp: true,
    warning: "⚠ Payment app codes are usually non-transferable. Only donate if account-independent.",
  },
  "PhonePe": {
    patterns: [/phonepe|cashback|₹100|payment|rewards|₹50/i],
    category: "Payment",
    type: "Cashback",
    transferable: false,
    isPaymentApp: true,
    warning: "⚠ PhonePe codes are usually account-bound. Verify transferability.",
  },
  "Google Pay": {
    patterns: [/google pay|gpay|payment|cashback|₹100|₹50/i],
    category: "Payment",
    type: "Cashback",
    transferable: false,
    isPaymentApp: true,
    warning: "⚠ Google Pay codes are usually non-transferable.",
  },
  "CRED": {
    patterns: [/cred|credit card|rewards|cashback|₹100|₹500/i],
    category: "Payment",
    type: "Cashback",
    transferable: false,
    isPaymentApp: true,
    warning: "⚠ CRED codes are credit-card specific. Likely non-transferable.",
  },
  "Amazon Pay": {
    patterns: [/amazon pay|amazonpay|payment|cashback|₹100/i],
    category: "Payment",
    type: "Cashback",
    transferable: false,
    isPaymentApp: true,
    warning: "⚠ Amazon Pay codes may be account-specific. Verify first.",
  },
  "MobiKwik": {
    patterns: [/mobikwik|payment|cashback|₹50|₹100|rewards/i],
    category: "Payment",
    type: "Cashback",
    transferable: false,
    isPaymentApp: true,
    warning: "⚠ MobiKwik codes are likely account-specific.",
  },
};

export function detectCoupon(input: string): DetectionResult {
  const trimmed = (input || "").trim();

  if (!trimmed || trimmed.length < 2) {
    return {
      brand: "",
      category: "Other",
      type: "OtherDeal",
      confidence: 0,
      transferable: true,
    };
  }

  let bestMatch: { brand: string; confidence: number; pattern: BrandPattern } | null = null;

  // Try to match against all brands
  for (const [brand, pattern] of Object.entries(BRAND_PATTERNS)) {
    for (const regex of pattern.patterns) {
      if (regex.test(trimmed)) {
        // Score based on how early in the string the match appears
        const matchPos = trimmed.search(regex);
        const confidence = Math.min(100, 80 + (10 - Math.min(matchPos, 10)));

        if (!bestMatch || confidence > bestMatch.confidence) {
          bestMatch = { brand, confidence, pattern };
        }
        break;
      }
    }
  }

  if (!bestMatch) {
    // No pattern matched, return low-confidence result
    return {
      brand: "",
      category: "Other",
      type: "OtherDeal",
      confidence: 0,
      transferable: true,
    };
  }

  const { brand, confidence, pattern } = bestMatch;

  let typeGuess = pattern.type;
  const lowerInput = trimmed.toLowerCase();

  // Try to refine type based on keywords
  if (/%|percent|off/i.test(lowerInput)) {
    typeGuess = "Percentage";
  } else if (/₹|\$|free|flat ₹/i.test(lowerInput)) {
    typeGuess = "FlatAmount";
  } else if (/cashback|cb/i.test(lowerInput)) {
    typeGuess = "Cashback";
  } else if (/free|complimentary/i.test(lowerInput)) {
    typeGuess = "OtherDeal";
  } else if (/buy one|bogo/i.test(lowerInput)) {
    typeGuess = "BuyOne";
  } else if (/free.*ship|shipping/i.test(lowerInput)) {
    typeGuess = "FreeShipping";
  }

  return {
    brand,
    category: pattern.category,
    type: typeGuess,
    confidence,
    warning: pattern.warning,
    isPaymentApp: pattern.isPaymentApp,
    transferable: pattern.transferable,
    suggestedDescription: pattern.suggestedDescription,
  };
}
