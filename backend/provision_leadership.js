const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const LEADERS = [
  {
    name: "Berhanu Solomon G/Michael",
    nameAm: "ብርሃኑ ሰለሞን ገ/ሚካኤል",
    role: "EXECUTIVE",
    roleAm: "ብሔራዊ ዳይሬክተር",
    dept: "National Office",
    phone: "0960278345",
    level: "NATIONAL"
  },
  {
    name: "Rehobot Haile Tedla",
    nameAm: "ርሆቦት ሀይሌ ተድላ",
    role: "EXECUTIVE",
    roleAm: "አስተዳደር እና ፋይናንስ ሀላፊ",
    dept: "Finance & Admin",
    phone: "+251940512795",
    level: "NATIONAL"
  },
  {
    name: "Dr. Matewos Tirsitewold Werke",
    nameAm: "ዶ/ር ማቴዎስ ትርሲተወልድ ወርቄ",
    role: "EXECUTIVE",
    roleAm: "School Ministry Director",
    dept: "School Ministry",
    phone: "+251 94 311 1960",
    level: "NATIONAL"
  },
  {
    name: "Zerubabel Amsalu Desta",
    nameAm: "ዘሩባቤል አምሳሉ ደስታ",
    role: "EXECUTIVE",
    roleAm: "የአገልግሎት አጋርነት እና ሀብት ማፈላለግ ዳይሬክተር",
    dept: "Partnership",
    phone: "0920488642",
    level: "NATIONAL"
  },
  {
    name: "Natnael Zeleke Abisso",
    nameAm: "ናትናኤል ዘለቀ አቢሶ",
    role: "EXECUTIVE",
    roleAm: "የሚድያና ኮምኒኬሽን ዳይሬክተር",
    dept: "Media",
    phone: "0977717475",
    level: "NATIONAL"
  },
  {
    name: "Abel Fisseha Gebeyehu",
    nameAm: "አቤል ፍስሃ ገበየሁ",
    role: "EXECUTIVE",
    roleAm: "የስታፍ አቅም ግንባታ ዳይሬክተር",
    dept: "HR/Capacity",
    phone: "0921052571",
    level: "NATIONAL"
  },
  {
    name: "ESHETU DESSIE MEKONNEN",
    nameAm: "እሸቱ ደሴ መኮነን",
    role: "REGIONAL",
    roleAm: "አዲስ አበባ እና አካባቢዋ ክልላዊ ቢሮ አስተባባሪ",
    region: "Addis Ababa & Surroundings",
    phone: "0938227574"
  },
  {
    name: "Tsega Zerihun Lambebo",
    nameAm: "ፀጋ ዘሪሁን ላምቤቦ",
    role: "REGIONAL",
    roleAm: "የደቡብ ኢትዮጵያ ክልላዊ ቢሮ አስተባባሪ",
    region: "South Ethiopia Region",
    phone: "0916782438"
  },
  {
    name: "KALEB TESFAHUN GETA",
    nameAm: "ካሌብ ተስፋሁን ጌታ",
    role: "REGIONAL",
    roleAm: "የማዕከላዊ ኢትዮጵያ ክልላዊ ቢሮ አስተባባሪ",
    region: "Central Ethiopia Region",
    phone: "+251 91 628 1351"
  },
  {
    name: "Barkot Abebe Korebo",
    nameAm: "ባርኮት አበበ ኬሬቦ",
    role: "REGIONAL",
    roleAm: "የምስራቅ ክልላዊ ቢሮ አስተባባሪ",
    region: "East Region",
    phone: "0910913660"
  },
  {
    name: "IFNAAN WONDIMU MEKONIN",
    nameAm: "ኢፍናን ወንድሙ መኮንን",
    role: "REGIONAL",
    roleAm: "የምዕራብ ክልላዊ ቢሮ አስተባባሪ",
    region: "West Region",
    phone: "0912604213"
  },
  {
    name: "Yisakor Teklu Betire",
    nameAm: "ይሳኮር ተክሉ በትሬ",
    role: "REGIONAL",
    roleAm: "የደቡብ ምዕራብ ክልላዊ ቢሮ አስተባባሪ",
    region: "South West Region",
    phone: "0967794515"
  },
  {
    name: "Helda Ababu Gebreeyesus",
    nameAm: "ሔልዳ አባቡ ገብረ እየሱስ",
    role: "REGIONAL",
    roleAm: "የሰሜን ምስራቅ ክልላዊ ቢሮ አስተባባሪ",
    region: "North East Region",
    phone: "0975005626"
  },
  {
    name: "Wegayehu Wolde Mekonnen",
    nameAm: "ወጋየሁ ወልዴ መኮንን",
    role: "REGIONAL",
    roleAm: "የደቡብ ምስራቅ ክልላዊ ቢሮ አስተባባሪ",
    region: "South East Region",
    phone: "0922646952"
  },
  {
    name: "Eyosiyas Fekadu Yimer",
    nameAm: "እዮሲያስ ፍቃዱ ይመር",
    role: "REGIONAL",
    roleAm: "የሰሜን ምዕራብ ክልላዊ ቢሮ አስተባባሪ",
    region: "North West Region",
    phone: "0913925174"
  },
  {
    name: "Mickyas Biele",
    nameAm: "ሚክያስ በኧለ",
    role: "REGIONAL",
    roleAm: "የሰሜን ክልላዊ ቢሮ አስተባባሪ",
    region: "North Region",
    phone: "+251 97 713 8586"
  },
  {
    name: "Samuel Endashaw",
    nameAm: "ሳሙኤል እንዳሻው",
    role: "EXECUTIVE",
    roleAm: "Evangelism Mobilizer",
    dept: "School Ministry",
    phone: "+251 93 972 4415",
    level: "NATIONAL"
  },
  {
    name: "Deborah Samson Meried",
    nameAm: "ዲቦራ ሳምሶን መርዕድ",
    role: "SUB_REGIONAL",
    roleAm: "Addis Ababa Sub-Region 1 Coordinator",
    region: "Addis Ababa & Surroundings",
    subRegion: "SR 1 (North/Central/NE AA)",
    phone: "0922842085"
  },
  {
    name: "Redeate Haylegebreal Fulas",
    nameAm: "ረድኤት ኃይለገብርኤል ፉላስ",
    role: "SUB_REGIONAL",
    roleAm: "Addis Ababa Sub-Region 2 Coordinator",
    region: "Addis Ababa & Surroundings",
    subRegion: "SR 2 (South/SW/West AA)",
    phone: "0924434892"
  },
  {
    name: "Tesfayehu Angama Angamssa",
    nameAm: "ተስፋየሁ አንጋማ አንጋምሣ",
    role: "SUB_REGIONAL",
    roleAm: "South Ethiopia Sub-Region 2 Coordinator",
    region: "South Ethiopia Region",
    subRegion: "SR 2 (Gamo/Gofa/Konso/Burji)",
    phone: "+251 95 545 1060"
  }
];

