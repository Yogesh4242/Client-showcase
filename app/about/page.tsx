import { Building2, Compass, HardHat } from "lucide-react";

const services = [
  {
    icon: Building2,
    title: "Infrastructure",
    description:
      "Large-scale infrastructure projects — highways, bridges, and urban development that connect communities.",
  },
  {
    icon: HardHat,
    title: "Construction",
    description:
      "Commercial and residential construction with precision engineering and on-time delivery.",
  },
  {
    icon: Compass,
    title: "Consulting",
    description:
      "Strategic consulting for project planning, feasibility studies, and sustainable development.",
  },
];

export default function AboutSection() {
  return (
    <section className="relative z-20 bg-background">
      <div className="container mx-auto px-8 py-32">
        <div className="mb-20">
          <p className="font-mono text-xs tracking-[0.4em] text-primary uppercase mb-4">
            What We Do
          </p>
          <h2 className="font-display text-5xl md:text-7xl text-foreground mb-6">
            OUR EXPERTISE
          </h2>
          <div className="w-20 h-px bg-primary" />
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {services.map((service) => (
            <div
              key={service.title}
              className="group p-8 rounded-lg border border-border hover:border-glow transition-all duration-500"
            >
              <service.icon className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-display text-2xl text-foreground mb-4 tracking-wide">
                {service.title.toUpperCase()}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-32 grid md:grid-cols-4 gap-8 text-center">
          {[
            { value: "250+", label: "Projects Completed" },
            { value: "15+", label: "Years Experience" },
            { value: "50+", label: "Team Members" },
            { value: "12", label: "States Active" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-5xl text-primary mb-2">{stat.value}</p>
              <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
