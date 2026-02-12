"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, X } from "lucide-react";
import { useState } from "react";
import type { Category } from "@prisma/client";

interface CourseFiltersProps {
  categories: Category[];
}

export function CourseFilters({ categories }: CourseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/courses?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    router.push("/courses");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("search", search || null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <form onSubmit={handleSearch} className="space-y-2">
          <Label>Search</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit" size="icon" variant="secondary">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={searchParams.get("category") || "all"}
            onValueChange={(value) => updateFilter("category", value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Level */}
        <div className="space-y-2">
          <Label>Level</Label>
          <Select
            value={searchParams.get("level") || "all"}
            onValueChange={(value) => updateFilter("level", value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="ADVANCED">Advanced</SelectItem>
              <SelectItem value="ALL_LEVELS">All Levels</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <Label>Sort By</Label>
          <Select
            value={searchParams.get("sort") || "newest"}
            onValueChange={(value) => updateFilter("sort", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {(searchParams.toString() !== "" && searchParams.toString() !== "sort=newest") && (
          <Button variant="outline" className="w-full" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
