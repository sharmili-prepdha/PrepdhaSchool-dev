import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

//Cached fetch for all XP rules. Since XpRule table is mostly constant
export const getCachedXpRules = unstable_cache(
  async () => {
    const rules = await prisma.xpRule.findMany();

    // Convert to fast lookup object
    return rules.reduce<Record<string, number>>((acc, rule) => {
      acc[rule.activity_type] = rule.xp_points;
      return acc;
    }, {});
  },
  ["xp-rules-cache"],
  {
    revalidate: 86400,
  },
);
