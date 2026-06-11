import { Activity } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Right Side - Medical Graphic / Branding (Since RTL, this will appear on the right visually if it's the first element, wait, flex-row in RTL means first element is on the RIGHT) */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-900 text-white flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-700 via-indigo-900 to-slate-900 opacity-90"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="absolute top-1/4 -right-16 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm mb-8 ring-1 ring-white/20">
            <Activity className="w-16 h-16 text-indigo-300" />
          </div>
          <h1 className="text-4xl font-bold mb-6 tracking-tight">
            مرحباً بك في <span className="text-indigo-300">FemCare</span>
          </h1>
          <p className="text-lg text-indigo-100/80 leading-relaxed">
            المنصة السحابية الأولى في العراق لإدارة عيادات النسائية والتوليد.
            انضم إلينا لتقديم رعاية صحية متطورة وموثوقة.
          </p>
        </div>
      </div>

      {/* Left Side - Auth Form (Second element in RTL flows to the left) */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
          <div className="bg-indigo-900 p-2 rounded-xl">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900">FemCare</span>
        </div>

        <div className="mx-auto w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
