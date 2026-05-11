/**
 * Pakistan-specific context for each car type. Rendered on /cars/[slug].
 * Information-gain content — these are facts that AI engines can extract
 * and answer questions with, rather than generic spec-sheet info.
 */

export interface CarContext {
  summary: string;
  bestFor: string;
  fuelEconomy: string;
  quirks: string;
}

export const carContext: Record<string, CarContext> = {
  "toyota-corolla": {
    summary:
      "The Toyota Corolla is Pakistan's most-rented sedan. Across the 1,085 vendors on RentalSawari, Corolla is the single most commonly stocked car — typically the 2014-2022 Pakistan-market 'XLi' or 'GLi' variant. Rented daily for weddings, business pickups, and out-of-town day trips. With-driver is the dominant configuration.",
    bestFor:
      "Wedding baraat convoys, business day trips, in-laws pickup at the airport, multi-day trips between cities on the motorway network.",
    fuelEconomy:
      "12-14 km/l on the motorway, 9-11 km/l in city traffic. Petrol-only. Most Pakistan-market Corollas use the 1.3L or 1.6L engine.",
    quirks:
      "Pakistan-market Corollas often lack rear airbags. Boot space is moderate (470L) — fine for a family weekend but tight for a full wedding party's luggage. Most rentals come with a basic CNG conversion which the renter can usually request to disable if uncomfortable.",
  },
  "honda-civic": {
    summary:
      "The Honda Civic is Pakistan's premium-feel sedan rental — slightly more expensive than the Corolla and considered the 'classier' choice for weddings, executive transport, and one-up-from-economy business trips. The current Pakistan-market generation (X) is the 2022-2026 model.",
    bestFor:
      "Wedding rukhsati car (especially in white), executive ground transport, corporate visitor pickups, and longer urban work where comfort matters more than fuel economy.",
    fuelEconomy:
      "10-13 km/l motorway, 8-10 km/l city. Petrol turbo on newer models. Avoid CNG conversions on turbo Civics — they reduce reliability significantly.",
    quirks:
      "Lower ground clearance than the Corolla — careful with speed-bumps and unpaved hotel driveways. Premium interior makes it the wedding-fleet favourite; expect a 10-20% premium over a Corolla of similar age.",
  },
  "toyota-hiace": {
    summary:
      "The Toyota Hiace is the standard 12-seater van for Pakistani group rentals. Used heavily for family weddings, school trips, tourist groups, and large airport pickups. Almost always rented with driver — owners rarely let the Hiace out for self-drive given the cost and bulk.",
    bestFor:
      "Wedding baraat convoy support vehicle, 8-12 person family trips, tourist group Northern Areas travel, multi-day group tours.",
    fuelEconomy:
      "8-11 km/l on the motorway, 6-8 km/l city. Diesel on Pakistan-market vans, which is the right call for the heavier load.",
    quirks:
      "Most rental Hiaces in Pakistan are 2008-2015 imported JDM models. Air-conditioning performance varies wildly between vans — always test the AC before paying a deposit, especially May-September.",
  },
  "suzuki-apv": {
    summary:
      "The Suzuki APV is the 7-seater workhorse of Pakistani rentals — cheaper than a Hiace, lighter than an SUV, fits the average family with luggage comfortably. Common in budget wedding fleets and weekend trips to Murree, Patriata, or Kalar Kahar.",
    bestFor:
      "5-7 person family trips, budget weddings, Murree day-trips, baraat convoys where you need 2-3 cars to spread the cost.",
    fuelEconomy:
      "10-13 km/l motorway, 9-11 km/l city. Most rental APVs use the 1.5L petrol with CNG option.",
    quirks:
      "Suspension is firm — 5+ adults plus luggage on a rough route gets uncomfortable fast. Side sliding doors are convenient at narrow Lahori parking spots but make sure the rental APV's doors are well-maintained; they're a common point of failure on older units.",
  },
  "toyota-prado": {
    summary:
      "The Toyota Prado is Pakistan's go-to mid-size SUV rental — the practical pick between a Fortuner (cheaper, less premium) and a Land Cruiser V8 (almost double the price). Strong on the Karakoram Highway and good for Hunza / Skardu approach routes.",
    bestFor:
      "Hunza or Skardu trips (with driver), executive visitor ground transport, multi-day Northern Areas tours, large weddings as the rukhsati car or VIP-guest pickup.",
    fuelEconomy:
      "6-9 km/l motorway, 5-7 km/l city. Most rental Prados are diesel (TX or TZ trim). Fuel cost is a significant factor on multi-day Northern Areas trips.",
    quirks:
      "Older rental Prados (pre-2014) can have body-roll issues at speed on the M2. Newer 2018+ Prados handle the KKH considerably better. Always confirm the model year before paying — a 10-year-old Prado at the same price is a worse rental.",
  },
  "toyota-land-cruiser-v8": {
    summary:
      "The Toyota Land Cruiser V8 is Pakistan's premium ground transport vehicle — VIP pickups, wedding rukhsati cars, and the most demanding Northern Areas routes. Almost exclusively with-driver. Rental rates are 5-10x the cost of a sedan, but for the use cases it serves, no substitute exists.",
    bestFor:
      "Wedding rukhsati car (the most prestigious choice in 2026), embassy / VIP ground transport, Hunza-Skardu trips that involve genuine off-road sections, and political / business protocol transport.",
    fuelEconomy:
      "5-7 km/l motorway, 4-5 km/l city. Fuel cost on a Hunza round-trip (3,200km) is PKR 50,000-65,000 alone.",
    quirks:
      "Most rental V8s in Pakistan are pre-owned imports. Mileage matters — a 200,000+ km V8 at the same rental price is a worse deal. The badge says V8 but Pakistan-market versions can be V6 — confirm engine spec, not just trim level.",
  },
  "suzuki-mehran": {
    summary:
      "The Suzuki Mehran is the iconic Pakistani economy car — discontinued in 2019 but still widely available in rental fleets. Cheap, light, easy to park, and the go-to for short urban rentals, learner drivers, and tight-budget self-drive trips.",
    bestFor:
      "Self-drive urban rentals (DHA / Gulberg / F-7), short-distance daily commute rentals, and very budget-conscious renters who don't need comfort.",
    fuelEconomy:
      "15-18 km/l city, 16-19 km/l motorway (it's slow, so motorway economy is decent). 800cc petrol with optional CNG.",
    quirks:
      "No airbags. No power steering on most older units. The 800cc engine struggles on motorway grades north of Islamabad. Acceptable for in-city work — actively dangerous for multi-day trips to the Northern Areas.",
  },
  "suzuki-cultus": {
    summary:
      "The Suzuki Cultus is Pakistan's most-rented hatchback. Punches above its weight: easier to park than a Corolla, more comfortable than a Mehran, fuel-economical, and available in self-drive configurations from many Lahore and Karachi vendors.",
    bestFor:
      "Self-drive urban rentals, couples' weekend getaways, first-time-renter sedan-alternatives, university / student rentals.",
    fuelEconomy:
      "13-16 km/l city, 15-18 km/l motorway. 1.0L petrol on newer models, 1.0L K-series engine.",
    quirks:
      "Pakistan-market Cultus boot is small (250L) — fine for a couple's weekend bag, tight for a family. Some rental units still use the older 1.3L (pre-2017) — slightly thirstier but more torque on motorway grades.",
  },
  "toyota-fortuner": {
    summary:
      "The Toyota Fortuner is the entry SUV in Pakistani rental fleets — cheaper than a Prado, more capable than a sedan, and the most common choice for tourist-focused vendors who want SUV stock without the Prado's price premium.",
    bestFor:
      "Family Northern Areas trips on paved routes (Murree, Naran, Kaghan, Galiyat), executive transport in cities, wedding fleet support vehicles.",
    fuelEconomy:
      "8-11 km/l motorway, 6-9 km/l city. Most rental Fortuners are diesel.",
    quirks:
      "Underpowered for genuine off-road sections — fine for the KKH up to Hunza but not the right car for inner Hunza or Shimshal Pass. Body-on-frame construction means firmer ride than a Prado.",
  },
  "mercedes-benz": {
    summary:
      "Mercedes-Benz rentals in Pakistan typically mean the S-Class (rukhsati car), C-Class (executive), or E-Class (mid-tier). Almost exclusively with-driver, almost exclusively decorated for weddings. Pakistan-market Mercedes rentals are usually 5-15 year old imported units, not factory-new.",
    bestFor:
      "Wedding rukhsati car (the traditional choice before the Land Cruiser overtook it), formal embassy / political transport, VIP airport pickups, and one-off prestige uses.",
    fuelEconomy:
      "Wildly variable — 7-12 km/l motorway depending on model and age. Less of a buying-decision factor since rentals are per-day, not per-km.",
    quirks:
      "Maintenance costs for Mercedes parts in Pakistan are 3-5x the cost of equivalent Toyota parts. Vendors keep their Mercedes in tighter rotation than other vehicles — book 2-4 weeks ahead for wedding season (Nov-Feb).",
  },
  "suzuki-bolan": {
    summary:
      "The Suzuki Bolan is the rectangular 7-seater microvan — Pakistan's most affordable van rental. Mostly used for school / madrasa transport, small group day-trips, and intra-city goods runs that need a back-row drop. Cheapest entry into the van category at PKR 4,000/day.",
    bestFor:
      "Short-distance group rentals (5-7 people), in-city moves, budget weddings where the Bolan acts as a supply / catering support vehicle, and very budget-conscious tourist groups.",
    fuelEconomy:
      "11-14 km/l, mostly 800cc petrol. CNG-equipped Bolans are common.",
    quirks:
      "Unsafe by modern standards — no airbags, dated chassis, weak brakes by 21st-century norms. Acceptable for short slow city trips. Don't take a Bolan north of Islamabad or onto the motorway at full load.",
  },
  "toyota-coaster": {
    summary:
      "The Toyota Coaster is the standard mid-size bus rental in Pakistan — 22-26 seats, used for large weddings (the full baraat convoy), corporate outings, school trips, and large tourist groups. Almost exclusively with driver.",
    bestFor:
      "Full-baraat weddings (20+ guests), corporate retreats, school trips, large tourist groups (15+), and event-day shuttle services.",
    fuelEconomy:
      "5-7 km/l. Diesel only. The fuel-per-passenger economics are actually better than a sedan if you're moving 20 people anyway.",
    quirks:
      "Most rental Coasters are older imported units (2002-2012). Air-conditioning performance varies and is the single most important spec to confirm — a Coaster without working AC in May-September is unrentable.",
  },
};
