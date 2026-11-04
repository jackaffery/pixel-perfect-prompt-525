import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "@/components/admin/Overview";
import { PropertiesAdmin } from "@/components/admin/PropertiesAdmin";
import { SubmissionsAdmin, InquiriesAdmin, ViewingsAdmin } from "@/components/admin/RequestsAdmin";
import { CustomersAdmin, AgentsAdmin, CategoriesAdmin, SettingsAdmin } from "@/components/admin/ManageAdmin";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ ...seo("Admin Dashboard", "Manage properties, customers and inquiries."), meta: [...seo("Admin Dashboard", "Manage properties, customers and inquiries.").meta, { name: "robots", content: "noindex" }] }),
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });
    const { data } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    if (!data) throw redirect({ to: "/account" });
  },
  component: Admin,
});

function Admin() {
  return (
    <div className="container-x py-10">
      <p className="eyebrow">Administrator</p>
      <h1 className="mb-6 mt-1 text-3xl font-semibold text-primary-deep">Dashboard</h1>
      <Tabs defaultValue="overview">
        <TabsList className="h-auto flex-wrap justify-start">
          {["overview", "properties", "submissions", "inquiries", "viewings", "customers", "agents", "categories", "settings"].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview" className="pt-6"><Overview /></TabsContent>
        <TabsContent value="properties" className="pt-6"><PropertiesAdmin /></TabsContent>
        <TabsContent value="submissions" className="pt-6"><SubmissionsAdmin /></TabsContent>
        <TabsContent value="inquiries" className="pt-6"><InquiriesAdmin /></TabsContent>
        <TabsContent value="viewings" className="pt-6"><ViewingsAdmin /></TabsContent>
        <TabsContent value="customers" className="pt-6"><CustomersAdmin /></TabsContent>
        <TabsContent value="agents" className="pt-6"><AgentsAdmin /></TabsContent>
        <TabsContent value="categories" className="pt-6"><CategoriesAdmin /></TabsContent>
        <TabsContent value="settings" className="pt-6"><SettingsAdmin /></TabsContent>
      </Tabs>
    </div>
  );
}
