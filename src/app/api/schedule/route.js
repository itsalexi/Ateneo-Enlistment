import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

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

export async function POST(request) {
  try {
    const body = await request.json();
    const { courses } = body;

    if (!courses) {
      return NextResponse.json(
        { error: "Missing courses in request body" },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const token =
      Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

    await kv.setex(`calculator:${token}`, 300, JSON.stringify({ courses }));

    return NextResponse.json(
      {
        success: true,
        redirect: true,
        redirectUrl: `${
          process.env.NEXT_PUBLIC_BASE_URL || "https://schedule.alexi.life"
        }/?prefill=${token}`,
        token,
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Invalid JSON or server error" },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const data = await kv.get(`calculator:${token}`);
    if (!data) {
      return NextResponse.json(
        { error: "Data not found or expired" },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    await kv.del(`calculator:${token}`);

    let parsedData;
    if (typeof data === "string") {
      parsedData = JSON.parse(data);
    } else if (typeof data === "object" && data !== null) {
      parsedData = data;
    } else {
      return NextResponse.json(
        { error: "Invalid data format" },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    const { courses } = parsedData;

    return NextResponse.json(
      {
        success: true,
        data: { courses },
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Error in GET /api/schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
