import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Schedura</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/login")}
              className="hover:bg-primary/10"
            >
              Login
            </Button>
            <Button 
              onClick={() => navigate("/signup")}
              className="gradient-hero shadow-soft hover:shadow-medium transition-smooth"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Schedule smarter, live better
            </span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Your calendar,
            <br />
            <span className="gradient-hero bg-clip-text text-transparent">
              beautifully organized
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Schedura brings clarity to your schedule. Create personal calendars, 
            collaborate with teams, and never miss what matters.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Button 
              size="lg"
              onClick={() => navigate("/signup")}
              className="gradient-hero shadow-medium hover:shadow-strong transition-smooth text-lg px-8"
            >
              Start Free
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 hover:bg-primary/5 transition-smooth text-lg px-8"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20 bg-surface/30">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            Everything you need to stay organized
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Calendar className="w-10 h-10 text-primary" />}
              title="Personal Space"
              description="Create unlimited calendars for work, life, and everything in between"
            />
            
            <FeatureCard
              icon={<Users className="w-10 h-10 text-primary" />}
              title="Team Workspaces"
              description="Collaborate seamlessly with role-based access and shared calendars"
            />
            
            <FeatureCard
              icon={<Clock className="w-10 h-10 text-primary" />}
              title="Smart Reminders"
              description="Never miss important events with email and push notifications"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto gradient-card rounded-3xl p-12 text-center shadow-strong border border-border">
          <h3 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Ready to take control of your time?
          </h3>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands who schedule smarter with Schedura
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/signup")}
            className="gradient-hero shadow-medium hover:shadow-strong transition-smooth text-lg px-8"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              <span className="font-semibold text-foreground">Schedura</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Schedura. Schedule smarter, live better.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => (
  <div className="gradient-card p-8 rounded-2xl border border-border shadow-soft hover:shadow-medium transition-smooth">
    <div className="mb-4">{icon}</div>
    <h4 className="text-xl font-bold mb-3 text-foreground">{title}</h4>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Landing;
