import { createFileRoute } from '@tanstack/react-router';
import { Auth } from '@/components/Auth';
import { SiteNav } from '@/components/SiteNav';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="min-h-screen bg-background mesh-gradient flex flex-col">
      <SiteNav />
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <Auth />
      </div>
    </div>
  );
}
