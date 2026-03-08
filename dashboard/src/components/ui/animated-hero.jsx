import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

export function AnimatedHero({ subtitle, children }) {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["sourcing", "intelligence", "strategy", "content", "growth"],
    [],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber(titleNumber === titles.length - 1 ? 0 : titleNumber + 1);
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full overflow-hidden">
      <div className="max-w-[1080px] mx-auto px-6">
        <div className="flex gap-5 py-14 lg:py-18 items-center justify-center flex-col">
          <img src="/logo-dark.png" alt="Dialed by H" className="h-10 md:h-14" />

          <div className="relative flex w-full justify-center overflow-hidden h-12 md:h-16">
            {titles.map((title, index) => (
              <motion.span
                key={index}
                className="absolute text-3xl md:text-5xl font-bold uppercase tracking-[0.06em] text-secondary/60"
                initial={{ opacity: 0, y: "-100" }}
                transition={{ type: "spring", stiffness: 50 }}
                animate={
                  titleNumber === index
                    ? { y: 0, opacity: 1 }
                    : { y: titleNumber > index ? -150 : 150, opacity: 0 }
                }
              >
                {title}
              </motion.span>
            ))}
          </div>

          {subtitle && (
            <p className="text-[14px] leading-relaxed text-secondary max-w-md text-center">
              {subtitle}
            </p>
          )}

          {children && <div className="flex flex-row gap-3 mt-2">{children}</div>}
        </div>
      </div>
    </div>
  );
}
