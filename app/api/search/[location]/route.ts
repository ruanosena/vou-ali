import prisma from "@/lib/prisma";
import { getDistanceFromLatLonInKm } from "@/lib/utils";
import { Prisma } from "@prisma/client";

export async function GET(req: Request, { params }: { params: { location: string } }) {
  const location = params.location;

  const [latParam, lngParam] = location.split(",");
  if (!latParam || latParam === "NaN" || !lngParam || lngParam === "NaN") {
    return Response.json({ error: "Parameters not provided" }, { status: 401 });
  }

  let lat: number | undefined, lng: number | undefined;
  try {
    lat = new Prisma.Decimal(latParam.trim()).toNumber();
    lng = new Prisma.Decimal(lngParam.trim()).toNumber();
  } catch {
    return Response.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return Response.json({ error: "No search found" }, { status: 404 });
  }

  // Finds 30 occurrences of the query
  const pontos = await prisma.ponto.findMany({
    take: 30,
    where: {
      publicado: true,
      OR: [
        {
          nome: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          slug: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          apelidos: {
            some: {
              apelido: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    },
  });

  // Sorts by straight-line distance and takes the first 10
  const data = pontos
    .map((p) => ({ ...p, lat: p.lat.toNumber(), lng: p.lat.toNumber() }))
    .sort(
      (a, b) => getDistanceFromLatLonInKm(a.lat, a.lng, lat, lng) - getDistanceFromLatLonInKm(b.lat, b.lng, lat, lng),
    )
    .slice(0, 10);

  return Response.json({ query, data }, { status: 200 });
}
