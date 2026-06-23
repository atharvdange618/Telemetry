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
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
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

const API_URL = import.meta.env.VITE_API_URL;

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
  const [newSiteDomains, setNewSiteDomains] = useState("");
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null);
  const [newDomain, setNewDomain] = useState("");

  const { data: tenantsData, isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => fetchAPI(`${API_URL}/api/tenants`),
  });

  const createTenant = useMutation({
    mutationFn: (data: { name: string; domains: string[] }) =>
      fetchAPI(`${API_URL}/api/tenants`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      setNewSiteName("");
      setNewSiteDomains("");
    },
  });

  const updateTenant = useMutation({
    mutationFn: ({ id, domains }: { id: string; domains: string[] }) =>
      fetchAPI(`${API_URL}/api/tenants/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name: tenantsData?.tenants?.find((t: Tenant) => t.id === id)?.name, domains }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      setEditingTenantId(null);
      setNewDomain("");
    },
  });

  const deleteTenant = useMutation({
    mutationFn: (tenantId: string) =>
      fetchAPI(`${API_URL}/api/tenants/${tenantId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });

  const handleCreateSite = (e: FormEvent) => {
    e.preventDefault();
    if (newSiteName.trim()) {
      const domains = newSiteDomains
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);
      createTenant.mutate({ name: newSiteName.trim(), domains });
    }
  };

  const handleAddDomain = (tenant: Tenant) => {
    const url = newDomain.trim();
    if (!url) return;
    const domains = [...tenant.domains, url];
    updateTenant.mutate({ id: tenant.id, domains });
    setNewDomain("");
  };

  const handleRemoveDomain = (tenant: Tenant, domain: string) => {
    const domains = tenant.domains.filter((d) => d !== domain);
    updateTenant.mutate({ id: tenant.id, domains });
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
          <form onSubmit={handleCreateSite} className="space-y-4">
            <Input
              placeholder="My Awesome Blog"
              value={newSiteName}
              onChange={(e) => setNewSiteName(e.target.value)}
            />
            <Input
              placeholder="Allowed domains (comma-separated, e.g. https://example.com)"
              value={newSiteDomains}
              onChange={(e) => setNewSiteDomains(e.target.value)}
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
                  value={`<script async defer src="${API_URL}/analytics.js" data-tenant-id="${tenant.id}"></script>`}
                />

                <h3 className="font-semibold">Allowed Domains</h3>
                <div className="flex flex-wrap gap-2">
                  {tenant.domains?.map((domain) => (
                    <Badge key={domain} variant="secondary" className="gap-1">
                      {domain}
                      <button
                        onClick={() => handleRemoveDomain(tenant, domain)}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com"
                    value={editingTenantId === tenant.id ? newDomain : ""}
                    onChange={(e) => {
                      setEditingTenantId(tenant.id);
                      setNewDomain(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddDomain(tenant);
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddDomain(tenant)}
                    disabled={updateTenant.isPending}
                  >
                    Add
                  </Button>
                </div>

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
