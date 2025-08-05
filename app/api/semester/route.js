import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Read the semester info from the JSON file
    const semesterInfoPath = path.join(
      process.cwd(),
      "data",
      "semester-info.json"
    );

    if (!fs.existsSync(semesterInfoPath)) {
      return NextResponse.json(
        {
          success: false,
          error: "Semester information not found",
        },
        { status: 404 }
      );
    }

    const semesterInfo = JSON.parse(fs.readFileSync(semesterInfoPath, "utf8"));

    return NextResponse.json({
      success: true,
      data: semesterInfo,
    });
  } catch (error) {
    console.error("Error reading semester info:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to read semester information",
      },
      { status: 500 }
    );
  }
}
