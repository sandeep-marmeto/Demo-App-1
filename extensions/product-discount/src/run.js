// @ts-check
import { DiscountApplicationStrategy } from "../generated/api";

// Use JSDoc annotations for type safety
/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 * @typedef {import("../generated/api").Target} Target
 * @typedef {import("../generated/api").ProductVariant} ProductVariant
 */

/**
 * @type {FunctionRunResult}
 */
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {  
  // Filter cart lines where the product has a metafield and a product tag
  const eligibleLines = input.cart.lines.filter(
    (line) => line.merchandise.product.hasAnyTag !== false && line.merchandise.product.metafield != null
  );

  if (!eligibleLines.length) {
    console.error("No cart lines qualify for volume discount.");
    return EMPTY_DISCOUNT;
  }

  // Generate discount objects
  const discounts = eligibleLines.map((line) => {
    const tiers = line.merchandise.product.metafield.jsonValue;

    if (!Array.isArray(tiers) || tiers.length === 0) {
      console.warn(`Invalid discount tiers for product ${line.merchandise.product.id}`);
      return null; // Skip invalid entries
    }

    // Find the highest applicable discount tier
    const applicableTier = tiers
      .filter(tier => line.quantity >= tier.quantity)
      .sort((a, b) => b.quantity - a.quantity)[0];

    if (!applicableTier || isNaN(applicableTier.discount)) {
      console.warn(`No applicable discount for product ${line.merchandise.product.id}`);
      return null; // Skip if no valid tier is found
    }

    return {
      targets: [
        {
          cartLine: {
            id: line.id,
          },
        },
      ],
      value: {
        percentage: {
          value: applicableTier.discount.toString(), // Ensure it's a string
        },
      },
      message: applicableTier.message,
    };
  }).filter(Boolean); // Remove null values

  return {
    discounts,
    discountApplicationStrategy: DiscountApplicationStrategy.All,
  };
}
