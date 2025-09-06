import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LandingPage } from '@/components/landing/LandingPage';
import { SEOHead, SEO_CONFIGS } from '@/components/seo/SEOHead';
import { STRUCTURED_DATA } from '@/lib/structured-data';

const Index = () => {
  const { user, profile, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/10">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!user) {
    return (
      <>
        <SEOHead
          {...SEO_CONFIGS.home}
          structuredData={STRUCTURED_DATA.home()}
        />
        <LandingPage />
      </>
    );
  }

  // Redirect authenticated users to generate page (which will show with sidebar via ProtectedRoute)
  return <Navigate to="/generate" replace />;
};

export default Index;