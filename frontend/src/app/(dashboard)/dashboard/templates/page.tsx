import type { Metadata } from 'next';
import { TemplateManagement } from '@/features/template';

export const metadata: Metadata = { title: 'Templates' };

/**
 * /dashboard/templates — Template (brochure PDF) management. Rendered inside the
 * dashboard layout (AuthGuard + shell). Logic lives in the feature component.
 */
export default function TemplatesPage() {
  return <TemplateManagement />;
}
