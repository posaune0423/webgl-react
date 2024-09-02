import { PixelGrid } from "@/components/PixelGrid";
import { Link } from "react-router-dom";

const Pixel = () => {
  return (
    <main className="relative h-screen">
      <header className="flex flex-row items-center justify-center h-[50px] gap-2 p-3">
        <h1 className="text-2xl text-white font-bold">Pixel</h1>
        <div className="flex flex-row items-center justify-center gap-2">
          <Link to="/test" className="text-white hover:text-gray-400">
            Test
          </Link>
        </div>
      </header>
      <PixelGrid />
    </main>
  );
};

export default Pixel;
