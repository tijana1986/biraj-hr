import listing1 from "@/assets/listing-1.jpg";
import listing2 from "@/assets/listing-2.jpg";
import listing3 from "@/assets/listing-3.jpg";
import listing4 from "@/assets/listing-4.jpg";
import heroImg from "@/assets/hero.jpg";

export type Subcategory = {
  slug: string;
  name: string;
  /** Lucide icon ime — mapirano u SubcategoryIcon komponenti */
  icon?: string;
  /** Kratak opis za stranicu podkategorije i SEO */
  description?: string;
};
export type Category = {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  /** Standardna cijena objave za 30 dana (EUR) */
  listingFee: number;
  /** Cijena premium "Top" pozicioniranja (EUR / 7 dana) */
  premiumFee: number;
  /** Posebni model naplate (npr. naplata kontakta umjesto objave) */
  specialModel?: "services-contact";
  /** Cijena otključavanja kontakta investitora za izvođače (EUR) */
  contactFee?: number;
  subcategories: Subcategory[];
};

export const CATEGORIES: Category[] = [
  {
    slug: "vozila",
    name: "Vozila",
    tagline: "Automobili, motocikli, kamioni, plovila i dijelovi",
    image: listing3,
    listingFee: 6.99,
    premiumFee: 11.99,
    subcategories: [
      { slug: "osobni-automobili", name: "Osobni automobili", icon: "Car", description: "Novi i rabljeni automobili svih marki i godina." },
      { slug: "motocikli-skuteri", name: "Motocikli i skuteri", icon: "Bike", description: "Motocikli, skueri, ATV-ovi i ostala motorna vozila." },
      { slug: "kombi-kamioni", name: "Kombi i kamioni", icon: "Truck", description: "Kombiji, kamioni, autobusi i teretna vozila." },
      { slug: "plovila", name: "Plovila i čamci", icon: "Anchor", description: "Jahte, čamci, brodice i ostala plovila." },
      { slug: "dijelovi-oprema", name: "Dijelovi i oprema", icon: "Wrench", description: "Dijelovi motora, gume, akcesori, alat i ostala vozna oprema." },
    ],
  },
  {
    slug: "nekretnine",
    name: "Nekretnine",
    tagline: "Stanovi, kuće, poslovni prostori i zemljišta",
    image: heroImg,
    listingFee: 14.99,
    premiumFee: 29.99,
    subcategories: [
      { slug: "prodaja-stanova", name: "Prodaja stanova", icon: "Home", description: "Stanovi na prodaju - novi i rabljeni." },
      { slug: "najam-stanova", name: "Najam stanova", icon: "DoorOpen", description: "Stambeni prostori na najam - dugoročni i kratkoročni." },
      { slug: "kuce-vile", name: "Kuće i vile", icon: "House", description: "Kuće, vile, vikendi i ostale obiteljske nekretnine." },
      { slug: "poslovni-prostori", name: "Poslovni prostori", icon: "Building2", description: "Uredski prostori, prodajne površine, skladišta i garače." },
      { slug: "zemljista", name: "Zemljišta", icon: "Trees", description: "Građevinska i poljoprivredna zemljišta." },
    ],
  },
  {
    slug: "poslovi-usluge",
    name: "Poslovi i usluge",
    tagline: "Ponude posla, traži posla, obrtničke i profesionalne usluge",
    image: listing4,
    listingFee: 0,
    premiumFee: 0,
    specialModel: "services-contact",
    contactFee: 5.00,
    subcategories: [
      { slug: "ponuda-posla", name: "Ponuda posla", icon: "Briefcase", description: "Poslodavci nude stalni posao, sezonski rad i ugovore o djelu." },
      { slug: "potraznja-posla", name: "Potražnja posla", icon: "UserSearch", description: "Kandidati nude svoje vještine i iskustvo - životopisi i ponude." },
      { slug: "obrtnicke-usluge", name: "Obrtničke usluge", icon: "Hammer", description: "Majstori, izvodači - elektrika, vodoinstalacije, zidanje, brisanje..." },
      { slug: "it-dizajn", name: "IT i dizajn", icon: "Code2", description: "Razvoj web i mobilnih aplikacija, grafički dizajn, marketing." },
      { slug: "ostale-usluge", name: "Ostale usluge", icon: "Tag", description: "Prijevoz, selidbe, edukacija, čišćenje i druge usluge." },
    ],
  },
  {
    slug: "turizm-smjestaj",
    name: "Turizam i smještaj",
    tagline: "Apartmani, kampovi, hoteli, restorani i turističke usluge",
    image: listing2,
    listingFee: 9.99,
    premiumFee: 19.99,
    subcategories: [
      { slug: "apartmani-sobe", name: "Apartmani i privatni smještaj", icon: "Bed", description: "Apartmani, privatne sobe i kuće za turiste." },
      { slug: "kampovi", name: "Kampovi", icon: "Tent", description: "Kampovi, kamp mjesta i glamping." },
      { slug: "hoteli-hosteli", name: "Hoteli i hosteli", icon: "Building", description: "Hoteli, gostionice, hosteli i druge vrste smještaja." },
      { slug: "restorani-barovi", name: "Restorani i barovi", icon: "UtensilsCrossed", description: "Restorani, barovi, kafići i specijaliteti." },
      { slug: "atrakcije-usluge", name: "Atrakcije i usluge", icon: "MapPin", description: "Ture, adrenalin aktivnosti, rent-a-car i turističke usluge." },
    ],
  },
];

