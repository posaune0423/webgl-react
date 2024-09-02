import { Pixel } from "@/types";

export const fetchRandomPixelData = async (): Promise<Pixel[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const pixelData = [];
      for (let i = 0; i < 1000; i++) {
        pixelData.push({
          x: Math.floor(Math.random() * 100),
          y: Math.floor(Math.random() * 100),
          color: {
            r: Math.random(),
            g: Math.random(),
            b: Math.random(),
            a: 1,
          },
        });
      }
      resolve(pixelData);
    }, 1000);
  });
};
