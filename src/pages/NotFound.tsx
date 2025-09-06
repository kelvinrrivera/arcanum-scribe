import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <Card className="magical-shadow">
            <CardHeader>
              <div className="text-6xl font-bold text-muted-foreground mb-4">404</div>
              <CardTitle className="text-2xl">Page Not Found</CardTitle>
              <CardDescription>
                The page you're looking for doesn't exist or has been moved.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  You tried to access: <code className="bg-muted px-2 py-1 rounded text-sm">{location.pathname}</code>
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    Go Home
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => window.history.back()}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
              </div>
              
              <div className="pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-4">
                  Looking for something specific? Try these pages:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/generate">Generate Adventure</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/library">My Library</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/pricing">Pricing</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