export type Review = {
  id: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  listingId: string;
  listingTitle: string;
  rating: number; // 1-5 stars
  title: string;
  text: string;
  verified: boolean;
  helpful: number;
  createdAt: string;
};

export type ReputationBadge = "trusted" | "excellent" | "outstanding";

export type Seller = {
  id: string;
  name: string;
  city: string;
  avatarLetter: string;
  trustScore: number;
  listingsCount: number;
  joinedYear: number;
  verified: boolean;
  bio: string;
  reviewCount?: number;
  averageRating?: number;
  reputationBadge?: ReputationBadge;
};

const FIRST_NAMES = ["Ana", "Luka", "Ivana", "Marko", "Petra", "Filip", "Maja", "Tomislav", "Nina", "Andrej", "Dora", "Vedran", "Sara", "Karlo", "Mia"];
const LAST_NAMES = ["Marić", "Horvat", "Kovač", "Babić", "Šimić", "Novak", "Vuković", "Knežević", "Pavlović", "Tomić", "Jurić", "Matić", "Perić", "Lovrić", "Filipović"];
const CITIES = ["Zagreb", "Split", "Rijeka", "Dubrovnik", "Pula", "Zadar", "Osijek", "Varaždin", "Šibenik", "Karlovac"];

const BUYER_NAMES = FIRST_NAMES.map((fn, i) => `${fn} ${LAST_NAMES[i]}`);

const REVIEW_TITLES = [
  "Odličan prodavač, preporučujem!",
  "Sve kako je napisano",
  "Brza i pouzdana transakcija",
  "Profesionalno i pažljivo",
  "Bez zamjerki, sve savršeno",
  "Kao na fotografiji",
  "Odličan izbor",
  "Preporuka od srca",
];

const REVIEW_TEXTS = [
  "Sve je bilo savršeno — brza isporuka, točan opis, odličan proizvod. Siguran sam da će mi poslužiti dugo.",
  "Prodavač je izuzetno ljubazan i spreman. Pregovora nije bilo, sve se brzo riješilo.",
  "Obaveza preuzeta, obaveza ispunjena. Točno onako kako je bilo dogovoreno.",
  "Profesionalni pristup od početka do kraja. Fotografije su točne, kvaliteta je do očekivanja.",
  "Bez problema, bez žalbi, bez zamjerki. Preporuka za sve koji razmišljaju.",
  "Odličan proizvod, točan opis, brza dostava. Što se više može tražiti?",
  "Uvijek je dobro kada kreneš od povjerenja, a ovdje je to bilo opravdano.",
  "Transakcija kao iz udžbenika — sve transparentno i prema dogovoru.",
];

// Initialize SELLERS first without reviews
export const SELLERS: Seller[] = FIRST_NAMES.map((fn, i) => ({
  id: `s${i + 1}`,
  name: `${fn} ${LAST_NAMES[i]}`,
  city: CITIES[i % CITIES.length],
  avatarLetter: fn[0],
  trustScore: 80 + ((i * 7) % 20),
  listingsCount: 3 + ((i * 11) % 24),
  joinedYear: 2019 + (i % 6),
  verified: i % 4 !== 0,
  bio: "Verificirani prodavač s pažljivo odabranim oglasima i transparentnim povijesnim ocjenama.",
}));

export type PromotionTier = "none" | "spotlight" | "featured" | "premium" | "vip";

export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: "EUR";
  city: string;
  category: string;
  subcategory: string;
  images: string[];
  sellerId: string;
  verified: boolean;
  authenticated: boolean;
  createdAt: string;
  specs: Record<string, string>;
  promotionTier?: PromotionTier;
  promotionExpiresAt?: string;
  savedCount?: number;
};

const IMG_POOL = [listing1, listing2, listing3, listing4, heroImg];

