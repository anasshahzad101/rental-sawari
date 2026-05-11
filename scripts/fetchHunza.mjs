for (const a of ["Hunza_District", "Karimabad,_Hunza", "Passu_Cones", "Rakaposhi", "Attabad_Lake"]) {
  const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${a}`);
  const j = await r.json();
  const src = (j.originalimage && j.originalimage.source) || (j.thumbnail && j.thumbnail.source);
  if (src) { console.log(a, "->", src); break; }
  console.log(a, "no image");
}
