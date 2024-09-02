import { Pixel } from "@/types";
import { mockPixel } from "./mock";

export const fetchRandomPixelData = async (): Promise<Pixel[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockPixel);
    }, 1000);
  });
};