const TITLES: Record<string, string[]> = {
  "prodaja-stanova": ["Penthouse s pogledom na Jadran", "Trosobni stan, novogradnja", "Studio u centru Zagreba", "Apartman uz more", "Dvosobni stan, Maksimir"],
  "najam-stanova": ["Stan za najam, centar", "Apartman na duži najam", "Studio za studente", "Namješten stan, Trešnjevka", "Dvosoban za najam"],
  "kuce-vile": ["Vila s bazenom", "Kamena kuća u Istri", "Moderna vila uz obalu", "Obiteljska kuća s vrtom", "Mediteranska vila"],
  "poslovni-prostori": ["Poslovni prostor u centru", "Trgovački prostor, prizemlje", "Ured s parkingom", "Galerijski prostor", "Skladište s rampom"],
  "zemljista": ["Građevinsko zemljište", "Maslinik s panoramom", "Vinograd 2 ha", "Pomorsko zemljište", "Zemljište uz cestu"],
  "sobe-smjestaj": ["Soba u centru, najam", "Kratkoročni smještaj, Split", "Studentska soba, Zagreb", "Apartman za odmor", "Soba s vlastitom kupaonicom"],
  "osobni-automobili": ["Mercedes-Benz S-klasa", "Porsche 911 Carrera", "BMW M3 Competition", "Audi RS6 Avant", "Range Rover Sport"],
  "motocikli-skuteri": ["Ducati Panigale V4", "BMW R 1250 GS", "Vespa GTS 300", "Triumph Bonneville", "Harley-Davidson Fat Boy"],
  "kombi-kamioni": ["Mercedes Sprinter", "VW Crafter, dugi", "Iveco Daily", "MAN TGE", "Ford Transit"],
  "kamp-prikolice": ["Karavan Hobby De Luxe", "Adria Altea, kamp prikolica", "Hymer kamper", "Fiat Ducato camper", "Knaus karavan"],
  "plovila": ["Motorni brod Jeanneau", "Jedrilica Bavaria", "Gliser Quicksilver", "Jet ski Yamaha", "Gumenjak Bombard"],
  "dijelovi-oprema": ["Set BBS felgi 19”", "Recaro sportska sjedala", "Akrapovič ispuh", "OEM alu naplatci", "Brembo kočioni paket"],
  "pametni-telefoni": ["iPhone 15 Pro Max", "Samsung Galaxy S25", "Google Pixel 9 Pro", "Xiaomi 14 Ultra", "OnePlus 12"],
  "tableti": ["iPad Pro 12.9", "Samsung Galaxy Tab S10", "iPad Air M2", "Lenovo Tab P12", "Huawei MatePad Pro"],
  "pametni-satovi": ["Apple Watch Ultra 2", "Samsung Galaxy Watch 7", "Garmin Fenix 7", "Huawei Watch GT5", "Polar Vantage V3"],
  "dodaci-mobiteli": ["AirPods Pro 2", "Bežični punjač MagSafe", "Anker powerbank 20k", "Etui koža za iPhone", "Auto držač magnetski"],
  "prijenosna-racunala": ["MacBook Pro M3", "Lenovo ThinkPad X1", "Dell XPS 15", "ASUS ZenBook 14", "HP Spectre x360"],
  "stolna-racunala": ["Gaming PC RTX 4080", "iMac M3 24\"", "Mini PC Intel NUC", "Workstation Dell Precision", "Custom build Ryzen 9"],
  "komponente-racunala": ["NVIDIA RTX 4070", "AMD Ryzen 9 7900X", "32 GB DDR5 RAM", "Samsung 990 Pro 2 TB", "MSI MAG matična"],
  "gaming": ["PlayStation 5 Slim", "Xbox Series X", "Nintendo Switch OLED", "Logitech G Pro X", "Razer DeathAdder V3"],
  "mrezna-oprema": ["TP-Link Wi-Fi 7 router", "Mesh sustav Deco", "Switch managed 24-port", "Pristupna točka Ubiquiti", "NAS Synology DS224+"],
  "televizori": ["LG OLED 65\" C4", "Samsung QLED 75\"", "Sony Bravia XR 55\"", "TCL Mini-LED 65\"", "Hisense U8 75\""],
  "audio-zvucnici": ["Sonos Era 300", "Bang & Olufsen Beosound", "JBL Charge 5", "KEF LS50 Wireless", "Marshall Stanmore III"],
  "fotoaparati": ["Sony A7 IV", "Canon EOS R6 Mark II", "Fujifilm X-T5", "Nikon Z6 II", "Leica Q3"],
  "dronovi-kamere": ["DJI Mavic 3 Pro", "DJI Mini 4 Pro", "GoPro Hero 12", "Insta360 X4", "DJI Osmo Pocket 3"],
  "luksuzni-satovi": ["Rolex Submariner 2022.", "Omega Speedmaster Professional", "Patek Philippe Nautilus", "Audemars Piguet Royal Oak", "IWC Portugieser kronograf"],
  "zlato-srebro": ["Zlatna ogrlica 18k", "Srebrni komplet ručne izrade", "Platinasti prsten s dijamantom", "Vintage zlatna narukvica", "Set zlatnih dugmadi"],
  "dragocjeni-kameni": ["Smaragd 2.4 ct", "Safir Ceylon 3.1 ct", "Dijamantni solitaire 1 ct", "Rubin Burma 2 ct", "Tahitski biser komplet"],
  "namjestaj": ["B&B Italia kauč", "Cassina fotelja", "Poliform garderobni ormar", "Eames Lounge replika", "Minotti dnevna garnitura"],
  "veliki-aparati": ["Miele perilica sušilica", "Bosch hladnjak side-by-side", "LG perilica rublja 9 kg", "Samsung frižider Family Hub", "Gorenje sušilica"],
  "mali-aparati": ["KitchenAid Artisan mikser", "Dyson V15 usisavač", "Jura espresso aparat", "Philips Airfryer XXL", "Vitamix blender"],
  "uredjenje-doma": ["Perzijski tepih 3x4 m", "Murano luster", "Velvet zavjese, set", "Dizajnerski zidni dekor", "Mramorni stolić"],
  "kuhinja-pribor": ["KitchenAid Artisan mikser", "Set Wüsthof noževa", "Vitamix blender", "Le Creuset kotao", "Riedel kristalne čaše"],
  "bicikli": ["Specialized Tarmac SL8", "Trek Madone gen 7", "Cannondale Topstone gravel", "E-bike Cube Reaction Hybrid", "Pinarello Dogma F"],
  "fitness-oprema": ["Concept2 RowErg", "Bowflex SelectTech bučice", "Peloton Bike+", "Profi traka Technogym", "Reebok Fitness komplet"],
  "skijanje-zima": ["Atomic Bent 100 ski", "Salomon S/Pro 120 pancerice", "Burton Custom snowboard", "Skijaška jakna Helly Hansen", "Set za skitouring Dynafit"],
  "lov-ribolov": ["Sako 85 lovački karabin", "Beretta Silver Pigeon", "Daiwa Ninja štap", "Shimano Stradic role", "Lovačka oprema komplet"],
  "kamp-outdoor": ["MSR Hubba šator", "Osprey Atmos 65 ruksak", "Therm-a-Rest NeoAir", "Coleman kuhalo", "Vango spavaća vreća"],
  "vrtna-oprema": ["Husqvarna kosilica", "Stihl trimer", "Bosch Indego robotska kosilica", "Set vrtnih klupa teak", "Vrtni roštilj Weber"],
  "elektricni-alat": ["Bosch GBH bušilica", "Makita LXT komplet", "DeWalt cirkular", "Milwaukee M18 udarni odvijač", "Festool brusilica"],
  "strojevi-traktori": ["John Deere 5075E", "New Holland T4.75", "Fendt Vario 211", "Kuhn presa", "Same Argon traktor"],
  "bazeni-sauna": ["Intex montažni bazen 4.5m", "Bestway Lay-Z-Spa jacuzzi", "Finska sauna 4 osobe", "Bazenska crpka", "Set za održavanje bazena"],
  "oprema-za-bebe": ["Stokke Tripp Trapp", "Bugaboo Fox 5 kolica", "Maxi-Cosi auto sjedalica", "Babybjörn nosiljka", "Avent set bočica"],
  "djecja-odjeca": ["Komplet Petit Bateau", "Zara Kids paket", "H&M dječji set", "Reima zimska jakna", "Cipele Geox"],
  "igracke": ["LEGO Technic set", "Playmobil farma", "Brio drveni vlak", "Barbie Dreamhouse", "Hot Wheels staza"],
  "kucni-ljubimci": ["Kavez za papige Ferplast", "Akvarij Juwel 240 l", "Set za pse Trixie", "Mačja kućica", "Krevet za pse premium"],
  "luksuzni-apartmani": ["Penthouse Vista Mare, Dubrovnik", "Designer suite, Rovinj", "Premium apartman Riva, Split", "Luxury loft Kaštelet", "Sky apartman, Opatija"],
  "apartmani-s-pogledom": ["Panorama suite, Hvar", "Pogled na Kornate", "Apartman s vidikom na Plitvice", "Sunset terrace, Vis", "Stari grad pogled, Trogir"],
  "apartmani-za-grupe": ["Veliki apartman 8 osoba, Pag", "Grupni smještaj Brač", "Apartman za prijatelje, Murter", "Obiteljska oaza Korčula", "Penthouse 10 osoba, Zadar"],
  "apartmani-blizu-plaze": ["Beachfront studio, Makarska", "50 m do mora, Brela", "First row apartman, Crikvenica", "Plažni apartman, Lopar", "Direkt na plaži, Baška Voda"],
  "kamene-kuce": ["Istarska kamena vila, Motovun", "Dalmatinska kuća, Konavle", "Stara kuća s tradicijom, Skradin", "Renovirani stancija, Buzet", "Kamena kuća uz polja, Imotski"],
  "vile-s-bazenom": ["Vila s infinity bazenom, Šolta", "Privatna vila Istra", "Pool villa, Brač", "Vila s grijanim bazenom", "Premium vila Pelješac"],
  "obiteljske-kuce": ["Kuća za odmor s vrtom, Krk", "Family villa, Cres", "Obiteljska kuća, Ston", "Pet-friendly kuća, Lošinj", "Kuća uz šumu, Gorski kotar"],
  "eko-smjestaj": ["Eko etno selo, Lika", "Off-grid kuća, Velebit", "Solar smještaj, Mljet", "Permakultura imanje, Slavonija", "Bio-vila, Istra"],
  "boutique-hoteli": ["Boutique Riva, Rovinj", "Designer hotel Split", "Heritage hotel Korčula", "Mini hotel Stari grad", "Boutique Plitvice"],
  "resort-smjestaj": ["Resort & Spa Istra", "Wellness resort Hvar", "All-inclusive Pelješac", "Family resort Krk", "Premium resort Dubrovnik"],
  "glamping": ["Safari šator, Plitvice", "Dome glamping, Istra", "Tree house, Gorski kotar", "Bubble tent, Velebit", "Luxury yurt, Slavonija"],
  "penthouse-apartmani": ["Sky penthouse Zagreb", "Riva penthouse, Split", "Marina penthouse, Zadar", "Old town penthouse, Pula", "Adriatic penthouse, Opatija"],
  "ponuda-posla": ["Konobar/ica, sezona Hvar", "Senior backend developer, Zagreb", "Voditelj recepcije, Dubrovnik", "Prodavač u butiku, Split", "Skladištar, Rijeka"],
  "potraznja-posla": ["Tražim posao u administraciji", "Iskusni konobar traži angažman", "Frontend developer dostupan", "Dadilja s preporukama", "Vozač B kategorije traži posao"],
  "obrtnicke-usluge": ["Vodoinstalater 0–24", "Soboslikar i ličilac", "Električar, ovlašteni", "Postavljanje keramike", "Stolar po mjeri"],
  "it-dizajn": ["Izrada web stranice", "Logo i brand identitet", "Razvoj mobilne aplikacije", "SEO optimizacija", "Google Ads kampanje"],
  "prijevoz-selidbe": ["Selidbe Zagreb i okolica", "Prijevoz robe do 3.5 t", "Međunarodne selidbe EU", "Dostava namještaja", "Taxi prijevoz na zahtjev"],
  "edukacija-instrukcije": ["Instrukcije iz matematike", "Tečaj engleskog jezika", "Sat klavira za početnike", "Priprema za maturu", "Treninzi tenisa"],
  "ciscenje-kucanstvo": ["Generalno čišćenje stanova", "Čišćenje ureda i poslovnih prostora", "Dubinsko čišćenje tapeciranog", "Dadilja na sat", "Pomoć u kućanstvu"],
  "ugostiteljstvo-eventi": ["Catering za vjenčanja", "Fotograf za vjenčanja", "DJ za zabave i evente", "Organizacija rođendana", "Iznajmljivanje opreme za eventi"],
};

