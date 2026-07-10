import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

/**
 * Entry route. Funnels users into the guarded dashboard, which redirects to
 * login when there is no session — so the auth rules apply from the root.
 */
export default function HomePage() {
  redirect(ROUTES.dashboard.root);
}
