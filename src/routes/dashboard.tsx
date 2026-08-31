import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getUserListings, getUserSubscription } from "@/lib/marketplace.functions";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Moj Dashboard" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading]);

  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ["user-listings", user?.id],
    queryFn: () => getUserListings(user!.id),
    enabled: !!user,
  });

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: () => getUserSubscription(user!.id),
    enabled: !!user,
  });

  if (loading || !user) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">Moj Dashboard</div>
          <Link to="/">
            <Button variant="outline">Nazad na Početnu</Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Subscription Status */}
        <section className="mb-8 p-6 border rounded-lg bg-card">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Status Pretplate</h2>
              {subscriptionLoading ? (
                <Loader2 className="animate-spin" />
              ) : subscription ? (
                <div>
                  <p className="text-green-600 font-semibold">✓ Aktivna pretplata</p>
                  <p className="text-sm text-muted-foreground">
                    Završava: {new Date(subscription.current_period_end).toLocaleDateString("hr-HR")}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-amber-600 font-semibold">Nema aktivne pretplate</p>
                  <p className="text-sm text-muted-foreground">€30/mjesečno - Neogranični oglasi</p>
                  <Link to="/subscribe">
                    <Button className="mt-3">Aktiviraj Pretplatu</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Listings */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Moji Oglasi</h2>
            {subscription && (
              <Link to="/new-listing">
                <Button><Plus className="w-4 h-4 mr-2" /> Novi Oglas</Button>
              </Link>
            )}
          </div>

          {listingsLoading ? (
            <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
          ) : listings && listings.length > 0 ? (
            <div className="space-y-4">
              {listings.map((listing: any) => (
                <div key={listing.id} className="border rounded-lg p-4 flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{listing.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{listing.description.substring(0, 100)}...</p>
                    <div className="flex gap-2 text-sm">
                      <span className="bg-secondary px-2 py-1 rounded">{listing.category}</span>
                      <span className={`px-2 py-1 rounded ${listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                        {listing.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/edit-listing/${listing.id}`}>
                      <Button variant="outline" size="sm">Uredi</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              {subscription ? "Nema oglasa. Kreni s objavljivanjem!" : "Aktiviraj pretplatu da počneš objavljivati oglase"}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
