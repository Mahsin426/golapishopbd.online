import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/* seed.ts — utils.js-এর BRANCH_INFO ও AREA_LIST থেকে zone/area ডেটা বসানো হচ্ছে */
async function main() {
  await prisma.branch.upsert({
    where: { zone: 'noakhali_sadar' },
    update: {},
    create: {
      zone: 'noakhali_sadar',
      label: 'নোয়াখালী সদর',
      address: 'মাইজদী বাজার, সদর, নোয়াখালী',
      managerName: 'রিমন',
      managerPhone: '+8801627010060',
      bkashNumber: '01627010060',
      nagadNumber: '01627010060',
      lat: 22.8710,
      lng: 91.0996,
    },
  });

  await prisma.branch.upsert({
    where: { zone: 'begumganj' },
    update: {},
    create: {
      zone: 'begumganj',
      label: 'বেগমগঞ্জ',
      address: 'চৌরাস্তা, বেগমগঞ্জ, নোয়াখালী',
      managerName: 'সৃজন',
      managerPhone: '+8801310006959',
      bkashNumber: '01612057371',
      nagadNumber: '01310006959',
      lat: 22.9412,
      lng: 91.1119,
    },
  });

  const sadarAreas = ['চরমটুয়া','দাদপুর','নোয়ান্নই','কাদির হানিফ','বিনোদপুর','নোয়াখালী','ধর্মপুর','এওজবালিয়া','কালা দরাপ','অশ্বদিয়া','নেয়াজপুর','আন্ডারচর'];
  const begumganjAreas = ['আমান উল্যাপুর','গোপালপুর','জিরতলী','আলাইয়ারপুর','ছয়ানী','রাজগঞ্জ','একলাশপুর','বেগমগঞ্জ','মিরওয়ারিশপুর','নরোত্তমপুর','দূর্গাপুর','কুতুবপুর','রসুলপুর','হাজিপুর','শরীফপুর','কাদিরপুর'];

  for (const name of sadarAreas) {
    await prisma.area.upsert({
      where: { zone_name: { zone: 'noakhali_sadar', name } },
      update: {},
      create: { zone: 'noakhali_sadar', name },
    });
  }
  for (const name of begumganjAreas) {
    await prisma.area.upsert({
      where: { zone_name: { zone: 'begumganj', name } },
      update: {},
      create: { zone: 'begumganj', name },
    });
  }

  console.log('Seed সম্পন্ন: ২টা branch + সব area যোগ হয়েছে।');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
