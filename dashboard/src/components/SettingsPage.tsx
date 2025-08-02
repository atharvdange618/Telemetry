import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import type { Tenant } from "@/lib/types/dashboard.types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const fetchAPI = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error("An error occurred");
  if (res.status === 204) return null;
  return res.json();
};

const SettingsPage = () => {
  const queryClient = useQueryClient();
  const [newSiteName, setNewSiteName] = useState("");

  // Fetch tenants
  const { data: tenantsData, isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => fetchAPI("http://localhost:3000/api/tenants"),
  });

  const createTenant = useMutation({
    mutationFn: (name: string) =>
      fetchAPI("http://localhost:3000/api/tenants", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      setNewSiteName("");
    },
  });

  const deleteTenant = useMutation({
    mutationFn: (tenantId: string) =>
      fetchAPI(`http://localhost:3000/api/tenants/${tenantId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });

  const handleCreateSite = (e: FormEvent) => {
    e.preventDefault();
    if (newSiteName.trim()) {
      createTenant.mutate(newSiteName.trim());
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <Button asChild variant="outline">
          <Link to="/dashboard">← Back to Dashboard</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Site</CardTitle>
          <CardDescription>Add a new website to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateSite} className="flex gap-4">
            <Input
              placeholder="My Awesome Blog"
              value={newSiteName}
              onChange={(e) => setNewSiteName(e.target.value)}
            />
            <Button type="submit" disabled={createTenant.isPending}>
              {createTenant.isPending ? "Creating..." : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Sites</h2>
        <div className="space-y-4">
          {isLoading && <p>Loading sites...</p>}
          {tenantsData?.tenants?.map((tenant: Tenant) => (
            <Card key={tenant.id}>
              <CardHeader>
                <CardTitle>{tenant.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-semibold">Embed Script</h3>
                <Input
                  readOnly
                  value={`<script async defer src="http://localhost:3000/analytics.js" data-tenant-id="${tenant.id}"></script>`}
                />
                <div className="flex justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive">Delete Site</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently
                          delete all data associated with this site.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                          variant="destructive"
                          onClick={() => deleteTenant.mutate(tenant.id)}
                        >
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
