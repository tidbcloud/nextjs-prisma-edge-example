import { PrismaClient } from "@prisma/client";
import quotes from "./data.json";
const prisma = new PrismaClient();

export async function main() {
  let inserted = 0;
  console.log(`Seeding ${quotes.length} quotes.`);
  try {
    for (const quote of quotes) {
      await prisma.quote.create({
        data: {
          author: quote.author,
          content: quote.content
        }
      });
      inserted++;
    }
    console.log(`Seed completed: ${inserted} quotes inserted.`);
  } catch (error) {
    console.error(`Seed failed after inserting ${inserted} of ${quotes.length} quotes.`);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(() => {
  process.exitCode = 1;
});
