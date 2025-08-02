"use client";
import { createTheme, ThemeProvider } from "@mui/material";
import { Suspense, useEffect, useState } from "react";
import ProgramOfferingsContent from "@/components/ProgramOfferingsContent";
import { toast } from "@/hooks/use-toast";

const initialTableVisibility = {
  catNo: true,
  section: true,
  courseTitle: true,
  units: false,
  time: true,
  room: false,
  instructor: true,
  remarks: true,
};

const initialCardVisibility = {
  catNo: true,
  section: true,
  courseTitle: true,
  units: true,
  time: true,
  room: true,
  instructor: true,
  remarks: true,
};

const ITEMS_PER_PAGE = 30;
const currentSemesterString = "First Semester 2025-2026";
const lastUpdated = 1754095878258;

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#90caf9" },
    secondary: { main: "#f48fb1" },
    background: { default: "#121212", paper: "#1e1e1e" },
  },
});

export default function ProgramOfferingsPage() {
  const [prefillData, setPrefillData] = useState(null);
  const [isLoadingPrefill, setIsLoadingPrefill] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const prefillToken = urlParams.get("prefill");

    if (prefillToken) {
      setIsLoadingPrefill(true);

      // Show loading notification
      toast({
        title: "Loading Schedule Data",
        description: "Please wait while we load your schedule...",
      });

      // Fetch the prefill data from the API
      fetch(`/api/schedule?token=${prefillToken}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setPrefillData(data.data);
            toast({
              title: "Schedule Loaded Successfully",
              description: `Loaded ${data.data.courses.length} courses into your schedule.`,
            });
          } else {
            toast({
              title: "Failed to Load Schedule",
              description:
                data.error || "An error occurred while loading your schedule.",
              variant: "destructive",
            });
          }
        })
        .catch((error) => {
          toast({
            title: "Error Loading Schedule",
            description: "Failed to connect to the server. Please try again.",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsLoadingPrefill(false);
        });
    }
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <Suspense fallback={<div>Loading...</div>}>
        {isLoadingPrefill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-white text-lg font-semibold mb-2">
                Loading Schedule Data
              </h3>
              <p className="text-gray-300">
                Please wait while we load your schedule...
              </p>
            </div>
          </div>
        )}
        <ProgramOfferingsContent
          darkTheme={darkTheme}
          initialTableVisibility={initialTableVisibility}
          initialCardVisibility={initialCardVisibility}
          ITEMS_PER_PAGE={ITEMS_PER_PAGE}
          currentSemesterString={currentSemesterString}
          lastUpdated={lastUpdated}
          prefillData={prefillData}
          isLoadingPrefill={isLoadingPrefill}
          setPrefillData={setPrefillData}
        />
      </Suspense>
    </ThemeProvider>
  );
}
