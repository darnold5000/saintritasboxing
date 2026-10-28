import Image from "next/image";
import { SITE } from "@/lib/site";

export function FooterCredit() {
  return (
    <p className="flex flex-wrap items-center gap-1.5 text-xs text-white/55">
      <span>Powered by the</span>
      <a
        href={SITE.signalWorks.url}
        target="_blank"
        rel="noreferrer"
        title={SITE.signalWorks.title}
        className="inline-flex items-center gap-1.5 text-white/80 underline-offset-2 hover:text-gold hover:underline"
      >
        <Image
          src={SITE.signalWorks.icon}
          alt=""
          width={16}
          height={16}
          className="size-4 rounded-sm"
        />
        {SITE.signalWorks.name}
      </a>
    </p>
  );
}
