import { redirect } from 'next/navigation';

/**
 * The "company analytics" landing was consolidated under /analytics with
 * full period filtering, debts/payroll/warehouse + risks. Keep this path
 * as a stable redirect so existing bookmarks survive.
 */
export default function DashboardRedirectPage() {
  redirect('/analytics');
}
