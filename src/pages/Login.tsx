import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BarChart3 } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      toast({ title: "Error", description: result.error.errors[0].message, variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    navigate("/dashboard");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(120,20%,90%)] to-[hsl(120,15%,85%)] flex flex-col items-center justify-center px-4">
      <div className="mb-6 flex items-center gap-2">
        <BarChart3 className="h-8 w-8" />
        <span className="text-xl font-bold text-background">SURVEY</span>
      </div>

      <h1 className="text-3xl font-bold text-primary mb-8">Login</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
        <div>
          <Label htmlFor="email" className="text-primary font-medium">Email Address *</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 bg-foreground/90 text-background border-0 h-14 rounded-xl" />
        </div>
        <div>
          <Label htmlFor="password" className="text-primary font-medium">Password *</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 bg-foreground/90 text-background border-0 h-14 rounded-xl" />
        </div>

        <Button type="submit" disabled={loading} className="w-full h-14 rounded-full gradient-orange-pink text-primary-foreground text-lg font-semibold border-0 hover:opacity-90">
          {loading ? "Logging in..." : "Login"}
        </Button>

        <Link to="/register" className="block text-center text-primary text-sm hover:underline">
          Don't have an account? Sign Up
        </Link>
      </form>
    </div>
  );
};

export default Login;
