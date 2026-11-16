import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, CreditCard, Loader2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/contexts/UserDataContext";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const { subscription } = useUserData();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const profile = useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("display_name,email").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const save = useMutation({
    mutationFn: async () => {
      const name = displayName.trim();
      if (!name || name.length > 80) throw new Error("Enter a name between 1 and 80 characters.");
      const { error } = await supabase.from("profiles").upsert({ user_id: user!.id, email: user!.email ?? "", display_name: name }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      setDisplayName("");
      toast.success("Profile updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!authLoading && !user) {
    return <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16"><Card className="w-full max-w-lg"><CardHeader><CardTitle>Sign in to view your profile</CardTitle></CardHeader><CardContent><Button asChild><Link to="/auth?redirect=%2Fprofile">Continue to sign in</Link></Button></CardContent></Card></main>;
  }

  const name = profile.data?.display_name ?? user?.user_metadata?.display_name ?? "Learner";
  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Button variant="ghost" asChild><Link to="/dashboard"><ArrowLeft data-icon="inline-start" />Dashboard</Link></Button>
          <Button variant="outline" asChild><Link to="/billing"><CreditCard data-icon="inline-start" />Billing</Link></Button>
        </div>
        <header className="mb-8">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><UserRound /></div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Your profile</h1>
          <p className="mt-3 text-muted-foreground">Manage your learner details and account information.</p>
        </header>
        <div className="grid gap-6 md:grid-cols-[1fr_0.8fr]">
          <Card>
            <CardHeader><CardTitle>Personal details</CardTitle><CardDescription>Your name is shown in your learning dashboard.</CardDescription></CardHeader>
            <CardContent>
              {profile.isPending ? <Loader2 className="size-5 animate-spin text-muted-foreground" /> : (
                <form className="flex flex-col gap-5" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
                  <div className="flex flex-col gap-2"><Label htmlFor="profile-email">Email address</Label><Input id="profile-email" type="email" value={profile.data?.email ?? user?.email ?? ""} readOnly /></div>
                  <div className="flex flex-col gap-2"><Label htmlFor="profile-name">Display name</Label><Input id="profile-name" autoComplete="name" maxLength={80} value={displayName || name} onChange={(event) => setDisplayName(event.target.value)} /></div>
                  <Button type="submit" disabled={save.isPending || !displayName.trim()}>{save.isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : null}Save changes</Button>
                </form>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Learning account</CardTitle><CardDescription>Your plan and scoring access at a glance.</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-center gap-3"><BadgeCheck className="size-5 text-primary" /><div><p className="font-medium capitalize">{subscription?.tier ?? "Free"} plan</p><p className="text-sm text-muted-foreground">{subscription?.credits_remaining ?? 0} scoring credits available</p></div></div>
              <Button variant="outline" asChild><Link to="/billing">View billing details</Link></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