function seedListings(): Listing[] {
  const all: Listing[] = [];
  let counter = 1;
  for (const cat of CATEGORIES) {
    for (const sub of cat.subcategories) {
      const titles = TITLES[sub.slug] ?? [sub.name];
      // Smještaj: 8 po podkategoriji (gušći inventar), inače 6
      const perSub = cat.slug === "smjestaj" ? 8 : 6;
      for (let i = 0; i < perSub; i++) {
        const t = titles[i % titles.length];
        const seller = SELLERS[(counter + i) % SELLERS.length];
        const basePrice =
          cat.slug === "nekretnine" ? 180000 + ((counter * 13) % 900) * 1000 :
          cat.slug === "vozila" ? 18000 + ((counter * 17) % 200) * 500 :
          cat.slug === "dom-namjestaj" ? 400 + ((counter * 7) % 400) * 15 :
          cat.slug === "smjestaj" ? 80 + ((counter * 31) % 600) * 2 :
          cat.slug === "poslovi-usluge" ? 50 + ((counter * 13) % 400) * 5 :
          800 + ((counter * 23) % 600) * 25;
        const img = IMG_POOL[counter % IMG_POOL.length];

        // Randomly assign promotions to 10-20% of listings
        const promotionRand = Math.random();
        let promotionTier: PromotionTier = "none";
        if (promotionRand < 0.05) promotionTier = "vip";
        else if (promotionRand < 0.1) promotionTier = "premium";
        else if (promotionRand < 0.2) promotionTier = "spotlight";

        // Promotion expires in 7 days
        const promotionExpiresAt = promotionTier !== "none"
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          : undefined;

        all.push({
          id: String(counter),
          title: i > 0 ? `${t} — primjerak ${i + 1}` : t,
          description:
            "Detaljan opis primjerka. Stanje izvrsno, dokumentacija dostupna, moguć pregled uživo uz prethodni dogovor. Dogovor i preuzimanje izravno s prodavateljem — Biraj.HR ne posreduje u plaćanju.",
          price: basePrice,
          currency: "EUR",
          city: seller.city,
          category: cat.slug,
          subcategory: sub.slug,
          images: [img, IMG_POOL[(counter + 1) % IMG_POOL.length], IMG_POOL[(counter + 2) % IMG_POOL.length]],
          sellerId: seller.id,
          verified: counter % 3 !== 0,
          authenticated: counter % 2 === 0,
          createdAt: new Date(Date.now() - counter * 86400000 * 0.7).toISOString(),
          specs:
            cat.slug === "nekretnine"
              ? { Površina: `${60 + (counter % 200)} m²`, Sobe: `${1 + (counter % 5)}`, "Godina izgradnje": String(1980 + (counter % 45)), Etaža: `${1 + (counter % 6)}.` }
              : cat.slug === "vozila"
              ? { Godište: String(2010 + (counter % 15)), Kilometraža: `${20000 + (counter * 137) % 180000} km`, Gorivo: ["Benzin", "Dizel", "Hibrid", "Električni"][counter % 4], Mjenjač: counter % 2 === 0 ? "Automatski" : "Ručni" }
              : cat.slug === "smjestaj"
              ? { Kapacitet: `${2 + (counter % 8)} osoba`, "Spavaće sobe": `${1 + (counter % 5)}`, "Udaljenost od mora": `${50 + (counter * 17) % 800} m`, "Wi-Fi": "Da" }
              : { Stanje: "Izvrsno", Materijal: "Premium", Dimenzije: "Standard", Porijeklo: "EU" },
          promotionTier,
          promotionExpiresAt,
          savedCount: Math.floor(Math.random() * 100),
        });
        counter++;
      }
    }
  }
  return all;
}

