const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const GEOGRAPHY_DATA = [
  {
    name: "Addis Ababa & Surroundings",
    subRegions: [
      { name: "SR 1 (North/Central/NE AA)", areas: ["North AA", "Central AA", "North East AA"] },
      { name: "SR 2 (South/SW/West AA)", areas: ["South AA", "South West AA", "West AA"] },
      { name: "SR 3 (West/SW Shoa)", areas: ["Ambo", "Bako", "Holeta", "Tulu Bolo", "Waliso"] },
      { name: "SR 4 (East Shoa/Arsi)", areas: ["Adama (Nazret)", "Asella", "Bishoftu (Debre Zeyit)", "Bokoji", "Dukam", "Etaya", "Metehara", "Mojo", "Robe"] },
      { name: "SR 5 (North Shoa)", areas: ["Alem Ketema", "Ankober", "Debre Berhan", "Fiche", "Gerba Guracha", "Sheno", "Shewa Robit"] }
    ]
  },
  {
    name: "Central Ethiopia Region",
    subRegions: [
      { name: "SR 1 (Hadiya/Kembata/Halaba)", areas: ["Durame", "Halaba Kulito", "Hossana", "Mudula", "Shone"] },
      { name: "SR 2 (Gurage/Silte)", areas: ["Butajira", "Koshe", "Welkite", "Worabe"] }
    ]
  },
  {
    name: "East Region",
    subRegions: [
      { name: "SR 1 (Western Corridor)", areas: ["Bedessa", "Chiro (Asebe Teferi)", "Gelemso", "Hirna", "Mieso"] },
      { name: "SR 2 (Central Hub)", areas: ["Aweday", "Babille", "Dire Dawa", "Haramaya", "Harar"] },
      { name: "SR 3 (Eastern/Somali)", areas: ["Aware", "Degehabur", "Jijiga", "Wajale"] }
    ]
  },
  {
    name: "North Region",
    subRegions: [
      { name: "SR 1 (South/East Hub)", areas: ["Alamata", "Korem", "Maychew", "Mekelle", "Wukro"] },
      { name: "SR 2 (North/Central Route)", areas: ["Adigrat", "Adwa", "Axum", "Shire"] },
      { name: "SR 3 (Western Expanse)", areas: ["Dansha", "Humera"] }
    ]
  },
  {
    name: "North West Region",
    subRegions: [
      { name: "SR 1 (Gojjam Corridor)", areas: ["Bichena", "Dangla", "Debre Markos", "Dejen", "Finote Selam", "Motta"] },
      { name: "SR 2 (Tana/Western Hub)", areas: ["Addis Zemen", "Bahir Dar", "Chagni", "Debre Tabor", "Gilgel Beles", "Injibara", "Woreta"] },
      { name: "SR 3 (Greater Gondar)", areas: ["Aykel (Chilga)", "Debark", "Gondar", "Metema"] }
    ]
  },
  {
    name: "North East Region",
    subRegions: [
      { name: "SR 1 (South Welo/Oromia Zone)", areas: ["Bati", "Dessie", "Haik", "Kemise", "Kombolcha"] },
      { name: "SR 2 (North Welo Corridor)", areas: ["Kobo", "Lalibela", "Mersa", "Woldiya"] },
      { name: "SR 3 (Afar Expanse)", areas: ["Asayita", "Awash", "Chifra", "Logia", "Mille", "Semera"] }
    ]
  },
  {
    name: "West Region",
    subRegions: [
      { name: "SR 1 (Eastern Gateway/Hlands)", areas: ["Fincha", "Nekemte", "Shambu", "Sire"] },
      { name: "SR 2 (Deep West/Kelam/Assosa)", areas: ["Dambi Dollo", "Gimbi", "Mendi", "Nejo", "Assosa", "Bambasi", "Kamashi"] }
    ]
  },
  {
    name: "South West Region",
    subRegions: [
      { name: "SR 1 (Jimma/Ilu/Gambella)", areas: ["Agaro", "Bedele", "Gambella", "Gore", "Jimma", "Mettu"] },
      { name: "SR 2 (Highlands/West Omo)", areas: ["Ameya (Konta)", "Bonga", "Wacha", "Maji (West Omo)", "Masha", "Mizan Aman", "Tepi"] }
    ]
  },
  {
    name: "South Ethiopia Region",
    subRegions: [
      { name: "SR 1 (Wolaita/Dawro Nexus)", areas: ["Areka", "Boditi", "Laska (Basketo)", "Tercha (Dawro)", "Wolaita Sodo"] },
      { name: "SR 2 (Gamo/Gofa/Konso/Burji)", areas: ["Arba Minch", "Bulki", "Chencha", "Karat (Konso)", "Sawla", "Soyama (Burji)"] },
      { name: "SR 3 (South Omo/Specials)", areas: ["Gidole (Gardula)", "Jinka (South Omo)", "Kele (Koore)", "Kolango (Ale)"] }
    ]
  },
  {
    name: "South East Region",
    subRegions: [
      { name: "SR 1 (Sidama/Gedeo)", areas: ["Aleta Wendo", "Dilla", "Hawassa", "Yirgalem"] },
      { name: "SR 2 (West Arsi/Bale)", areas: ["Dodola", "Goba", "Kofele", "Robe (Bale)", "Shashemene"] },
      { name: "SR 3 (Borena/Guji Lowlands)", areas: ["Bule Hora", "Moyale", "Negele", "Shakiso", "Yabelo"] }
    ]
  }
];

async function seed() {
  console.log('--- Establishing Geographic Source of Truth ---');
  
  // Get an admin user ID for 'proposedById' requirement
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    console.error('CRITICAL: No Admin user found. Run seed_all.js first.');
    process.exit(1);
  }

  for (const regionData of GEOGRAPHY_DATA) {
    console.log(`Region: ${regionData.name}`);
    const region = await prisma.region.upsert({
      where: { name: regionData.name },
      update: {},
      create: { name: regionData.name }
    });
    
    for (const subReg of regionData.subRegions) {
      console.log(`  SubRegion: ${subReg.name}`);
      const subRegion = await prisma.subRegion.create({
        data: {
          name: subReg.name,
          regionId: region.id
        }
      });
      
      for (const areaName of subReg.areas) {
        console.log(`    Area: ${areaName}`);
        await prisma.area.create({
          data: {
            name: areaName,
            subRegionId: subRegion.id,
            proposedById: admin.id,
            status: 'APPROVED'
          }
        });
      }
    }
  }
  console.log('--- Geography Seeding Complete ---');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
