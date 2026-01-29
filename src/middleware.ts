import { defineMiddleware } from "astro:middleware";
import { paraglideMiddleware } from "./paraglide/server.js";

export const onRequest = defineMiddleware((context, next) => {
    return paraglideMiddleware(context.request, ({ request }) => {
        return next(
            // Pass the modified request with de-localized path to the next middleware/handler
            // This allows Astro to match /pt-br/about to /about
            new Request(request)
        );
    });
});
