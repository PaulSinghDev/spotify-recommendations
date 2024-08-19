import { useEffect, useState } from "react";

export const useScreenSize = () => {
  const [width, setWidth] = useState<number>();
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      // Set the width
      if (width !== window.innerWidth) {
        setWidth(window.innerWidth);
      }

      // Set the width
      if (height !== window.innerHeight) {
        setHeight(window.innerHeight);
      }
    };

    // Initial render
    if (typeof width === "undefined" && typeof height === "undefined") {
      handleResize();
    }

    // Add listener
    window.addEventListener("resize", handleResize, { passive: true });

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, [width, height]);

  return {
    width,
    height,
  };
};
