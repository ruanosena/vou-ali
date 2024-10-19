import { INITIAL_SUGGESTIONS_CHAR, MAX_SUGGESTIONS } from "@/lib/constants";
import prisma from "@/lib/prisma";
import { getDistanceFromLatLonInKm } from "@/lib/utils";
import { Pesquisa } from "@/types";
import { Prisma } from "@prisma/client";

type QueryPontoResult = Awaited<ReturnType<typeof queryPonto>>;
type QueryLocalResult = Awaited<ReturnType<typeof queryLocal>>;

export interface SearchResponse {
  error?: string;
  data?: Pesquisa[];
}

export async function GET(req: Request, { params }: { params: { location: string } }) {
  const payload: SearchResponse = {};
  const location = params.location;

  const [latParam, lngParam] = location.split(",");
  if (!latParam || latParam === "NaN" || !lngParam || lngParam === "NaN") {
    payload.error = "Parameters not provided";
    return Response.json(payload, { status: 401 });
  }

  let lat: number | undefined, lng: number | undefined;
  try {
    lat = new Prisma.Decimal(latParam.trim()).toNumber();
    lng = new Prisma.Decimal(lngParam.trim()).toNumber();
  } catch {
    payload.error = "Invalid parameters";
    return Response.json(payload, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const query = decodeURIComponent(searchParams.get("q") ?? "").trim();

  if (!query || !/(?:(?![×Þß÷þø])[-_'0-9a-zÀ-ÿ])+/i.test(query)) {
    // doesn't have a character (letter|number) with accents or not
    payload.error = "No search found";
    return Response.json(payload, { status: 404 });
  }

  if (query === INITIAL_SUGGESTIONS_CHAR) {
    let bounds: google.maps.LatLngBoundsLiteral | undefined;
    try {
      bounds = {
        north: new Prisma.Decimal(decodeURIComponent(searchParams.get("north") ?? "")).toNumber(),
        south: new Prisma.Decimal(decodeURIComponent(searchParams.get("south") ?? "")).toNumber(),
        east: new Prisma.Decimal(decodeURIComponent(searchParams.get("east") ?? "")).toNumber(),
        west: new Prisma.Decimal(decodeURIComponent(searchParams.get("west") ?? "")).toNumber(),
      };
    } catch {
      payload.error = "No search found";
      return Response.json(payload, { status: 404 });
    }
    // Finds within the area
    payload.data = formatPonto(await queryPontoByBoundingBox(bounds));

    if (payload.data.length < MAX_SUGGESTIONS) {
      const whatsLeft = MAX_SUGGESTIONS - payload.data.length;
      const leftPayload = formatLocal(await queryLocalByBoundingBox(bounds, whatsLeft));
      payload.data = payload.data.concat(leftPayload);
    }
    // Sorts by straight-line distance
    payload.data = sortByDistance(payload.data, lat, lng);
  } else {
    // Finds by the query
    payload.data = formatPonto(await queryPontoByTextInput(query));

    if (payload.data.length < MAX_SUGGESTIONS) {
      const whatsLeft = MAX_SUGGESTIONS - payload.data.length;
      const leftPayload = formatLocal(await queryLocalByTextInput(query, whatsLeft));
      payload.data = payload.data.concat(leftPayload);
    }
  }

  return Response.json(payload, { status: 200 });
}

async function queryPonto(where: Prisma.PontoWhereInput, take: number) {
  try {
    const results = await prisma.ponto.findMany({
      take,
      select: { id: true, nome: true, lat: true, lng: true },
      where: { publicado: true, ...where },
    });
    return results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function queryLocal(where: Prisma.LocalWhereInput, take: number) {
  try {
    const results = await prisma.local.findMany({
      take,
      select: { id: true, enderecoFormatado: true, lat: true, lng: true },
      where,
      // TODO: add not empty string
    });
    return results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function queryPontoByBoundingBox(bBox: google.maps.LatLngBoundsLiteral, quantity = MAX_SUGGESTIONS) {
  try {
    const results = await queryPonto(
      {
        AND: [
          { lat: { lte: bBox.north }, lng: { lte: bBox.east } },
          { lat: { gte: bBox.south }, lng: { gte: bBox.west } },
        ],
      },
      quantity,
    );
    return results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function queryLocalByBoundingBox(bBox: google.maps.LatLngBoundsLiteral, quantity: number) {
  try {
    const results = await queryLocal(
      {
        AND: [
          { lat: { lte: bBox.north }, lng: { lte: bBox.east } },
          { lat: { gte: bBox.south }, lng: { gte: bBox.west } },
        ],
      },
      quantity,
    );
    return results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function queryPontoByTextInput(text: string, quantity = MAX_SUGGESTIONS) {
  try {
    const results = await queryPonto(
      {
        OR: [
          {
            nome: {
              contains: text,
              mode: "insensitive",
            },
          },
          {
            slug: {
              contains: text,
              mode: "insensitive",
            },
          },
          {
            apelidos: {
              some: {
                apelido: {
                  contains: text,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      },
      quantity,
    );
    return results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function queryLocalByTextInput(text: string, quantity: number) {
  try {
    const results = await queryLocal(
      {
        enderecoFormatado: {
          contains: text,
          mode: "insensitive",
        },
      },
      quantity,
    );
    return results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

function formatPonto(data: QueryPontoResult) {
  return data.map<Pesquisa>((ponto) => ({
    id: ponto.id,
    tipo: "Ponto",
    nome: ponto.nome,
    lat: ponto.lat.toNumber(),
    lng: ponto.lat.toNumber(),
  }));
}

function formatLocal(data: QueryLocalResult) {
  return data.map<Pesquisa>((local) => ({
    id: local.id,
    tipo: "Local",
    nome: local.enderecoFormatado,
    lat: local.lat.toNumber(),
    lng: local.lat.toNumber(),
  }));
}

function sortByDistance<T extends { lat: number; lng: number }[]>(data: T, lat: number, lng: number) {
  return data.sort(
    (a, b) => getDistanceFromLatLonInKm(b.lat, b.lng, lat, lng) - getDistanceFromLatLonInKm(a.lat, a.lng, lat, lng),
  );
}
