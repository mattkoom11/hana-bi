import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { VideoBackground } from "@/components/layout/VideoBackground";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { CustomScrollbar } from "@/components/common/CustomScrollbar";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LoadingScreen />
      <CustomScrollbar />
      <VideoBackground />
      <div className="fixed inset-0 z-0 bg-[#0e0c0b]/60 pointer-events-none" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </>
  );
}
