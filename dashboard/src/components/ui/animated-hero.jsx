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
    <div className="w-full">
      <div className="max-w-[1080px] mx-auto px-6">
        <div className="flex gap-6 py-16 lg:py-20 items-center justify-center flex-col">
          <div className="flex gap-4 flex-col">
            <h1 className="text-4xl md:text-6xl max-w-2xl tracking-[-0.03em] text-center font-semibold leading-tight text-primary">
              <span>DIALED BY H</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text"
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
              </span>
            </h1>

            {subtitle && (
              <p className="text-base md:text-lg leading-relaxed tracking-tight text-secondary max-w-xl text-center mx-auto">
                {subtitle}
              </p>
            )}
          </div>
          {children && <div className="flex flex-row gap-3">{children}</div>}
        </div>
      </div>
    </div>
  );
}
