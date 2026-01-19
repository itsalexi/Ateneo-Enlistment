import data from "@/data/courses.json";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const deptCode = searchParams.get("deptCode");
  const catNo = searchParams.get("catNo");

  let filteredData = data;

  if (deptCode) {
    filteredData = filteredData.filter((course) => course.deptCode === deptCode);
  }

  if (catNo) {
    filteredData = filteredData.filter((course) => course.catNo === catNo);
  }

  return new Response(JSON.stringify(filteredData), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
