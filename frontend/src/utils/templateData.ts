export interface TemplateActivity {
  id: string;
  name: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  activities: TemplateActivity[];
}

export const OFFICIAL_TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: "VISITING",
    name: "ጉብኝት (Visiting)",
    activities: [
      { id: "VIS_1", name: "አዳዲስ የኃይስኩል ሕብረቶችን ማደራጀት" },
      { id: "VIS_2", name: "ቀድመው የተደራጁ ነገር ግን በኤስ.ዩ ያልተያዙ ሕብረቶች በኤስ.ዩ አገልግሎት እንዲታቀፉ ማድረግ" },
      { id: "VIS_3", name: "ቅርንጫፍ ቢሮ በሚገኝበት ከተማ ውስጥ የሚገኙ የኃይስኩል ፌሎሽፖችን ማጎብኘት" },
      { id: "VIS_4", name: "በክልሉ በሚገኙ ከተሞች ውስጥ የሚገኙ የኃይስኩል ሕብረቶችን ሄዶ መጎብኘት" }
    ]
  },
  {
    id: "CORE_TEACHING",
    name: "የትምህርትና ሥልጠና (የኃይስኩል ፌሎሽፕ መሰረታዊ ትምህርቶች - SU Core Teachings)",
    activities: [
      { id: "CORE_1", name: "ትምህርት 1" },
      { id: "CORE_2", name: "ትምህርት 2" },
      { id: "CORE_3", name: "ትምህርት 3" },
      { id: "CORE_4", name: "ትምህርት 4" },
      { id: "CORE_5", name: "ትምህርት 5" },
      { id: "CORE_6", name: "ትምህርት 6" }
    ]
  },
  {
    id: "DISCIPLESHIP",
    name: "የደቀመዝሙር (Character formation) ትምህርቶች/ ስልጠናዎች",
    activities: [
      { id: "DISC_1", name: "ትምህርት 1" },
      { id: "DISC_2", name: "ትምህርት 2" },
      { id: "DISC_3", name: "ትምህርት 3" },
      { id: "DISC_4", name: "ትምህርት 4" },
      { id: "DISC_5", name: "ትምህርት 5" }
    ]
  },
  {
    id: "MISSION_TEACHING",
    name: "ወንጌል ተልዕኮ ተኮር ስልጠናዎች/ትምህርቶች",
    activities: [
      { id: "MISS_T_1", name: "ትምህርት 1" },
      { id: "MISS_T_2", name: "ትምህርት 2" },
      { id: "MISS_T_3", name: "ትምህርት 3" },
      { id: "MISS_T_4", name: "ትምህርት 4" },
      { id: "MISS_T_5", name: "ትምህርት 5" },
      { id: "MISS_T_6", name: "ትምህርት 6" }
    ]
  },
  {
    id: "MISSION",
    name: "የወንጌል ተልዕኮ (Mission)",
    activities: [
      { id: "MISS_1", name: "በሴሚስተር ዕረፍት የሚካሄድ የወንጌል ተልዕኮ (Break-Mission)" },
      { id: "MISS_2", name: "በትምህርት ማጠናቀቂያ የሚካሄድ የወንጌል ተልዕኮ (Summer Mission)" },
      { id: "MISS_3", name: "አጫጭር የወንጌል የምስክርነት ፕሮግራሞች (Mini-missions)" },
      { id: "MISS_4", name: "መሠረታዊ የክርስትና ት/ት ማስተማር" }
    ]
  },
  {
    id: "LEADERSHIP",
    name: "ከመሪነት ጋር የተገኛኙ ስልጠናዎች (Biblical Leadership Training)",
    activities: [
      { id: "LEAD_1", name: "ስልጠና 1" },
      { id: "LEAD_2", name: "ስልጠና 2" },
      { id: "LEAD_3", name: "ስልጠና 3" },
      { id: "LEAD_4", name: "ስልጠና 4" },
      { id: "LEAD_5", name: "ስልጠና 5" },
      { id: "LEAD_6", name: "ስልጠና 6" },
      { id: "LEAD_7", name: "ስልጠና 7" },
      { id: "LEAD_8", name: "ስልጠና 8" }
    ]
  },
  {
    id: "PARTNERSHIP",
    name: "አጋርነት ተግባራት (Partnership Dev’t)",
    activities: [
      { id: "PART_1", name: "ከአጥቢያ ቤ/ክ ጋር የሚካሄድ ፕሮግራም" },
      { id: "PART_2", name: "ከተማሪ ወላጆች ጋር የሚካሄድ ፕሮግራም" },
      { id: "PART_3", name: "ከአብያተክርስቲያናት ሕብረት ጋር የሚካሄድ ፕሮግራም" },
      { id: "PART_4", name: "ከአጋር መንፈሳዊ ተቋማት ጋር የሚካሄድ ፕሮግራም" },
      { id: "PART_5", name: "በከተማው ከሚገኙ ማሕበራዊ ተቋማት ጋር የሚካሄድ ፕሮግራም" }
    ]
  },
  {
    id: "RESOURCE_MOB",
    name: "ሐብት የማሰባሰብ ተግባር (Resource Mobilization)",
    activities: [
      { id: "MOB_1", name: "የጽሕፈት መሣሪያና የቢሮ መገልገያ እቃዎች" },
      { id: "MOB_2", name: "በክልል/ቅርንጫፍ ቢሮ ለሚካሄድ የስታፍ ስልጠና" },
      { id: "MOB_3", name: "በአካባቢው ለሚካሄድ የተማሪ መሪዎች የስልጠና" },
      { id: "MOB_4", name: "በአካባቢው የሚገኙ ሕብረቶችን የጉብኝትፕሮግራም" },
      { id: "MOB_5", name: "ለስልጠና አጋዥ የሆኑ ግብዓቶችን ማሟላት" },
      { id: "MOB_6", name: "በቋሚነት አገልግሎቱን የሚደግፉ አጥቢያ ቤ/ክ ማፈላለግ" },
      { id: "MOB_7", name: "አገልግሎቱን በቋሚነት የሚደግፉ አጋር ተቋማት ማፈላለግ" },
      { id: "MOB_8", name: "አገልግሎቱን በቋሚነት የሚደግፉ አጋር ግለሰቦችን ማፈላለግ" }
    ]
  },
  {
    id: "OFFICE_ORG",
    name: "አካባቢያዊ/ቅርንጫፍ ቢሮ የማደራጀት ተግባር",
    activities: [
      { id: "ORG_1", name: "የሙሉ ጊዜ የተማሪ አገልጋዮችን መመልመል" },
      { id: "ORG_2", name: "ለቢሮ አገልግሎት የሚውሉ ጠረጴዛ፣ ወንበር፣ መደርደሪያ የመሳሰሉ እቃዎች" },
      { id: "ORG_3", name: "ለቢሮ አገልግሎት የሚውሉ የጽሕፈት መሣሪያዎች" },
      { id: "ORG_4", name: "ለቢሮ አገልግሎት የሚውሉ እቃዎች (ኮምፒውተር፣ ፕሪንተር፣ ፎቶ ኮፒ ማሽን፣ የድምጽ መሣሪያዎች...)" },
      { id: "ORG_5", name: "ለስልጠና አጋዥ የሆኑ መሣሪያዎች (የመመገቢያ እቃዎች፣ ፍራሽና አንሶላ...)" },
      { id: "ORG_6", name: "ለአገልጋይ መንቀሳቀሻ የሚያገለግሉ መጓጓዣ (ሣይክል፣ ሞተር ሣይክል፣ መኪና...)" }
    ]
  },
  {
    id: "CONFERENCE",
    name: "መንፈሳዊ ጉባኤያት (Conference)",
    activities: [
      { id: "CONF_1", name: "የወንጌል ተልዕኮ ተኮር ጉባኤ" },
      { id: "CONF_2", name: "ደቀመዝሙር ተኮር ጉባኤ" },
      { id: "CONF_3", name: "መሪነት ላይ ያተኮረ ጉባኤ" },
      { id: "CONF_4", name: "በተመረጡ አርዕስተ ጉዳዮች ላይ ያተኮረ ጉባኤ" }
    ]
  },
  {
    id: "CAPACITY",
    name: "ክልላዊ/አካባቢያዊ አቅም ግንባታ ፕሮግራም",
    activities: [
      { id: "CAP_1", name: "አካባቢያዊ የተማሪ መሪዎች ስልጠና (A-HLS)" },
      { id: "CAP_2", name: "ክልላዊ የተማሪ መሪዎች ስልጠና (R-HLS)" },
      { id: "CAP_3", name: "ከአጥቢያ ቤ/ክ ጋር የሚካሄድ ክልላዊ ስልጠና" },
      { id: "CAP_4", name: "ከተማሪ ወላጆች ጋር የሚካሁድ ክልላዊ ስልጠና" },
      { id: "CAP_5", name: "ከአጥቢያ ቤ/ክ ጋር የሚካሄድ አካባቢያዊ ስልጠና" },
      { id: "CAP_6", name: "ከተማሪ ወላጆች ጋር የሚካሁድ አካባቢያዊ ስልጠና" }
    ]
  },
  {
    id: "SEMINARS",
    name: "በሴሚስተር / የክረምት እረፍት የሚዘጋጅ ሴሚናር (Seminars)",
    activities: [
      { id: "SEM_1", name: "ILI" },
      { id: "SEM_2", name: "TNT" },
      { id: "SEM_3", name: "Worldview" },
      { id: "SEM_4", name: "BSM (Bible Study Method)" },
      { id: "SEM_5", name: "Manuscript" },
      { id: "SEM_6", name: "Mission Seminars" }
    ]
  },
  {
    id: "VOLUNTEERS",
    name: "የኤስ ዩ በጎ ፈቃደኞች አገልጋዮች (SU Ministry associates)",
    activities: [
      { id: "VOL_1", name: "በጎ ፈቃደኛ የኃይስኩል ተማሪዎች አገልጋዮችን መመልመልና ማሰልጠን" },
      { id: "VOL_2", name: "በጎ ፈቃደኛ የኃይስኩል ተማሪዎች አገልጋዮችን ለአገልግሎት ማሰማራት" }
    ]
  },
  {
    id: "REPORTING",
    name: "ሪፖርትና መረጃ ማዘጋጀትና መላክ",
    activities: [
      { id: "REP_1", name: "ወርሃዊ የሥራ እንቅስቃሴ ሪፖርት ማዘጋጀት" },
      { id: "REP_2", name: "የሕብረቶችን ዋና መሪዎች መረጃ ማጠናቀር" },
      { id: "REP_3", name: "በክልሉ የሚገኙ የኃይስኩል ሕብረቶችን አጠቃላይ ብዛት ማጠናቀር" }
    ]
  },
  {
    id: "STAFF_DEV",
    name: "አገልጋዩ የግል ሕይወት ግንባታ እቅድ (SU Staff Self-development)",
    activities: [
      { id: "DEV_1", name: "የግል እቅድ 1" },
      { id: "DEV_2", name: "የግል እቅድ 2" },
      { id: "DEV_3", name: "የግል እቅድ 3" },
      { id: "DEV_4", name: "የግል እቅድ 4" },
      { id: "DEV_5", name: "የግል እቅድ 5" },
      { id: "DEV_6", name: "የግል እቅድ 6" },
      { id: "DEV_7", name: "የግል እቅድ 7" },
      { id: "DEV_8", name: "የግል እቅድ 8" }
    ]
  }
];

