import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [{ title: "Registracija" }],
  }),
  component: Register,
});

function Register() {
  const { user, loading, register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, setError, watch } = useForm<{
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
    city: string;
  }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate({ to: "/dashboard" });
    }
  }, [user, loading]);

  const onSubmit = async (data: any) => {
    if (data.password !== data.passwordConfirm) {
      setError("passwordConfirm", { message: "Lozinke se ne poklapaju" });
      return;
    }

    setIsSubmitting(true);
    const result = await registerUser(data.name, data.email, data.password, data.city);
    if (result.error) {
      setError("email", { message: result.error });
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Registracija</h1>
          <p className="text-muted-foreground">Kreiraj novi račun</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Ime i Prezime</label>
            <Input
              placeholder="Marko Marković"
              {...register("name", { required: true })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              placeholder="vasa@email.com"
              {...register("email", { required: true })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Grad</label>
            <Input
              placeholder="Zagreb"
              {...register("city", { required: true })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Lozinka</label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register("password", { required: true })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Potvrdi Lozinku</label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register("passwordConfirm", { required: true })}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : null}
            Registracija
          </Button>
        </form>

        <p className="text-center text-sm mt-6 text-muted-foreground">
          Već imaš račun?{" "}
          <a href="/login" className="text-primary hover:underline">
            Prijava
          </a>
        </p>
      </div>
    </div>
  );
}
