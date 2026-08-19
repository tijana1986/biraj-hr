import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, AlertCircle, Loader2, Mail } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { verifyEmail, resendVerificationEmail } from "@/lib/email.functions";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/provjeri-email")({
  head: () => ({
    meta: [
      { title: "Provjera e-maila — Biraj.HR" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: VerifyEmail,
});

type VerifyParams = {
  token?: string;
};

function VerifyEmail() {
  const { user } = useAuth();
  const search = useSearch({ from: Route.id });
  const params = search as VerifyParams;
  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">("loading");
  const [message, setMessage] = useState<string>("");
  const [resending, setResending] = useState(false);
  const verifyEmailFn = useServerFn(verifyEmail);
  const resendFn = useServerFn(resendVerificationEmail);

  useEffect(() => {
    const verifyToken = async () => {
      if (!user || !params.token) {
        setStatus("expired");
        setMessage("Veza za potvrdu e-maila nije valid ili je istekla.");
        return;
      }

      try {
        await verifyEmailFn({
          data: {
            token: params.token,
            userId: user.id,
          },
        });
        setStatus("success");
        setMessage("Vaš e-mail je uspješno potvrđen!");
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Greška pri potvrdi e-maila");
      }
    };

    verifyToken();
  }, [user, params.token, verifyEmailFn]);

  const handleResend = async () => {
    if (!user) return;
    setResending(true);
    try {
      await resendFn({
        data: {
          userId: user.id,
          email: user.email || "",
        },
      });
      alert("Verifikacijski email je ponovno poslan!");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Greška pri slanju e-maila");
    } finally {
      setResending(false);
    }
  };

  if (!user) {
    return (
      <SiteShell>
        <section className="mx-auto max-w-md px-6 py-20 text-center">
          <Mail className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Morate biti prijavljeni</h1>
          <p className="mt-2 text-sm text-muted-foreground">Molimo prijavite se kako bi potvrdili e-mail.</p>
          <Link
            to="/prijava"
            className="mt-6 inline-flex h-10 items-center rounded-md bg-[color:var(--navy)] px-6 text-sm font-semibold text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]"
          >
            Prijava
          </Link>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-md px-6 py-20 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[color:var(--gold-deep)]" />
            <h1 className="mt-4 font-display text-2xl font-semibold">Provjera e-maila…</h1>
            <p className="mt-2 text-sm text-muted-foreground">Molimo čekajte.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[color:var(--gold)]/20">
              <Check className="h-8 w-8 text-[color:var(--gold-deep)]" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-semibold">E-mail je potvrđen!</h1>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <Link
              to="/racun/profil"
              className="mt-6 inline-flex h-10 items-center rounded-md bg-[color:var(--navy)] px-6 text-sm font-semibold text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]"
            >
              Moj profil
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
            <h1 className="mt-4 font-display text-2xl font-semibold">Greška pri potvrdi</h1>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <Button
              onClick={handleResend}
              disabled={resending}
              variant="outline"
              className="mt-6"
            >
              {resending ? "Slanje…" : "Pošalji ponovno"}
            </Button>
          </>
        )}

        {status === "expired" && (
          <>
            <Mail className="mx-auto h-10 w-10 text-amber-600" />
            <h1 className="mt-4 font-display text-2xl font-semibold">Veza je istekla</h1>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <Button
              onClick={handleResend}
              disabled={resending}
              className="mt-6 bg-[color:var(--navy)] text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]"
            >
              {resending ? "Slanje…" : "Pošalji novi e-mail"}
            </Button>
          </>
        )}
      </section>
    </SiteShell>
  );
}
