
import { db } from '../src/db';
import * as schema from '../src/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface PromoCode {
  code: string;
  maxRedemptions: number | null;
  currentRedemptions: number;
  expiryDate: Date | null;
  trialDurationDays: number;
  tier: string;
  features: string[];
  isActive: boolean;
}

export interface RedemptionRecord {
  userId: string;
  promoCode: string;
  redeemedAt: Date;
  expiresAt: Date;
}

export class PromoCodeSystem {
  /**
   * Validates a promo code
   * @param code The promo code to validate
   * @returns The promo code object if valid, otherwise throws an error
   */
  static async validate(code: string): Promise<PromoCode> {
    const promo = await db.query.promoCodes.findFirst({
      where: and(
        eq(schema.promoCodes.code, code.toUpperCase()),
        eq(schema.promoCodes.isActive, true)
      )
    });

    if (!promo) {
      throw new Error('Invalid or inactive promo code');
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      throw new Error('Promo code has expired');
    }

    if (promo.maxRedemptions && promo.currentRedemptions >= promo.maxRedemptions) {
      throw new Error('Promo code has reached maximum redemptions');
    }

    return {
      code: promo.code,
      maxRedemptions: promo.maxRedemptions,
      currentRedemptions: promo.currentRedemptions,
      expiryDate: promo.expiresAt ? new Date(promo.expiresAt) : null,
      trialDurationDays: promo.trialDurationDays,
      tier: promo.tier || 'premium',
      features: promo.features ? JSON.parse(promo.features) : [],
      isActive: !!promo.isActive
    };
  }

  /**
   * Applies a promo code to a user
   * @param userId The ID of the user
   * @param code The promo code to apply
   * @returns The redemption result
   */
  static async apply(userId: string, code: string): Promise<{ expiresAt: Date }> {
    const upperCode = code.toUpperCase();

    return await db.transaction(async (tx) => {
      // Read the promo row INSIDE the transaction so the cap check and increment are
      // consistent (the earlier code read via the global handle, outside the tx).
      const promo = await tx.query.promoCodes.findFirst({
        where: and(eq(schema.promoCodes.code, upperCode), eq(schema.promoCodes.isActive, true))
      });
      if (!promo) throw new Error('Invalid or inactive promo code');
      if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
        throw new Error('Promo code has expired');
      }

      const trialDurationDays = promo.trialDurationDays;
      const tier = promo.tier || 'premium';
      const features: string[] = promo.features ? JSON.parse(promo.features) : [];

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + trialDurationDays);

      // Atomically increment currentRedemptions ONLY if still under the cap. Because this
      // is a single conditional UPDATE, concurrent applies can't both pass a stale cap check.
      const bumped = await tx.update(schema.promoCodes)
        .set({ currentRedemptions: sql`${schema.promoCodes.currentRedemptions} + 1` })
        .where(and(
          eq(schema.promoCodes.code, upperCode),
          promo.maxRedemptions == null
            ? sql`true`
            : sql`${schema.promoCodes.currentRedemptions} < ${promo.maxRedemptions}`
        ))
        .returning({ code: schema.promoCodes.code });

      if (bumped.length === 0) {
        throw new Error('Promo code has reached maximum redemptions');
      }

      // Insert the redemption. The (userId, promoCode) unique constraint makes a second
      // redemption by the same user fail here even under a race — caught and reported.
      try {
        await tx.insert(schema.promoRedemptions).values({
          id: uuidv4(),
          userId,
          promoCode: upperCode,
          redeemedAt: new Date(),
          expiresAt: expiresAt
        });
      } catch (e: any) {
        if (e?.code === '23505') {
          throw new Error('Promo already redeemed by this user');
        }
        throw e;
      }

      await tx.update(schema.users)
        .set({
          promoIsActive: true,
          promoCode: upperCode,
          promoActivatedAt: new Date(),
          promoExpiresAt: expiresAt,
          originalPromoCode: upperCode,
          tier: tier,
          features: JSON.stringify(features)
        })
        .where(eq(schema.users.id, userId));

      return { expiresAt };
    });
  }

  /**
   * Checks if a user has an active promo
   * @param userId The ID of the user
   * @returns True if the user has an active promo
   */
  static async isPromoActive(userId: string): Promise<boolean> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId)
    });

    if (!user || !user.promoIsActive || !user.promoExpiresAt) {
      return false;
    }

    return new Date(user.promoExpiresAt) > new Date();
  }
}
