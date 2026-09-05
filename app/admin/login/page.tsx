import { redirect } from 'next/navigation';
import { AccessForm } from './AccessForm';
import { currentAdmin, needsSetup } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  // Already signed in? There is nothing to do here.
  if (await currentAdmin()) redirect('/admin');

  const setup = await needsSetup();

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-20">
      <AccessForm setup={setup} />
    </div>
  );
}
