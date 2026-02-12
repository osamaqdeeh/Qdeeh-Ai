"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface StatsSectionProps {
  coursesCount: number;
  studentsCount: number;
  categoriesCount: number;
}

export function StatsSection({ coursesCount, studentsCount, categoriesCount }: StatsSectionProps) {
  const stats = [
    { label: "Active Students", value: studentsCount, suffix: "+" },
    { label: "Quality Courses", value: coursesCount, suffix: "" },
    { label: "Course Categories", value: categoriesCount, suffix: "" },
    { label: "Satisfaction Rate", value: 98, suffix: "%" },
  ];

  return (
    <section className="border-y bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-primary">
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep === steps) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(increment * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <>
      {count}
      {suffix}
    </>
  );
}
