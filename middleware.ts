import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GeoCookieValue } from "./types";

export async function middleware(request: NextRequest) {
  // Middleware to handle the 'geo' cookie for use in homepage search
  const { nextUrl: url } = request;
  if (url.pathname === "/") {
    // ip geo present with Vercel, https://vercel.com/templates/next.js/edge-functions-geolocation
    if (request.ip && request.geo) {
      // Getting cookies from the request using the `RequestCookies` API
      const geoCookie = request.cookies.get("geo");
      let geo: GeoCookieValue | undefined;
      if (geoCookie) geo = JSON.parse(decodeURIComponent(geoCookie.value));

      if (!geo || geo.ip !== request.ip) {
        const { geo: requestGeo } = request;

        const country = requestGeo.country || "pt-BR"; // for use somewhere
        const lat = Number(requestGeo.latitude);
        const lng = Number(requestGeo.longitude);
        const newCookie: GeoCookieValue = { country, lat, lng, ip: request.ip };

        // Setting cookies on the response using the `ResponseCookies` API
        const response = NextResponse.next();
        response.cookies.set({
          name: "geo",
          value: encodeURIComponent(JSON.stringify(newCookie)),
          path: "/",
          httpOnly: true,
        });

        return response;
      }
    }
  }
}
