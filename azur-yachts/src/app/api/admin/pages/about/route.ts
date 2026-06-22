import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    let page = await prisma.page.findUnique({ where: { slug: 'about' } });
    
    // Default content if page doesn't exist yet
    let contentObj = {
      yearsOfExcellence: 4,
      foundationYear: 2022,
      foundationLocation: "La Ciotat",
      satisfiedClients: "12K+",
      satisfactionRate: "98%",
      yachtsCount: "340+",
      destinationsCount: "68",
      verifiedAdvertisers: "100%",
      averageRating: "4.8",
      supportAvailability: "7j/7"
    };

    if (page && page.content) {
      try {
        contentObj = { ...contentObj, ...JSON.parse(page.content) };
      } catch (e) {
        console.error("Invalid JSON in about page content");
      }
    }

    return NextResponse.json(contentObj);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const data = await req.json();
    
    const contentObj = {
      yearsOfExcellence: Number(data.yearsOfExcellence) || 4,
      foundationYear: Number(data.foundationYear) || 2022,
      foundationLocation: String(data.foundationLocation || "La Ciotat"),
      satisfiedClients: String(data.satisfiedClients || "12K+"),
      satisfactionRate: String(data.satisfactionRate || "98%"),
      yachtsCount: String(data.yachtsCount || "340+"),
      destinationsCount: String(data.destinationsCount || "68"),
      verifiedAdvertisers: String(data.verifiedAdvertisers || "100%"),
      averageRating: String(data.averageRating || "4.8"),
      supportAvailability: String(data.supportAvailability || "7j/7")
    };

    const contentStr = JSON.stringify(contentObj);

    await prisma.page.upsert({
      where: { slug: 'about' },
      update: { content: contentStr, title: 'À propos' },
      create: { slug: 'about', title: 'À propos', content: contentStr, isPublished: true }
    });

    return NextResponse.json(contentObj);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
