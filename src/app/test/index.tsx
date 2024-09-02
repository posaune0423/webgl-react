import { DoubleShader } from "@/components/DoubleShader";
import { Link } from "react-router-dom";

const Pixel = () => {
  return (
    <main className="relative">
      <header className="flex flex-row items-center justify-center h-[50px] gap-2 p-3">
        <h1 className="text-2xl text-white font-bold">Test</h1>
        <div className="flex flex-row items-center justify-center gap-2">
          <Link to="/pixel" className="text-white hover:text-gray-400">
            Pixel
          </Link>
        </div>
      </header>
      <DoubleShader />
    </main>
  );
};

export default Pixel;
