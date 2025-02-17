// @ts-check
import { DiscountApplicationStrategy } from "../generated/api";

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
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
  console.error("DEBUG: Received input:", JSON.stringify(input, null, 2));

  const MIN_ORDER_AMOUNT = 1000;
  const DISCOUNT_PERCENTAGE = 10.0;

  const subtotal = parseFloat(input.cart.cost.subtotalAmount.amount);

  console.error("DEBUG: Order Subtotal:", subtotal);

  if (subtotal < MIN_ORDER_AMOUNT) {
    console.error("DEBUG: Order subtotal does not meet the minimum requirement for discount.");
    return EMPTY_DISCOUNT;
  }

  console.error("DEBUG: Order qualifies for discount, applying 10% off.");

  return {
    discounts: [
      {
        targets: [
          {
            orderSubtotal: {
              excludedVariantIds: [],
            },
          },
        ],
        value: {
          percentage: {
            value: DISCOUNT_PERCENTAGE.toString(),
          },
        },
      },
    ],
    discountApplicationStrategy: DiscountApplicationStrategy.First,
  };
}
