import { MAX_PONTOS, MAX_SUGGESTIONS } from "@/lib/constants";
import prisma from "@/lib/prisma";
import { Ponto } from "@/types";
import { Prisma } from "@prisma/client";

type QueryEnderecoResult = Awaited<ReturnType<typeof queryEndereco>>;

export interface PlacesResponse {
  error?: string;
  data?: Ponto[];
}

export async function GET(req: Request, { params }: { params: { location: string } }) {
  const payload: PlacesResponse = {};
  const location = params.location;

  const [latParam, lngParam] = location.split(",");
  if (!latParam || latParam === "NaN" || !lngParam || lngParam === "NaN") {
    payload.error = "Parameters not provided";
    return Response.json(payload, { status: 401 });
  }

  let originLat: number | undefined, originLng: number | undefined;
  try {
    originLat = new Prisma.Decimal(latParam.trim()).toNumber();
    originLng = new Prisma.Decimal(lngParam.trim()).toNumber();
  } catch {
    payload.error = "Invalid parameters";
    return Response.json(payload, { status: 400 });
  }

  const { searchParams } = new URL(req.url);

  let bounds: google.maps.LatLngBoundsLiteral | undefined;
  try {
    bounds = {
      north: new Prisma.Decimal(decodeURIComponent(searchParams.get("north") ?? "")).toNumber(),
      south: new Prisma.Decimal(decodeURIComponent(searchParams.get("south") ?? "")).toNumber(),
      east: new Prisma.Decimal(decodeURIComponent(searchParams.get("east") ?? "")).toNumber(),
      west: new Prisma.Decimal(decodeURIComponent(searchParams.get("west") ?? "")).toNumber(),
    };
  } catch {
    payload.error = "No places found";
    return Response.json(payload, { status: 404 });
  }

  let origin: QueryEnderecoResult[number] | undefined;
  try {
    origin = await prisma.endereco.findFirstOrThrow({
      select: { id: true, enderecoFormatado: true, lat: true, lng: true, locais: { where: { publicado: true } } },
      where: {
        locais: { some: { publicado: true } },
        lat: { equals: originLat },
        lng: { equals: originLng },
      },
    });
  } catch (error) {
    payload.error = "No origin place found";
    return Response.json(payload, { status: 400 });
  }

  payload.data = formatEndereco(await queryEndereco(bounds), origin);

  return Response.json(payload, { status: 200 });
}

async function queryEndereco(bBox: google.maps.LatLngBoundsLiteral, take = MAX_PONTOS) {
  try {
    const results = await prisma.endereco.findMany({
      take,
      select: { id: true, enderecoFormatado: true, lat: true, lng: true, locais: { where: { publicado: true } } },
      where: {
        locais: { some: { publicado: true } },
        AND: [
          { lat: { lte: bBox.north }, lng: { lte: bBox.east } },
          { lat: { gte: bBox.south }, lng: { gte: bBox.west } },
        ],
      },
    });
    return results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

function formatLocal(local: QueryEnderecoResult[number]["locais"][number]) {
  return {
    ...local,
    lat: local.lat.toNumber(),
    lng: local.lng.toNumber(),
  };
}

function formatEndereco(data: QueryEnderecoResult, origin: QueryEnderecoResult[number]) {
  let originFound = false;
  const originLat = origin.lat.toNumber();
  const originLng = origin.lng.toNumber();
  // A common pattern for applying z-indexes is to sort the markers
  // by latitude and apply a default z-index according to the index position
  // This usually is the most pleasing visually. Markers that are more "south"
  // thus appear in front.
  const pontos = data
    .map<Omit<Ponto, "zIndex">>((endereco) => ({
      ...endereco,
      lat: endereco.lat.toNumber(),
      lng: endereco.lng.toNumber(),
      locais: endereco.locais.map(formatLocal),
    }))
    .sort((a, b) => b.lat - a.lat)
    .map<Ponto>((dataItem, index, array) => {
      let isOrigin: boolean | undefined;
      if (!originFound && (isOrigin = dataItem.lat === originLat || dataItem.lng === originLng)) originFound = true;
      return { ...dataItem, zIndex: isOrigin ? array.length - 1 : originFound ? index - 1 : index };
    });

  if (!originFound)
    pontos.unshift({
      ...origin,
      lat: originLat,
      lng: originLng,
      locais: origin.locais.map(formatLocal),
      zIndex: pontos.length,
    });
  return pontos;
}
