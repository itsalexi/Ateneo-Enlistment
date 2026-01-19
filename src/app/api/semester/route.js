import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET() {
  try {
    const semesterInfoPath = path.join(
      process.cwd(),
      "src",
      "data",
      "semester-info.json"
    );

    if (!fs.existsSync(semesterInfoPath)) {
      return NextResponse.json(
        {
          success: false,
          error: "Semester information not found",
        },
        { status: 404, headers: corsHeaders }
      );
    }

    const semesterInfo = JSON.parse(fs.readFileSync(semesterInfoPath, "utf8"));

    return NextResponse.json(
      {
        success: true,
        data: semesterInfo,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error reading semester info:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to read semester information",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
