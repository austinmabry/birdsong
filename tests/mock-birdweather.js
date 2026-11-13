// Stand-in for BirdWeather's GraphQL API (tests only). Answers Birdsong's fixed questions with
// sample data, and echoes back exactly what reached it under "received" so the tests can check it.
function graphql(r) {
    let body = {};
    try { body = JSON.parse(r.requestText || ""); } catch (e) {}
    const q = String(body.query || ""), v = body.variables || {}, h = r.headersIn;
    const received = { method: r.method, query: q, variables: v, contentType: h["Content-Type"] || "", host: h.Host || "",
        cookie: h.Cookie || "", authorization: h.Authorization || "", ua: h["User-Agent"] || "", xff: h["X-Forwarded-For"] || "" };
    if (v.id === "404") {   // BirdWeather answers an unknown station with its HTML "not found" page
        r.headersOut["Content-Type"] = "text/html";
        return r.return(404, "<html><title>Page Not Found :: BirdWeather</title></html>");
    }
    const wren = { commonName: "Eurasian Wren", scientificName: "Troglodytes troglodytes", thumbnailUrl: "https://media.birdweather.com/species/5/wren.jpg" };
    const jackdaw = { commonName: "Eurasian Jackdaw", scientificName: "Corvus monedula", thumbnailUrl: "https://media.birdweather.com/species/76/jackdaw.jpg" };
    const out = { data: null };
    if (/earliestDetectionAt/.test(q)) out.data = { station: { earliestDetectionAt: "2026-01-22T17:43:22+01:00" } };
    else if (/timezone/.test(q)) {
        if (v.id === "7") out.errors = [{ message: "Cannot return null for non-nullable field Station.timezone" }];
        else out.data = { station: { timezone: "Europe/Amsterdam" } };
    }
    else if (/topSpecies/.test(q)) out.data = { topSpecies: [{ count: 42, speciesId: "5", species: wren }, { count: 17, speciesId: "76", species: jackdaw }] };
    else if (/dailyDetectionCounts/.test(q)) out.data = { dailyDetectionCounts: [{ date: "2026-11-12", counts: [{ speciesId: v.sps[0], count: 9 }] }] };
    else if (/detectionCounts/.test(q)) out.data = { species: { detectionCounts: { bins: [{ key: "2026-11-12T05:00:00Z", count: 3 }, { key: "2026-11-12T06:00:00Z", count: 7 }] } } };
    else if (/recent:detections/.test(q)) out.data = {
        recent: { nodes: [{ id: "1", timestamp: "2026-11-12T07:12:03+01:00", confidence: 0.9, soundscape: { url: "https://media.birdweather.com/soundscapes/1/1.flac", startTime: 3, endTime: 6 } }] },
        latest: { nodes: [{ timestamp: "2026-11-12T07:12:03+01:00" }] } };
    else out.errors = [{ message: "unknown question" }];
    out.received = received;
    r.headersOut["Content-Type"] = "application/json";
    r.return(200, JSON.stringify(out));
}
export default { graphql };
