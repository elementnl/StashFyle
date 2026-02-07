"use client";

import { FileImage, FileText, FileVideo, FileArchive } from "lucide-react";
import { motion } from "motion/react";
import { Terminal, TypingAnimation, AnimatedSpan } from "@/components/ui/terminal";
import { AnimatedList } from "@/components/ui/animated-list";

const files = [
  { name: "photo.jpg", size: "2.4 MB", icon: FileImage, color: "text-primary" },
  { name: "document.pdf", size: "1.2 MB", icon: FileText, color: "text-slate-600" },
  { name: "video.mp4", size: "24.8 MB", icon: FileVideo, color: "text-primary" },
  { name: "archive.zip", size: "8.1 MB", icon: FileArchive, color: "text-slate-500" },
  { name: "banner.png", size: "456 KB", icon: FileImage, color: "text-primary" },
];

function FileItem({ name, size, icon: Icon, color }: { name: string; size: string; icon: typeof FileImage; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 w-full">
      <div className={`rounded-md bg-muted p-2 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground">{size}</p>
      </div>
      <div className="h-2 w-2 rounded-full bg-green-500" />
    </div>
  );
}

export function Showcase() {
  return (
    <section className="pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="grid gap-6 lg:grid-cols-2 items-start"
        >
          <Terminal className="w-full max-w-none">
            <TypingAnimation delay={200} duration={10}>
              {`$ curl -X POST \\`}
            </TypingAnimation>
            <TypingAnimation delay={50} duration={10}>
              {`    -H "Authorization: Bearer sk_live_..." \\`}
            </TypingAnimation>
            <TypingAnimation delay={50} duration={10}>
              {`    -F "file=@photo.jpg" \\`}
            </TypingAnimation>
            <TypingAnimation delay={50} duration={10}>
              {`    https://api.stashfyle.com/v1/upload`}
            </TypingAnimation>
            <AnimatedSpan delay={300} className="text-green-500">
              {`✓ https://cdn.stashfyle.com/f_x7k2m/photo.jpg`}
            </AnimatedSpan>
            <AnimatedSpan delay={400} className="text-muted-foreground">
              {` `}
            </AnimatedSpan>
            <TypingAnimation delay={100} duration={8}>
              {`$ curl ... -F "file=@document.pdf" ...`}
            </TypingAnimation>
            <AnimatedSpan delay={200} className="text-green-500">
              {`✓ https://cdn.stashfyle.com/f_p3n8q/document.pdf`}
            </AnimatedSpan>
            <TypingAnimation delay={100} duration={8}>
              {`$ curl ... -F "file=@video.mp4" ...`}
            </TypingAnimation>
            <AnimatedSpan delay={200} className="text-green-500">
              {`✓ https://cdn.stashfyle.com/f_w9r4t/video.mp4`}
            </AnimatedSpan>
            <TypingAnimation delay={100} duration={8}>
              {`$ curl ... -F "file=@archive.zip" ...`}
            </TypingAnimation>
            <AnimatedSpan delay={200} className="text-green-500">
              {`✓ https://cdn.stashfyle.com/f_k5j2m/archive.zip`}
            </AnimatedSpan>
            <TypingAnimation delay={100} duration={8}>
              {`$ curl ... -F "file=@banner.png" ...`}
            </TypingAnimation>
            <AnimatedSpan delay={200} className="text-green-500">
              {`✓ https://cdn.stashfyle.com/f_m8v3n/banner.png`}
            </AnimatedSpan>
          </Terminal>

          <div className="rounded-xl border border-border bg-muted/30 p-4 pb-6 h-[400px] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Your Files</h3>
              <span className="text-xs text-muted-foreground">5 files</span>
            </div>
            <AnimatedList initialDelay={1800} delay={550} className="gap-2">
              {files.map((file, idx) => (
                <FileItem key={idx} {...file} />
              ))}
            </AnimatedList>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
