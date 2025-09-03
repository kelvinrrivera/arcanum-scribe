import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  User,
  Crown,
  Zap,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Bell,
  Shield,
  Palette
} from 'lucide-react';

const Settings = () => {
  const { user, profile } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground">Please sign in to access settings.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage your account preferences and settings
            </p>
          </div>

          {/* Settings Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Account Information */}
            <Card className="magical-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg gradient-primary">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <CardTitle>Account Information</CardTitle>
                </div>
                <CardDescription>
                  Your profile and subscription details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Display Name</span>
                    <span className="text-sm text-muted-foreground">
                      {profile?.display_name || 'Not set'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email</span>
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Subscription</span>
                    <Badge variant="secondary" className="text-xs">
                      <Crown className="h-3 w-3 mr-1" />
                      {profile?.subscription_tier || 'Free'} Plan
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Credits Remaining</span>
                    <span className="text-sm text-muted-foreground">
                      {profile?.credits_remaining || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card className="magical-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg gradient-accent">
                    <Palette className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <CardTitle>Appearance</CardTitle>
                </div>
                <CardDescription>
                  Customize your interface appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Theme</span>
                      <p className="text-xs text-muted-foreground">
                        Choose between light and dark themes
                      </p>
                    </div>
                    <ThemeToggle />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Notifications</span>
                      <p className="text-xs text-muted-foreground">
                        Manage your notification preferences
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Bell className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="magical-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg gradient-secondary">
                    <Shield className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <CardTitle>Security</CardTitle>
                </div>
                <CardDescription>
                  Manage your account security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Two-Factor Authentication
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    Privacy Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Subscription */}
            <Card className="magical-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg gradient-primary">
                    <Crown className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <CardTitle>Subscription</CardTitle>
                </div>
                <CardDescription>
                  Manage your subscription and billing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Plan</span>
                    <Badge variant="secondary" className="text-xs">
                      {profile?.subscription_tier || 'Free'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Credits Used</span>
                    <span className="text-sm text-muted-foreground">
                      {profile?.monthly_generations || 0} this month
                    </span>
                  </div>
                  <Button className="w-full gradient-primary text-primary-foreground">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Danger Zone */}
          <Card className="magical-shadow border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions that will permanently affect your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button variant="destructive" size="sm" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
                <Button variant="destructive" size="sm" className="w-full justify-start">
                  <Zap className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings; 