import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCreateUser } from "@/hooks/useUsers";
import { useToast } from "@/components/ui/toast-provider";

export default function UserCreatePage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const createUser = useCreateUser();

  const [formData, setFormData] = useState({
    id: "",
    displayname: "",
    password: "",
    admin: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser.mutateAsync({
        id: formData.id,
        displayname: formData.displayname,
        password: formData.password,
        admin: formData.admin ? 1 : 0,
      });
      success("User created successfully");
      navigate({ to: "/users" as string });
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to create user");
    }
  };

  return (
    <>
      <PageHeader
        title="Create User"
        description="Add a new user to your Matrix server"
        breadcrumbs={[
          { label: "Users", href: "/users" },
          { label: "Create" },
        ]}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>Enter the information for the new user</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="id">Username</Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayname">Display Name</Label>
              <Input
                id="displayname"
                value={formData.displayname}
                onChange={(e) => setFormData({ ...formData, displayname: e.target.value })}
                placeholder="Display Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Password"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="admin"
                checked={formData.admin}
                onCheckedChange={(checked) => setFormData({ ...formData, admin: checked })}
              />
              <Label htmlFor="admin">Admin privileges</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={createUser.isPending}>
                {createUser.isPending ? "Creating..." : "Create User"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate({ to: "/users" as string })}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
