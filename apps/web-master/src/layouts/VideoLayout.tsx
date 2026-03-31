import Link from "next/link";
import { youtubeThumbnail } from "../lib/video";
import { CmsArticle as CmsResource } from "@/lib/repository/articles";
import { CmsVideo } from "@/lib/repository/videos";
import { videoSchema } from "../lib/schemas";
import { routes } from "@/lib/routes";

type Props = { lang: string; page: { data: { video?: CmsVideo; relatedVideos: CmsVideo[]; relatedArticles: CmsResource[] } } };

export function VideoLayout({ lang, page }: Props) {
  const { video, relatedVideos, relatedArticles } = page.data;
  if (!video) return <div className="container py-12">Video not found.</div>;
  const thumb = youtubeThumbnail(video.youtubeId || "");
  const schema = videoSchema({
    title: video.title || "Video",
    description: video.description || "",
    url: `https://www.youtube.com/embed/${video.youtubeId ?? ""}`,
    thumbnailUrl: thumb
  });
  return (
    <article className="container space-y-8 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Video</p>
        <h1 className="text-4xl font-bold">{video.title}</h1>
        <p className="text-lg text-muted-foreground">{video.description}</p>
      </header>
      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${video.youtubeId}`}
          title={video.title}
          allowFullScreen
        />
      </div>
      
      {/* Related Videos Section - Only show if there are related videos */}
      {relatedVideos.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Related videos</h2>
          <div className={`grid gap-4 ${
            relatedVideos.length === 1 ? 'md:grid-cols-1 max-w-md' :
            relatedVideos.length === 2 ? 'md:grid-cols-2' :
            'md:grid-cols-3'
          }`}>
            {relatedVideos.map((v) => (
              <Link key={v.slug} href={routes.video(lang, v.slug)} className="p-4 border rounded-lg hover:shadow-sm transition">
                <div className="aspect-video bg-muted rounded mb-2" />
                <h3 className="font-semibold">{v.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{v.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
      
      {/* Related Articles Section - Only show if there are related articles */}
      {relatedArticles.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Related articles</h2>
          <div className={`grid gap-4 ${
            relatedArticles.length === 1 ? 'md:grid-cols-1 max-w-md' :
            relatedArticles.length === 2 ? 'md:grid-cols-2' :
            'md:grid-cols-3'
          }`}>
            {relatedArticles.map((a) => (
              <Link key={a.slug} href={routes.article(lang, a.slug)} className="p-4 border rounded-lg hover:shadow-sm transition">
                <h3 className="font-semibold">{a.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