async function provision() {
  console.log('--- Leadership Provisioning Starting ---');
  const salt = await bcrypt.genSalt(10);
  const defaultPassword = 'SUE@Leader2025';
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  for (const leader of LEADERS) {
    console.log(`Provisioning: ${leader.name}`);
    
    // Generate email
    const email = leader.name.toLowerCase().replace(/[^a-z]/g, '.') + '@suethiopia.org';
    
    let regionId = null;
    let subRegionId = null;

    if (leader.region) {
      const regObj = await prisma.region.findUnique({ where: { name: leader.region } });
      if (regObj) {
        regionId = regObj.id;
        if (leader.subRegion) {
          const subRegObj = await prisma.subRegion.findFirst({
            where: { name: leader.subRegion, regionId: regObj.id }
          });
          if (subRegObj) subRegionId = subRegObj.id;
        }
      }
    }

    await prisma.user.upsert({
      where: { email },
      update: {
        full_name: leader.name,
        fullNameAmharic: leader.nameAm,
        role: leader.role,
        roleAmharic: leader.roleAm,
        phone: leader.phone,
        department: leader.dept,
        regionId,
        subRegionId,
        isActive: true
      },
      create: {
        email,
        full_name: leader.name,
        fullNameAmharic: leader.nameAm,
        passwordHash,
        role: leader.role,
        roleAmharic: leader.roleAm,
        phone: leader.phone,
        department: leader.dept,
        regionId,
        subRegionId,
        isActive: true,
        mustChangePassword: true
      }
    });
  }

  console.log(`--- Provisioning Complete ---`);
  console.log(`Default Password for all: ${defaultPassword}`);
}

provision()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