export const ETHIOPIAN_MONTHS = [
  { id: 'targetMeskerem', name: 'መስከረም (Meskerem)', short: 'መስ' },
  { id: 'targetTikimt', name: 'ጥቅምት (Tikimt)', short: 'ጥቅ' },
  { id: 'targetHidar', name: 'ህዳር (Hidar)', short: 'ህዳ' },
  { id: 'targetTahsas', name: 'ታህሳስ (Tahsas)', short: 'ታህ' },
  { id: 'targetTir', name: 'ጥር (Tir)', short: 'ጥር' },
  { id: 'targetYekatit', name: 'የካቲት (Yekatit)', short: 'የካ' },
  { id: 'targetMegabit', name: 'መጋቢት (Megabit)', short: 'መጋ' },
  { id: 'targetMiyazia', name: 'ሚያዝያ (Miyazia)', short: 'ሚያ' },
  { id: 'targetGinbot', name: 'ግንቦት (Genbot)', short: 'ግን' },
  { id: 'targetSene', name: 'ሰኔ (Sene)', short: 'ሰኔ' },
  { id: 'targetHamle', name: 'ሐምሌ (Hamle)', short: 'ሐም' },
  { id: 'targetNehase', name: 'ነሐሴ (Nehase)', short: 'ነሐ' }
];
