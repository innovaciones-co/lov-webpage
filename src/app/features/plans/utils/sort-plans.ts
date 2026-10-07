import { ProductType } from '../../payments/models/product.model';
import { Category } from '../models/category.model';
import { Plan } from '../models/plan.model';

/**
 * Display order for plan lists (home carousel and /planes): monthly plans first, most expensive
 * to cheapest; everything else (daily plans, data and voice packs) after them in the order set
 * in the admin. Inactive plans are left out.
 *
 * "Monthly" is the "Planes Mensuales" category when categories are loaded; otherwise a 30-day
 * PLAN (30-day voice/data packs are BUNDLEs, so they don't count).
 */
export function sortPlansForDisplay(plans: Plan[] | null | undefined, categories: Category[] = []): Plan[] {
  const monthlyCategoryIds = new Set(categories
    .filter(category => category.name.toLowerCase().includes('mensual'))
    .map(category => category.id));
  const isMonthly = (plan: Plan) => monthlyCategoryIds.size > 0
    ? monthlyCategoryIds.has(plan.category)
    : plan.productType === ProductType.PLAN && plan.validity === 30;

  return (plans ?? []).filter(plan => plan.isActive).sort((a, b) => {
    if (isMonthly(a) !== isMonthly(b)) return isMonthly(a) ? -1 : 1;
    if (isMonthly(a) && a.totalPrice !== b.totalPrice) return b.totalPrice - a.totalPrice;
    if (a.order !== b.order) return a.order - b.order;
    return a.id - b.id;
  });
}
