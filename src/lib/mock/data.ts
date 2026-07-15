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
    slug: "nekretnine",
    name: "Nekretnine",
    tagline: "Stanovi, kuće, poslovni prostori i zemljišta",
    image: heroImg,
    listingFee: 14.99,
    premiumFee: 29.99,
    subcategories: [
      { slug: "prodaja-stanova", name: "Prodaja stanova" },
      { slug: "najam-stanova", name: "Najam stanova" },
      { slug: "kuce-vile", name: "Kuće i vile" },
      { slug: "poslovni-prostori", name: "Poslovni prostori" },
      { slug: "ostalo", name: "Ostalo", icon: "Tag", description: "Zemljišta, sobe i ostale nekretnine koje ne pripadaju gornjim podkategorijama." },
    ],
  },
  {
    slug: "vozila",
    name: "Vozila",
    tagline: "Automobili, motocikli, kamioni, plovila i dijelovi",
    image: listing3,
    listingFee: 6.99,
    premiumFee: 11.99,
    subcategories: [
      { slug: "osobni-automobili", name: "Osobni automobili" },
      { slug: "motocikli-skuteri", name: "Motocikli i skuteri" },
      { slug: "kombi-kamioni", name: "Kombi i kamioni" },
      { slug: "plovila", name: "Plovila i čamci" },
      { slug: "ostalo", name: "Ostalo", icon: "Tag", description: "Kamp prikolice, dijelovi, oprema i ostala vozila." },
    ],
  },
  {
    slug: "mobiteli-tableti",
    name: "Mobiteli i tableti",
    tagline: "Pametni telefoni, tableti i nosivi uređaji",
    image: listing2,
    listingFee: 6.99,
    premiumFee: 11.99,
    subcategories: [
      { slug: "pametni-telefoni", name: "Pametni telefoni" },
      { slug: "tableti", name: "Tableti" },
      { slug: "pametni-satovi", name: "Pametni satovi" },
      { slug: "dodaci-mobiteli", name: "Dodaci i oprema" },
      { slug: "ostalo", name: "Ostalo", icon: "Tag", description: "Ostali mobilni uređaji i nosiva tehnologija." },
    ],
  },
  {
    slug: "informatika",
    name: "Informatika",
    tagline: "Računala, gaming i mrežna oprema",
    image: listing4,
    listingFee: 6.99,
    premiumFee: 11.99,
    subcategories: [
      { slug: "prijenosna-racunala", name: "Prijenosna računala" },
      { slug: "stolna-racunala", name: "Stolna računala" },
      { slug: "gaming", name: "Gaming" },
      { slug: "mrezna-oprema", name: "Mrežna oprema" },
      { slug: "ostalo", name: "Ostalo", icon: "Tag", description: "Komponente, periferija i ostala informatička oprema." },
    ],
  },
  {
    slug: "tv-audio-foto",
    name: "TV, audio i foto",
    tagline: "Televizori, audio sustavi, fotoaparati i dronovi",
    image: listing1,
    listingFee: 6.99,
    premiumFee: 11.99,
    subcategories: [
      { slug: "televizori", name: "Televizori" },
      { slug: "audio-zvucnici", name: "Audio i zvučnici" },
      { slug: "fotoaparati", name: "Fotoaparati i objektivi" },
      { slug: "dronovi-kamere", name: "Dronovi i akcijske kamere" },
      { slug: "ostalo", name: "Ostalo", icon: "Tag", description: "Ostala TV, audio i foto oprema." },
    ],
  },
  {
    slug: "dom-namjestaj",
    name: "Dom i namještaj",
    tagline: "Namještaj, kućanski aparati i uređenje doma",
    image: listing1,
    listingFee: 6.99,
    premiumFee: 11.99,
    subcategories: [
      { slug: "namjestaj", name: "Namještaj" },
      { slug: "veliki-aparati", name: "Veliki kućanski aparati" },
      { slug: "mali-aparati", name: "Mali kućanski aparati" },
      { slug: "uredjenje-doma", name: "Uređenje doma" },
      { slug: "ostalo", name: "Ostalo", icon: "Tag", description: "Kuhinja, pribor i ostalo za dom." },
    ],
  },
  {
    slug: "sport-rekreacija",
    name: "Sport i rekreacija",
    tagline: "Bicikli, fitness, zima, lov i ribolov",
    image: listing3,
    listingFee: 6.99,
    premiumFee: 11.99,
    subcategories: [
      { slug: "bicikli", name: "Bicikli i e-bicikli" },
      { slug: "fitness-oprema", name: "Fitness oprema" },
      { slug: "skijanje-zima", name: "Skijanje i zimski sportovi" },
      { slug: "lov-ribolov", name: "Lov i ribolov" },
      { slug: "ostalo", name: "Ostalo", icon: "Tag", description: "Kamp, outdoor i ostala sportska oprema." },
    ],
  },
  {
    slug: "vrt-alat-strojevi",
    name: "Vrt, alat i strojevi",
    tagline: "Vrtna oprema, alat, strojevi i traktori",
    image: heroImg,
    listingFee: 6.99,
    premiumFee: 11.99,
    subcategories: [
      { slug: "vrtna-oprema", name: "Vrtna oprema" },
      { slug: "elektricni-alat", name: "Električni alat" },
      { slug: "strojevi-traktori", name: "Strojevi i traktori" },
      { slug: "bazeni-sauna", name: "Bazeni i sauna" },
      { slug: "ostalo", name: "Ostalo", icon: "Tag", description: "Ostali alati, strojevi i vrtna oprema." },
    ],
  },
  {
    slug: "djeca-ljubimci",
    name: "Dječji svijet i ljubimci",
    tagline: "Oprema za bebe, igračke, dječja odjeća i ljubimci",
    image: listing4,
    listingFee: 6.99,
    premiumFee: 11.99,
    subcategories: [
      { slug: "oprema-za-bebe", name: "Oprema za bebe" },
      { slug: "djecja-odjeca", name: "Dječja odjeća" },
      { slug: "igracke", name: "Igračke" },
      { slug: "kucni-ljubimci", name: "Kućni ljubimci" },
      { slug: "ostalo", name: "Ostalo", icon: "Tag", description: "Ostalo za djecu i ljubimce." },
    ],
  },
  {
    slug: "smjestaj",
    name: "Smještaj",
    tagline: "Apartmani, kuće za odmor i luksuzni smještaji uz Jadran",
    image: heroImg,
    listingFee: 6.99,
    premiumFee: 11.99,
    subcategories: [
      { slug: "luksuzni-apartmani", name: "Luksuzni apartmani", icon: "Sparkles", description: "Pažljivo odabrani apartmani vrhunske opremljenosti s privatnim sadržajima i premium uslugom." },
      { slug: "vile-s-bazenom", name: "Vile s bazenom", icon: "Droplets", description: "Privatne vile s vlastitim bazenom, terasom i potpunom privatnošću za bezbrižan odmor." },
      { slug: "boutique-hoteli", name: "Boutique hoteli", icon: "Crown", description: "Mali hoteli karaktera s personaliziranom uslugom, dizajnerskim interijerima i pažljivom selekcijom soba." },
      { slug: "glamping", name: "Glamping", icon: "Tent", description: "Luksuzni kamping u prirodi — safari šatori, kupole i drvene kućice s vrhunskom opremom." },
      { slug: "ostalo", name: "Ostalo", icon: "Tag", description: "Apartmani s pogledom, kamene kuće, resorti, penthouse i ostali smještaji." },
    ],
  },
  {
    slug: "poslovi-usluge",
    name: "Poslovi i usluge",
    tagline: "Oglasi za posao, obrtničke i profesionalne usluge",
    image: listing1,
    listingFee: 0,
    premiumFee: 0,
    specialModel: "services-contact",
    contactFee: 5.00,
    subcategories: [
      { slug: "ponuda-posla", name: "Ponuda posla", icon: "Briefcase", description: "Oglasi poslodavaca — stalni posao, sezonski rad i ugovori o djelu." },
      { slug: "potraznja-posla", name: "Potražnja posla", icon: "UserSearch", description: "Kandidati koji traže posao — životopisi i otvorene ponude." },
      { slug: "obrtnicke-usluge", name: "Obrtničke usluge", icon: "Hammer", description: "Majstori, građevinari, vodoinstalateri, električari i ostali obrti." },
      { slug: "it-dizajn", name: "IT i dizajn", icon: "Code2", description: "Razvoj weba, mobilnih aplikacija, grafički dizajn i digitalni marketing." },
      { slug: "ostalo", name: "Ostalo", icon: "Tag", description: "Prijevoz, selidbe, edukacija, čišćenje, ugostiteljstvo i ostale usluge." },
    ],
  },
];

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
};

const FIRST_NAMES = ["Ana", "Luka", "Ivana", "Marko", "Petra", "Filip", "Maja", "Tomislav", "Nina", "Andrej", "Dora", "Vedran", "Sara", "Karlo", "Mia"];
const LAST_NAMES = ["Marić", "Horvat", "Kovač", "Babić", "Šimić", "Novak", "Vuković", "Knežević", "Pavlović", "Tomić", "Jurić", "Matić", "Perić", "Lovrić", "Filipović"];
const CITIES = ["Zagreb", "Split", "Rijeka", "Dubrovnik", "Pula", "Zadar", "Osijek", "Varaždin", "Šibenik", "Karlovac"];

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
        });
        counter++;
      }
    }
  }
  return all;
}

export const LISTINGS: Listing[] = seedListings();

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