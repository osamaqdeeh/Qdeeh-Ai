import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Shield, Mail, Globe } from "lucide-react";

export default async function AdminSettingsPage() {
  await requireAdmin();

  // Get existing settings
  const settings = await prisma.settings.findMany();
  const settingsMap = Object.fromEntries(
    settings.map((s) => [s.key, s.value])
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage platform settings and configurations
          </p>
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <CardTitle>General Settings</CardTitle>
              </div>
              <CardDescription>
                Configure basic platform settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Site Name</Label>
                <Input
                  id="site-name"
                  defaultValue={settingsMap.siteName || "QdeehAi"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site-description">Site Description</Label>
                <Input
                  id="site-description"
                  defaultValue={
                    settingsMap.siteDescription ||
                    "Online Learning Platform"
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  defaultValue={settingsMap.supportEmail || "support@qdeeh.ai"}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <div className="text-sm text-muted-foreground">
                    Enable to put the site in maintenance mode
                  </div>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>User Registration</Label>
                  <div className="text-sm text-muted-foreground">
                    Allow new users to register
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <CardTitle>Email Settings</CardTitle>
              </div>
              <CardDescription>
                Configure email notifications and SMTP settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input
                  id="smtp-host"
                  defaultValue={settingsMap.smtpHost || ""}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input
                  id="smtp-port"
                  defaultValue={settingsMap.smtpPort || "587"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-user">SMTP Username</Label>
                <Input
                  id="smtp-user"
                  defaultValue={settingsMap.smtpUser || ""}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Welcome Email</Label>
                  <div className="text-sm text-muted-foreground">
                    Send welcome email to new users
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Course Enrollment Email</Label>
                  <div className="text-sm text-muted-foreground">
                    Send confirmation on course enrollment
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Configure payment gateway and pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Input id="currency" defaultValue="USD" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripe-key">Stripe Publishable Key</Label>
                <Input
                  id="stripe-key"
                  defaultValue={settingsMap.stripePublishableKey || ""}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Gateway</Label>
                  <div className="text-sm text-muted-foreground">
                    Enable Stripe payment processing
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Refunds Enabled</Label>
                  <div className="text-sm text-muted-foreground">
                    Allow students to request refunds
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Security Settings</CardTitle>
              </div>
              <CardDescription>
                Manage security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <div className="text-sm text-muted-foreground">
                    Require 2FA for admin accounts
                  </div>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Password Reset</Label>
                  <div className="text-sm text-muted-foreground">
                    Allow users to reset passwords
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input id="session-timeout" type="number" defaultValue="60" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Login Activity Log</Label>
                  <div className="text-sm text-muted-foreground">
                    Track all login attempts
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
