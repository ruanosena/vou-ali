import { INITIAL_SUGGESTIONS_CHAR, MAX_SUGGESTIONS, PONTOS_RESULTS_TIMES } from "@/lib/constants";
import prisma from "@/lib/prisma";
import { getDistanceFromLatLonInKm } from "@/lib/utils";
import { Ponto } from "@/types";
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

  if (query === null || !/(?:(?![×Þß÷þø])[-_'0-9a-zÀ-ÿ])+/i.test(query)) {
    // doesn't have a character (letter|number) with accents or not
    return Response.json({ error: "No search found" }, { status: 404 });
  }

  let pontos: Awaited<ReturnType<typeof queryByBoundingBox>> | Awaited<ReturnType<typeof queryByTextInput>> | undefined;
  if (query === INITIAL_SUGGESTIONS_CHAR) {
    let bounds: google.maps.LatLngBoundsLiteral | undefined;
    try {
      bounds = {
        north: new Prisma.Decimal(searchParams.get("north")?.trim() ?? "").toNumber(),
        south: new Prisma.Decimal(searchParams.get("south")?.trim() ?? "").toNumber(),
        east: new Prisma.Decimal(searchParams.get("east")?.trim() ?? "").toNumber(),
        west: new Prisma.Decimal(searchParams.get("west")?.trim() ?? "").toNumber(),
      };
    } catch {
      return Response.json({ error: "No search found" }, { status: 404 });
    }
    // Finds 21 occurrences within the area
    pontos = await queryByBoundingBox(bounds);
  } else {
    // Finds 21 occurrences of the query
    pontos = await queryByTextInput(query);
  }

  // Sorts by straight-line distance and takes the first 7
  const data = sortByDistance(normalizeData(pontos), lat, lng).slice(0, 7);
  console.dir(data, { depth: null });

  return Response.json({ data }, { status: 200 });
}

async function queryByBoundingBox(bBox: google.maps.LatLngBoundsLiteral, resultTimes = PONTOS_RESULTS_TIMES) {
  return prisma.ponto.findMany({
    take: MAX_SUGGESTIONS * resultTimes,
    include: {
      social: true,
      apelidos: true,
      local: true,
    },
    where: {
      publicado: true,
      AND: [
        { lat: { lte: bBox.north }, lng: { lte: bBox.east } },
        { lat: { gte: bBox.south }, lng: { gte: bBox.west } },
      ],
    },
  });
}

async function queryByTextInput(input: string, resultTimes = PONTOS_RESULTS_TIMES) {
  return prisma.ponto.findMany({
    take: MAX_SUGGESTIONS * resultTimes,
    include: {
      social: true,
      apelidos: true,
      local: true,
    },
    where: {
      publicado: true,
      OR: [
        {
          nome: {
            contains: input,
            mode: "insensitive",
          },
        },
        {
          slug: {
            contains: input,
            mode: "insensitive",
          },
        },
        {
          apelidos: {
            some: {
              apelido: {
                contains: input,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    },
  });
}

function normalizeData(data: Awaited<ReturnType<typeof queryByTextInput>>) {
  return data.map((p) => ({
    ...p,
    lat: p.lat.toNumber(),
    lng: p.lat.toNumber(),
    local: {
      ...p.local,
      lat: p.local.lat.toNumber(),
      lng: p.local.lng.toNumber(),
      norte: p.local.norte?.toNumber(),
      oeste: p.local.oeste?.toNumber(),
      leste: p.local.leste?.toNumber(),
      sul: p.local.sul?.toNumber(),
    },
  })) as Ponto[];
}

function sortByDistance(data: Ponto[], lat: number, lng: number) {
  return data.sort(
    (a, b) => getDistanceFromLatLonInKm(b.lat, b.lng, lat, lng) - getDistanceFromLatLonInKm(a.lat, a.lng, lat, lng),
  );
}
