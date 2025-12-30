import { motion } from "framer-motion";
import { Play } from "lucide-react";

interface Video {
  id: string;
  title: string;
  embedUrl: string;
}

const videos: Video[] = [
  {
    id: "1",
    title: "JD's LaraWorld - Platform Walkthrough Part 1",
    embedUrl: "https://www.loom.com/embed/6446c7563dbc4f4f8b2cba43fc05d4cf",
  },
  {
    id: "2",
    title: "JD's LaraWorld - Platform Walkthrough Part 2",
    embedUrl: "https://www.loom.com/embed/a5a15da3f26b4879b214dff5747c4db2",
  },
  // Add a third video here when available
  // {
  //   id: "3",
  //   title: "JD's LaraWorld - Platform Walkthrough Part 3",
  //   embedUrl: "https://www.loom.com/embed/YOUR_THIRD_VIDEO_ID",
  // },
];

export const VideoShowcase = () => {
  const visibleVideos = videos.filter(v => v.embedUrl); // Filter out empty videos

  return (
    <section className="section-shell py-24 px-4 bg-gradient-subtle">
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-60px" }}
          className="mb-12 text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/70 bg-white/80 shadow-glow backdrop-blur-md dark:border-white/10 dark:bg-white/5">
            <Play className="h-10 w-10 text-primary" />
          </div>
          <h2 className="flex items-center justify-center gap-3 text-4xl font-bold text-foreground md:text-5xl">
            <span>🎥</span>
            <span>Platform Walkthrough</span>
            <span>✨</span>
          </h2>
          <p className="mt-3 text-xl text-muted-foreground">
            Watch these videos to see the platform in action! 
            <span className="ml-1">🚀</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {visibleVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: index * 0.1 }}
              className="rounded-lg overflow-hidden border border-border bg-card shadow-lg hover:shadow-xl transition-shadow"
            >
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                <iframe
                  src={video.embedUrl}
                  frameBorder="0"
                  allowFullScreen
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-foreground">{video.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

