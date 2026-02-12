import { PrismaClient, CourseLevel, CourseStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create ADMIN user (stored in admins table)
  const hashedAdminPassword = await bcrypt.hash("qdeeh", 10);
  
  const admin = await prisma.admin.upsert({
    where: { email: "qdeehai@gmail.com" },
    update: {
      password: hashedAdminPassword,
      name: "Qdeeh AI Admin",
      isSuperAdmin: true,
      permissions: ["ALL"],
    },
    create: {
      email: "qdeehai@gmail.com",
      name: "Qdeeh AI Admin",
      password: hashedAdminPassword,
      emailVerified: new Date(),
      isSuperAdmin: true,
      permissions: ["ALL"],
    },
  });

  console.log("✅ Admin user created:", admin.email, "- Stored in ADMINS table");

  // Create STUDENT user (stored in students table)
  const hashedStudentPassword = await bcrypt.hash("student123", 10);
  
  const student = await prisma.student.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      email: "student@example.com",
      name: "John Doe",
      password: hashedStudentPassword,
      emailVerified: new Date(),
      phone: "+1234567890",
      country: "United States",
    },
  });

  console.log("✅ Student user created:", student.email, "- Stored in STUDENTS table");

  // Create another student
  const student2 = await prisma.student.upsert({
    where: { email: "jane@example.com" },
    update: {},
    create: {
      email: "jane@example.com",
      name: "Jane Smith",
      password: await bcrypt.hash("student123", 10),
      emailVerified: new Date(),
      phone: "+1987654321",
      country: "Canada",
    },
  });

  console.log("✅ Student user created:", student2.email, "- Stored in STUDENTS table");

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "web-development" },
      update: {},
      create: {
        name: "Web Development",
        slug: "web-development",
        description: "Learn to build modern web applications",
        icon: "🌐",
      },
    }),
    prisma.category.upsert({
      where: { slug: "mobile-development" },
      update: {},
      create: {
        name: "Mobile Development",
        slug: "mobile-development",
        description: "Create stunning mobile apps",
        icon: "📱",
      },
    }),
    prisma.category.upsert({
      where: { slug: "data-science" },
      update: {},
      create: {
        name: "Data Science",
        slug: "data-science",
        description: "Analyze data and build ML models",
        icon: "📊",
      },
    }),
    prisma.category.upsert({
      where: { slug: "design" },
      update: {},
      create: {
        name: "Design",
        slug: "design",
        description: "Master UI/UX and graphic design",
        icon: "🎨",
      },
    }),
  ]);

  console.log("✅ Categories created:", categories.length);

  // Create sample courses
  const course1 = await prisma.course.upsert({
    where: { slug: "complete-web-development-bootcamp" },
    update: {},
    create: {
      title: "Complete Web Development Bootcamp 2025",
      slug: "complete-web-development-bootcamp",
      description: "Master modern web development with Next.js, React, TypeScript, and more. Build real-world projects and become a full-stack developer.",
      shortDescription: "Become a full-stack web developer with this comprehensive bootcamp covering Next.js, React, TypeScript, and modern tools.",
      thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
      previewVideo: "https://example.com/preview.mp4",
      price: 99.99,
      discountPrice: 49.99,
      level: CourseLevel.BEGINNER,
      status: CourseStatus.PUBLISHED,
      language: "English",
      duration: 2400, // 40 hours
      metaTitle: "Complete Web Development Bootcamp 2025 - Learn Full Stack",
      metaDescription: "Master web development with our comprehensive bootcamp. Learn Next.js, React, TypeScript, and build real-world projects.",
      metaKeywords: ["web development", "next.js", "react", "typescript", "full stack"],
      learningOutcomes: [
        "Build modern web applications with Next.js 15 and React 19",
        "Master TypeScript for type-safe development",
        "Create responsive designs with Tailwind CSS",
        "Implement authentication and authorization",
        "Deploy applications to production",
        "Work with databases and ORMs",
      ],
      requirements: [
        "Basic understanding of HTML, CSS, and JavaScript",
        "A computer with internet connection",
        "Willingness to learn and practice",
      ],
      instructorName: "Sarah Johnson",
      instructorBio: "Senior Full-Stack Developer with 10+ years of experience. Passionate about teaching and helping students achieve their goals.",
      instructorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      categoryId: categories[0].id,
      publishedAt: new Date(),
      studentsCount: 1250,
      rating: 4.8,
      reviewsCount: 324,
    },
  });

  console.log("✅ Course created:", course1.title);

  // Create sections and lessons for course 1
  const section1 = await prisma.section.create({
    data: {
      title: "Getting Started",
      description: "Introduction to the course and setting up your development environment",
      order: 1,
      courseId: course1.id,
    },
  });

  await prisma.lesson.createMany({
    data: [
      {
        title: "Welcome to the Course",
        description: "Introduction and course overview",
        order: 1,
        duration: 300, // 5 minutes
        videoUrl: "https://example.com/lesson1.mp4",
        isFree: true,
        isPublished: true,
        sectionId: section1.id,
      },
      {
        title: "Setting Up Your Development Environment",
        description: "Install and configure all necessary tools",
        order: 2,
        duration: 900, // 15 minutes
        videoUrl: "https://example.com/lesson2.mp4",
        isFree: true,
        isPublished: true,
        sectionId: section1.id,
      },
    ],
  });

  const section2 = await prisma.section.create({
    data: {
      title: "React Fundamentals",
      description: "Learn the core concepts of React",
      order: 2,
      courseId: course1.id,
    },
  });

  await prisma.lesson.createMany({
    data: [
      {
        title: "Components and JSX",
        description: "Understanding React components and JSX syntax",
        order: 1,
        duration: 1200, // 20 minutes
        videoUrl: "https://example.com/lesson3.mp4",
        isPublished: true,
        sectionId: section2.id,
      },
      {
        title: "State and Props",
        description: "Managing component state and passing props",
        order: 2,
        duration: 1500, // 25 minutes
        videoUrl: "https://example.com/lesson4.mp4",
        isPublished: true,
        sectionId: section2.id,
      },
    ],
  });

  console.log("✅ Sections and lessons created");

  // Create another course
  const course2 = await prisma.course.upsert({
    where: { slug: "react-native-mobile-development" },
    update: {},
    create: {
      title: "React Native Mobile Development",
      slug: "react-native-mobile-development",
      description: "Build cross-platform mobile applications with React Native. Learn to create beautiful, performant apps for iOS and Android.",
      shortDescription: "Create stunning mobile apps for iOS and Android using React Native.",
      thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800",
      price: 79.99,
      level: CourseLevel.INTERMEDIATE,
      status: CourseStatus.PUBLISHED,
      language: "English",
      duration: 1800, // 30 hours
      learningOutcomes: [
        "Build mobile apps with React Native",
        "Understand mobile development patterns",
        "Publish apps to App Store and Play Store",
        "Implement navigation and state management",
      ],
      requirements: [
        "Knowledge of React and JavaScript",
        "Basic understanding of mobile development",
      ],
      instructorName: "Mike Chen",
      instructorBio: "Mobile development expert with apps used by millions of users worldwide.",
      instructorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      categoryId: categories[1].id,
      publishedAt: new Date(),
      studentsCount: 890,
      rating: 4.7,
      reviewsCount: 178,
    },
  });

  console.log("✅ Course created:", course2.title);

  // Enroll student in a course
  await prisma.enrollment.upsert({
    where: {
      studentId_courseId: {
        studentId: student.id,
        courseId: course1.id,
      },
    },
    update: {},
    create: {
      studentId: student.id,
      courseId: course1.id,
      progress: 25,
    },
  });

  console.log("✅ Student enrolled in course");

  // Create coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: "LAUNCH50",
        discountType: "PERCENTAGE",
        discountValue: 50,
        maxUses: 100,
        maxUsesPerUser: 1,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true,
      },
      {
        code: "WELCOME20",
        discountType: "PERCENTAGE",
        discountValue: 20,
        maxUsesPerUser: 1,
        validFrom: new Date(),
        isActive: true,
      },
      {
        code: "SAVE10",
        discountType: "FIXED",
        discountValue: 10,
        validFrom: new Date(),
        isActive: true,
      },
    ],
  });

  console.log("✅ Coupons created");

  // Create a review (from student)
  await prisma.review.upsert({
    where: {
      studentId_courseId: {
        studentId: student.id,
        courseId: course1.id,
      },
    },
    update: {},
    create: {
      studentId: student.id,
      courseId: course1.id,
      rating: 5,
      comment: "Amazing course! Very comprehensive and well-explained. Highly recommended!",
      approved: true,
    },
  });

  console.log("✅ Review created");

  // Create settings
  await prisma.settings.upsert({
    where: { key: "site_name" },
    update: {},
    create: {
      key: "site_name",
      value: "QdeehAi",
    },
  });

  await prisma.settings.upsert({
    where: { key: "site_description" },
    update: {},
    create: {
      key: "site_description",
      value: "AI-powered learning platform - Learn from the best instructors and advance your career",
    },
  });

  console.log("✅ Settings created");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n" + "=".repeat(70));
  console.log("📝 TEST CREDENTIALS:");
  console.log("=".repeat(70));
  console.log("\n🔐 ADMIN (Stored in ADMINS table):");
  console.log("   URL: http://localhost:3000/admin-dashboard-secret");
  console.log("   Email: admin@example.com");
  console.log("   Password: admin123");
  console.log("   Type: SUPER ADMIN");
  console.log("\n👨‍🎓 STUDENTS (Stored in STUDENTS table):");
  console.log("   Student 1:");
  console.log("     Email: student@example.com");
  console.log("     Password: student123");
  console.log("   Student 2:");
  console.log("     Email: jane@example.com");
  console.log("     Password: student123");
  console.log("=".repeat(70));
  console.log("\n✨ Database Structure:");
  console.log("   - Admins: Separate 'admins' table");
  console.log("   - Students: Separate 'students' table");
  console.log("   - Admins can convert students to admins");
  console.log("   - Complete separation of user types");
  console.log("=".repeat(70) + "\n");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