export const LISTINGS: Listing[] = seedListings();

// Now that LISTINGS is initialized, seed reviews
function seedReviews(): Review[] {
  const reviews: Review[] = [];
  let id = 1;

  for (const seller of SELLERS) {
    const reviewCount = 5 + Math.floor(Math.random() * 45);
    for (let i = 0; i < reviewCount; i++) {
      const rating = Math.random() < 0.85 ? (4 + Math.random()) : (2 + Math.random() * 3);
      reviews.push({
        id: `r${id++}`,
        sellerId: seller.id,
        buyerId: `b${Math.floor(Math.random() * 50) + 1}`,
        buyerName: BUYER_NAMES[Math.floor(Math.random() * BUYER_NAMES.length)],
        listingId: String(Math.floor(Math.random() * LISTINGS.length) + 1),
        listingTitle: LISTINGS[Math.floor(Math.random() * LISTINGS.length)].title,
        rating: Math.round(rating * 2) / 2,
        title: REVIEW_TITLES[Math.floor(Math.random() * REVIEW_TITLES.length)],
        text: REVIEW_TEXTS[Math.floor(Math.random() * REVIEW_TEXTS.length)],
        verified: Math.random() < 0.9,
        helpful: Math.floor(Math.random() * 20),
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  return reviews;
}

export const REVIEWS: Review[] = seedReviews();

// Update SELLERS with review stats
for (let i = 0; i < SELLERS.length; i++) {
  const seller = SELLERS[i];
  const sellerReviews = REVIEWS.filter((r) => r.sellerId === seller.id);
  const avgRating = sellerReviews.length > 0
    ? sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length
    : 0;

  let badge: ReputationBadge | undefined;
  if (avgRating >= 4.7 && sellerReviews.length >= 20) badge = "outstanding";
  else if (avgRating >= 4.5 && sellerReviews.length >= 10) badge = "excellent";
  else if (avgRating >= 4.0 && sellerReviews.length >= 5) badge = "trusted";

  seller.reviewCount = sellerReviews.length;
  seller.averageRating = avgRating;
  seller.reputationBadge = badge;
}

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getSubcategory(catSlug: string, subSlug: string) {
  const cat = getCategory(catSlug);
  return cat?.subcategories.find((s) => s.slug === subSlug);
}

export function getSeller(id: string) {
  return SELLERS.find((s) => s.id === id);
}

export function getListing(id: string) {
  return LISTINGS.find((l) => l.id === id);
}

export type ListingQuery = {
  category?: string;
  subcategory?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  verifiedOnly?: boolean;
  sort?: "relevantnost" | "noviji" | "cijena-asc" | "cijena-desc" | "popularnost";
};

export function queryListings(qry: ListingQuery): Listing[] {
  let out = LISTINGS.slice();
  if (qry.category) out = out.filter((l) => l.category === qry.category);
  if (qry.subcategory) out = out.filter((l) => l.subcategory === qry.subcategory);
  if (qry.city) out = out.filter((l) => l.city.toLowerCase() === qry.city!.toLowerCase());
  if (qry.verifiedOnly) out = out.filter((l) => l.verified);
  if (qry.minPrice != null) out = out.filter((l) => l.price >= qry.minPrice!);
  if (qry.maxPrice != null) out = out.filter((l) => l.price <= qry.maxPrice!);
  if (qry.q) {
    const q = qry.q.toLowerCase();
    out = out.filter((l) => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || l.city.toLowerCase().includes(q));
  }
  switch (qry.sort) {
    case "relevantnost": {
      const q = (qry.q ?? "").toLowerCase();
      out.sort((a, b) => {
        const score = (l: Listing) => {
          let s = l.verified ? 5 : 0;
          if (q) {
            if (l.title.toLowerCase().includes(q)) s += 10;
            if (l.city.toLowerCase().includes(q)) s += 3;
            if (l.description.toLowerCase().includes(q)) s += 2;
          }
          return s;
        };
        return score(b) - score(a) || +new Date(b.createdAt) - +new Date(a.createdAt);
      });
      break;
    }
    case "cijena-asc":
      out.sort((a, b) => a.price - b.price);
      break;
    case "cijena-desc":
      out.sort((a, b) => b.price - a.price);
      break;
    case "popularnost":
      out.sort((a, b) => Number(b.verified) - Number(a.verified) || b.price - a.price);
      break;
    case "noviji":
    default:
      out.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  return out;
}

export const CITIES_LIST = CITIES;

export function formatPrice(p: number) {
  return new Intl.NumberFormat("hr-HR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(p);
}

export function countByCategory(slug: string) {
  return LISTINGS.filter((l) => l.category === slug).length;
}

export function countBySubcategory(catSlug: string, subSlug: string) {
  return LISTINGS.filter((l) => l.category === catSlug && l.subcategory === subSlug).length;
}

export function relatedListings(listing: Listing, limit = 4): Listing[] {
  return LISTINGS.filter((l) => l.id !== listing.id && l.category === listing.category).slice(0, limit);
}

export function listingsBySeller(sellerId: string) {
  return LISTINGS.filter((l) => l.sellerId === sellerId);
}

// Analytics data types and functions
export type ListingAnalytics = {
  listingId: string;
  title: string;
  views: number;
  inquiries: number;
  conversionRate: number;
  revenue: number;
  price: number;
};

export type SellerAnalytics = {
  sellerId: string;
  totalEarningsMonth: number;
  totalEarningsYear: number;
  activeListings: number;
  totalViews: number;
  totalInquiries: number;
  conversionRate: number;
  topProducts: ListingAnalytics[];
  revenueByMonth: Array<{ month: string; revenue: number }>;
  viewsTrend: Array<{ day: string; views: number }>;
};

function generateAnalyticsForListing(listing: Listing, sellerId: string): ListingAnalytics {
  const daysOld = Math.floor((Date.now() - new Date(listing.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const baseViews = 50 + daysOld * (15 + Math.random() * 30);
  const views = Math.floor(baseViews * (0.8 + Math.random() * 0.4));
  const inquiries = Math.floor(views * (0.05 + Math.random() * 0.15));
  const conversionRate = inquiries > 0 ? (Math.random() * 0.3) : 0;
  const revenue = Math.floor(listing.price * conversionRate * (0.5 + Math.random() * 0.5));

  return {
    listingId: listing.id,
    title: listing.title,
    views: Math.max(0, views),
    inquiries: Math.max(0, inquiries),
    conversionRate: Math.min(100, conversionRate * 100),
    revenue: Math.max(0, revenue),
    price: listing.price,
  };
}

// Promotion pricing
export const PROMOTION_PRICING: Record<PromotionTier, { name: string; price: number; period: "week" | "month"; benefits: string[] }> = {
  none: {
    name: "Standardna objava",
    price: 0,
    period: "month",
    benefits: ["Vidljivost u kategoriji"],
  },
  spotlight: {
    name: "Spotlight",
    price: 10,
    period: "week",
    benefits: ["Top pozicija u pretrazi", "Istaknuta oznaka", "25% više pregleda (prosječno)"],
  },
  featured: {
    name: "Featured",
    price: 15,
    period: "week",
    benefits: ["Vidljiv na homepage", "Featured oznaka", "35% više pregleda (prosječno)"],
  },
  premium: {
    name: "Premium",
    price: 20,
    period: "week",
    benefits: ["Gola pozicija na homepage", "Premium oznaka", "Prioritetna podrška", "50% više pregleda"],
  },
  vip: {
    name: "VIP",
    price: 35,
    period: "week",
    benefits: ["Homepage hero section", "VIP oznaka", "Priority customer support", "75% više pregleda", "Featured social media"],
  },
};

export type NotificationPreferences = {
  userId: string;
  newListingsInSavedSearches: boolean;
  priceDropAlerts: boolean;
  messageReminders: boolean;
  weeklyDigest: boolean;
  emailFrequency: "instant" | "daily" | "weekly";
  savedSearches: Array<{ id: string; category?: string; subcategory?: string; query?: string; maxPrice?: number }>;
};

export function getPromotedListings(limit?: number): Listing[] {
  const now = new Date();
  const promoted = LISTINGS.filter((l) => {
    if (!l.promotionTier || l.promotionTier === "none") return false;
    if (!l.promotionExpiresAt) return false;
    return new Date(l.promotionExpiresAt) > now;
  });

  // Sort by promotion tier (vip > premium > featured > spotlight)
  const tierOrder = { vip: 0, premium: 1, featured: 2, spotlight: 3 };
  promoted.sort((a, b) => {
    const aOrder = tierOrder[a.promotionTier as "vip" | "premium" | "featured" | "spotlight"] ?? 99;
    const bOrder = tierOrder[b.promotionTier as "vip" | "premium" | "featured" | "spotlight"] ?? 99;
    return aOrder - bOrder;
  });

  return limit ? promoted.slice(0, limit) : promoted;
}

export function getSellerReviews(sellerId: string): Review[] {
  return REVIEWS.filter((r) => r.sellerId === sellerId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getReviewStats(sellerId: string) {
  const reviews = getSellerReviews(sellerId);
  if (reviews.length === 0) {
    return {
      count: 0,
      average: 0,
      verified: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const verified = reviews.filter((r) => r.verified).length;
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  reviews.forEach((r) => {
    sum += r.rating;
    distribution[Math.ceil(r.rating) as 1 | 2 | 3 | 4 | 5]++;
  });

  return {
    count: reviews.length,
    average: sum / reviews.length,
    verified,
    distribution,
  };
}

export function getSellerAnalytics(sellerId: string): SellerAnalytics {
  const sellerListings = listingsBySeller(sellerId);
  const analyticsPerListing = sellerListings.map((l) => generateAnalyticsForListing(l, sellerId));

  const totalViews = analyticsPerListing.reduce((sum, a) => sum + a.views, 0);
  const totalInquiries = analyticsPerListing.reduce((sum, a) => sum + a.inquiries, 0);
  const totalRevenue = analyticsPerListing.reduce((sum, a) => sum + a.revenue, 0);
  const avgConversionRate = analyticsPerListing.length > 0
    ? analyticsPerListing.reduce((sum, a) => sum + a.conversionRate, 0) / analyticsPerListing.length
    : 0;

  // Generate month revenue data (last 12 months)
  const revenueByMonth = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = new Intl.DateTimeFormat("hr-HR", { month: "short", year: "2-digit" }).format(date);
    const monthRevenue = totalRevenue * (0.3 + Math.random() * 0.7) * Math.max(0.2, 1 - i * 0.05);
    revenueByMonth.push({
      month: monthLabel,
      revenue: Math.floor(monthRevenue),
    });
  }

  // This month earnings = last month in trend
  const thisMonthRevenue = revenueByMonth[revenueByMonth.length - 1]?.revenue ?? 0;

  // Generate views trend (last 30 days)
  const viewsTrend = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayLabel = new Intl.DateTimeFormat("hr-HR", { month: "short", day: "numeric" }).format(date);
    const dayViews = Math.floor((totalViews / 30) * (0.5 + Math.random() * 1.5));
    viewsTrend.push({
      day: dayLabel,
      views: dayViews,
    });
  }

  // Top products (sorted by views)
  const topProducts = analyticsPerListing
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return {
    sellerId,
    totalEarningsMonth: thisMonthRevenue,
    totalEarningsYear: totalRevenue,
    activeListings: sellerListings.length,
    totalViews,
    totalInquiries,
    conversionRate: avgConversionRate,
    topProducts,
    revenueByMonth,
    viewsTrend,
  };
}
