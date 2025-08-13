import TypingPrefix from "@/components/typing-prefix";
import CVReveal from "@/components/cv-reveal";
import PhysicsBurst from "@/components/physics-burst";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-10 items-center justify-center">
          <PhysicsBurst>
            <div className="flex flex-col gap-2 items-center justify-center">
              <h1 className="text-6xl sm:text-8xl font-bold" data-physics-target>Jan Rezek</h1>
              <p className="text-xl sm:text-4xl text-center font-light text-gray-300" data-physics-target>
                <span className="text-red-500">&lt;</span>{" "}
                <TypingPrefix delayMs={2000} text="Junior"/>{" "} Full-Stack Developer {" "}
                <span className="text-red-500">&gt;</span>
              </p>
            </div>
          </PhysicsBurst>
          <CVReveal />
        </div>
      </main>
    </div>
  );
}
