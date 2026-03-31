"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Play } from "lucide-react";
import { getFallbackImage } from "@/lib/imageFallback";
import { formatDateForSSR } from "@/lib/dateUtils";
import type { CmsVideo } from "@/lib/repository/videos";

interface Props {
  lang: string;
  videos?: CmsVideo[];
}

export function VideosPageContent({ lang: _lang, videos: cmsVideos }: Props) {
  const t = useTranslations();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const videosPerPage = 6;

  const heroData = {
    title: "Videos",
    subtitle: "Watch tutorials, demos, and insights to help you succeed",
  };

  const allVideos = useMemo(() => {
    return (cmsVideos ?? []).map((video, index) => ({
      id: video.slug || `video-${index}`,
      videoId: (video as any)?.youtubeId || "dQw4w9WgXcQ",
      title: video.title || "Video",
      thumbnail: getFallbackImage("default"),
      category: (video as any)?.category || "all",
      publishedAt: formatDateForSSR((video as any)?.publishedDate || "2024-01-01T00:00:00Z"),
    }));
  }, [cmsVideos]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(allVideos.map((v) => v.category).filter(Boolean)));
    return ["all", ...unique.filter((c) => c !== "all")];
  }, [allVideos]);

  const filteredVideos =
    selectedCategory === "all"
      ? allVideos
      : allVideos.filter((video) => video.category === selectedCategory);
  const totalPages = Math.max(1, Math.ceil(filteredVideos.length / videosPerPage));
  const startIndex = (currentPage - 1) * videosPerPage;
  const paginatedVideos = filteredVideos.slice(startIndex, startIndex + videosPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/15 via-primary/10 to-transparent border border-border">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0)_60%)]" />
        <div className="relative grid gap-6 md:grid-cols-[1.2fr_0.8fr] items-center px-6 py-10 sm:px-10 sm:py-12">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary/80">
              {t("pages.resources.videos.breadcrumb")}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{heroData.title}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">{heroData.subtitle}</p>
          </div>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-background/60 backdrop-blur">
            <Image
              src={getFallbackImage("hero")}
              alt="Videos hero image"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                <Play className="h-4 w-4" /> {t("pages.resources.videos.heroCta")}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background hover:border-primary/50"
                }`}
              >
                {category === "all" ? t("common.all", { defaultValue: "All" }) : category}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button
              onClick={() => handlePageChange(1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-border hover:border-primary"
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-border hover:border-primary"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2">
              {t("pagination.pageOf", { current: currentPage, total: totalPages })}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-border hover:border-primary"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-border hover:border-primary"
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paginatedVideos.map((video) => (
          <article
            key={video.id}
            className="group relative overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent" />
              <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-foreground shadow">
                <Play className="h-3 w-3" />
                {video.category}
              </div>
            </div>
            <div className="space-y-2 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">
                {formatDateForSSR(video.publishedAt)}
              </p>
              <h3 className="text-lg font-semibold">{video.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {t("pages.resources.videos.description")}
              </p>
            </div>
          </article>
        ))}
        {paginatedVideos.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground">
            {t("pages.resources.videos.empty", { defaultValue: "No videos available." })}
          </div>
        )}
      </section>
    </div>
  );
}
