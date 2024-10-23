import { INITIAL_SUGGESTIONS_CHAR, MAX_SUGGESTIONS } from "@/lib/constants";
import prisma from "@/lib/prisma";
import { getDistanceFromLatLonInKm } from "@/lib/utils";
import { Pesquisa } from "@/types";
import { Prisma } from "@prisma/client";

type QueryLocalResult = Awaited<ReturnType<typeof queryLocal>>;
type QueryEnderecoResult = Awaited<ReturnType<typeof queryEndereco>>;

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
    payload.data = formatLocal(await queryLocalByBoundingBox(bounds));

    if (payload.data.length < MAX_SUGGESTIONS) {
      const whatsLeft = MAX_SUGGESTIONS - payload.data.length;
      const leftPayload = formatEndereco(await queryEnderecoByBoundingBox(bounds, whatsLeft));
      payload.data = payload.data.concat(leftPayload);
    }
    // Sorts by straight-line distance
    payload.data = sortByDistance(payload.data, lat, lng);
  } else {
    // Finds by the query
    payload.data = formatLocal(await queryLocalByTextInput(query));

    if (payload.data.length < MAX_SUGGESTIONS) {
      const whatsLeft = MAX_SUGGESTIONS - payload.data.length;
      const leftPayload = formatEndereco(await queryEnderecoByTextInput(query, whatsLeft));
      payload.data = payload.data.concat(leftPayload);
    }
  }

  return Response.json(payload, { status: 200 });
}

async function queryLocal(where: Prisma.LocalWhereInput, take: number) {
  try {
    const results = await prisma.local.findMany({
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

async function queryEndereco(where: Prisma.EnderecoWhereInput, take: number) {
  try {
    const results = await prisma.endereco.findMany({
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

async function queryLocalByBoundingBox(bBox: google.maps.LatLngBoundsLiteral, quantity = MAX_SUGGESTIONS) {
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

async function queryEnderecoByBoundingBox(bBox: google.maps.LatLngBoundsLiteral, quantity: number) {
  try {
    const results = await queryEndereco(
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

async function queryLocalByTextInput(text: string, quantity = MAX_SUGGESTIONS) {
  try {
    const results = await queryLocal(
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

async function queryEnderecoByTextInput(text: string, quantity: number) {
  try {
    const results = await queryEndereco(
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

function formatLocal(data: QueryLocalResult) {
  return data.map<Pesquisa>((local) => ({
    id: local.id,
    tipo: "Local",
    nome: local.nome,
    lat: local.lat.toNumber(),
    lng: local.lat.toNumber(),
  }));
}

function formatEndereco(data: QueryEnderecoResult) {
  return data.map<Pesquisa>((local) => ({
    id: local.id,
    tipo: "Endereco",
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
