import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.182.0/http/file_server.ts";

console.log("Listening on http://localhost:8000");
serve(req => {
    const pathname = new URL(req.url).pathname;
    console.log(pathname);

    return serveDir(req, { fsRoot: "./" });
});