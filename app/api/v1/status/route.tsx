import database from "infra/database";

export async function GET() {
  const result = await database.query("SELECT 1 + 1 as SUM;");
  console.log(result.rows);

  return Response.json({
    status: "ok",
    version: "1.0.0",
  });
}
