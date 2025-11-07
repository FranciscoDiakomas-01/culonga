"use client";

import DashBoardHeader from "@/components/ui/headerDashboard";
import { useState } from "react";

export default function Afiliations() {
  const [loading, setLoading] = useState(true);
  return (
    <main>
      <DashBoardHeader
        data={{
          canShowInput: true,
          isAdmin: false,
          pageTitle: "",
          inputPlaceHolder: "Buscar por produto",
        }}
      />


      
    </main>
  );
}
