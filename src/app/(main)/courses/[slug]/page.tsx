import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Clock, Users, Globe, BarChart, CheckCircle, PlayCircle } from "lucide-react";
import { formatPrice, formatDuration } from "@/lib/utils";
import { auth } from "@/auth";
import { EnrollButton } from "@/components/courses/enroll-button";
import { CourseReviews } from "@/components/courses/course-reviews";

// Revalidate every 10 minutes
export const revalidate = 600;

interface CoursePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const session = await auth();

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      category: true,
      sections: {
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course || course.status !== "PUBLISHED") {
    notFound();
  }

  // Check if user is enrolled
  let isEnrolled = false;
  if (session?.user) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: course.id,
        },
      },
    });
    isEnrolled = !!enrollment;
  }

  const totalLessons = course.sections.reduce((acc, section) => acc + section.lessons.length, 0);
  const totalDuration = course.sections.reduce(
    (acc, section) => acc + section.lessons.reduce((sum, lesson) => sum + lesson.duration, 0),
    0
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Badge className="mb-4">{course.category.name}</Badge>
              <h1 className="text-3xl lg:text-5xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{course.shortDescription}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{course.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({course.reviewsCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-5 w-5" />
                  <span>{course.studentsCount.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-5 w-5" />
                  <span>{formatDuration(totalDuration)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-5 w-5" />
                  <span>{course.language}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart className="h-5 w-5" />
                  <span>{course.level}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Image
                  src={course.instructorImage || "/placeholder.jpg"}
                  alt={course.instructorName}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <p className="text-sm text-muted-foreground">Instructor</p>
                  <p className="font-semibold">{course.instructorName}</p>
                </div>
              </div>
            </div>

            {/* Sidebar - Purchase Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader className="p-0">
                  {course.thumbnail && (
                    <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                      {course.previewVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <PlayCircle className="h-16 w-16 text-white" />
                        </div>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-4">
                    {course.discountPrice ? (
                      <div>
                        <div className="text-3xl font-bold">
                          {formatPrice(course.discountPrice)}
                        </div>
                        <div className="text-lg text-muted-foreground line-through">
                          {formatPrice(course.price)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-3xl font-bold">{formatPrice(course.price)}</div>
                    )}
                  </div>

                  <EnrollButton
                    courseId={course.id}
                    courseSlug={course.slug}
                    isEnrolled={isEnrolled}
                    isAuthenticated={!!session?.user}
                  />

                  <div className="mt-6 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>30-day money-back guarantee</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview">
                <TabsList className="mb-8">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                  <TabsTrigger value="instructor">Instructor</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">About This Course</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap">{course.description}</p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-4">What You&apos;ll Learn</h2>
                    <div className="grid gap-3 md:grid-cols-2">
                      {course.learningOutcomes.map((outcome, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span>{outcome}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-4">Requirements</h2>
                    <ul className="space-y-2">
                      {course.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span>{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="curriculum">
                  <h2 className="text-2xl font-bold mb-4">Course Curriculum</h2>
                  <p className="text-muted-foreground mb-6">
                    {course.sections.length} sections • {totalLessons} lectures • {formatDuration(totalDuration)} total
                  </p>
                  <Accordion type="single" collapsible className="w-full">
                    {course.sections.map((section) => {
                      const sectionDuration = section.lessons.reduce((acc, lesson) => acc + lesson.duration, 0);
                      return (
                        <AccordionItem key={section.id} value={section.id}>
                          <AccordionTrigger>
                            <div className="flex flex-col items-start text-left">
                              <span className="font-semibold">{section.title}</span>
                              <span className="text-sm text-muted-foreground">
                                {section.lessons.length} lectures • {formatDuration(sectionDuration)}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-4">
                              {section.lessons.map((lesson) => (
                                <div key={lesson.id} className="flex items-center justify-between py-2">
                                  <div className="flex items-center gap-2">
                                    <PlayCircle className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{lesson.title}</span>
                                    {lesson.isFree && (
                                      <Badge variant="secondary" className="text-xs">Free</Badge>
                                    )}
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {formatDuration(lesson.duration)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </TabsContent>

                <TabsContent value="instructor">
                  <div className="flex items-start gap-6">
                    {course.instructorImage && (
                      <Image
                        src={course.instructorImage}
                        alt={course.instructorName}
                        width={120}
                        height={120}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{course.instructorName}</h2>
                      <p className="text-muted-foreground whitespace-pre-wrap">{course.instructorBio}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews">
                  <CourseReviews courseId={course.id} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
