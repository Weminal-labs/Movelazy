import { Outlet } from "react-router-dom";

export const RootLayout = () => {
  return (
    <div className="min-h-screen bg-black">
      <main>
        <Outlet />
      </main>
    </div>
  );
};
