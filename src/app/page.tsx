import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { ArrowRight, BookOpen, Users, Trophy, Star } from "lucide-react";
import { FeaturedCourses } from "@/components/home/featured-courses";
import { StatsSection } from "@/components/home/stats-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";

// Enable ISR - revalidate every 60 seconds
export const revalidate = 60;

export default async function HomePage() {
  const [coursesCount, studentsCount, categoriesCount] = await Promise.all([
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.student.count(),
    prisma.category.count(),
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Learn Skills That Matter
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Join thousands of students learning from industry experts. Build real-world projects
              and advance your career with our comprehensive courses.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/courses">
                  Browse Courses <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/signup">Get Started Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection 
        coursesCount={coursesCount}
        studentsCount={studentsCount}
        categoriesCount={categoriesCount}
      />

      {/* Featured Courses */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Featured Courses
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start learning with our most popular courses
            </p>
          </div>
          <FeaturedCourses />
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/courses">
                View All Courses <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Choose EduPlatform?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to advance your skills
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <BookOpen className="h-10 w-10 text-primary" />
                <CardTitle>Quality Content</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Learn from industry experts with years of real-world experience
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary" />
                <CardTitle>Active Community</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect with fellow learners and get support when you need it
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Trophy className="h-10 w-10 text-primary" />
                <CardTitle>Certificates</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Earn certificates to showcase your achievements and skills
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Star className="h-10 w-10 text-primary" />
                <CardTitle>Lifetime Access</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Learn at your own pace with unlimited access to all course materials
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Start Learning?
          </h2>
          <p className="mt-4 text-lg opacity-90">
            Join thousands of students and start your learning journey today
          </p>
          <div className="mt-10">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/signup">
                Sign Up Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
