import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { BarChart3 } from "lucide-react";
import { z } from "zod";

const registerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50),
  education: z.string().min(1, "Education level is required"),
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [education, setEducation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = registerSchema.safeParse({ firstName, lastName, education, email, password });
    if (!result.success) {
      toast({ title: "Validation Error", description: result.error.errors[0].message, variant: "destructive" });
      return;
    }

    if (!accepted) {
      toast({ title: "Error", description: "Please accept the terms and conditions", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { first_name: firstName, last_name: lastName, education_level: education },
      },
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Create profile
    if (data.user) {
      await supabase.from("profiles").insert({
        user_id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        education_level: education,
      });
    }

    toast({ title: "Success", description: "Account created successfully!" });
    navigate("/referral");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(120,20%,90%)] to-[hsl(120,15%,85%)] flex flex-col items-center py-8 px-4">
      <div className="mb-6 flex items-center gap-2">
        <BarChart3 className="h-8 w-8" />
        <span className="text-xl font-bold">SURVEY</span>
      </div>

      <h1 className="text-3xl font-bold text-primary mb-8">Register</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
        <div>
          <Label htmlFor="firstName" className="text-primary font-medium">First Name *</Label>
          <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 bg-foreground/90 text-background border-0 h-14 rounded-xl" />
        </div>
        <div>
          <Label htmlFor="lastName" className="text-primary font-medium">Last Name *</Label>
          <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 bg-foreground/90 text-background border-0 h-14 rounded-xl" />
        </div>
        <div>
          <Label className="text-primary font-medium">Level of Education *</Label>
          <Select value={education} onValueChange={setEducation}>
            <SelectTrigger className="mt-1 bg-foreground/90 text-background border-0 h-14 rounded-xl">
              <SelectValue placeholder="Select education level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Primary School</SelectItem>
              <SelectItem value="secondary">Secondary School</SelectItem>
              <SelectItem value="diploma">Diploma</SelectItem>
              <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
              <SelectItem value="masters">Master's Degree</SelectItem>
              <SelectItem value="phd">PhD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="email" className="text-primary font-medium">Email Address *</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 bg-foreground/90 text-background border-0 h-14 rounded-xl" />
        </div>
        <div>
          <Label htmlFor="password" className="text-primary font-medium">Password *</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 bg-foreground/90 text-background border-0 h-14 rounded-xl" />
        </div>

        <div className="flex items-center gap-3">
          <Checkbox id="terms" checked={accepted} onCheckedChange={(v) => setAccepted(v === true)} className="data-[state=checked]:gradient-orange-pink" />
          <label htmlFor="terms" className="text-sm">Accept Our Terms and Condition</label>
        </div>

        <button type="button" className="text-primary text-sm font-medium hover:underline">
          View Terms and Conditions
        </button>

        <Button type="submit" disabled={loading} className="w-full h-14 rounded-full gradient-orange-pink text-primary-foreground text-lg font-semibold border-0 hover:opacity-90">
          {loading ? "Signing Up..." : "Sign Up"}
        </Button>

        <Link to="/login" className="block text-center text-primary text-sm hover:underline">
          Already have an account? Login
        </Link>
      </form>
    </div>
  );
};

export default Register;
