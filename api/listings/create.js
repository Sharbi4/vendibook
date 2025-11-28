import { neon } from '@neondatabase/serverless';

/**
 * POST /api/listings/create
 * 
 * Creates a new Creative Listing with all related data
 * Writes to: listings, listing_specifications, listing_availability,
 *            listing_pricing, listing_location, listing_media,
 *            listing_compliance, user_listings
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    const {
      // User identification
      userId,
      
      // Basic listing info
      title,
      description,
      listingCategory,
      listingType,
      listingMode, // rental, event_pro, equipment, for_sale
      status = 'draft',
      
      // Location data
      latitude,
      longitude,
      maskedAddress,
      fullAddress,
      zipCode,
      city,
      state,
      serviceRadiusMiles = 25,
      deliveryEnabled = false,
      deliveryModel = 'pickup_only',
      deliveryRangeMiles,
      deliveryFlatFee,
      deliveryRatePerMile,
      deliveryIncludedMiles,
      
      // Specifications
      lengthFeet,
      widthFeet,
      heightFeet,
      weightLbs,
      powerType,
      electricalRequirements,
      waterSystem,
      freshWaterCapacityGallons,
      greyWaterCapacityGallons,
      ventilationInfo,
      capacityServed,
      equipmentClassification,
      vendingWindowCount,
      generatorIncluded,
      posSystemIncluded,
      handWashSinkIncluded,
      wheelchairAccessible,
      commercialGradeElectrical,
      certifiedKitchenRating,
      
      // Availability
      blackoutDates = [],
      blackoutRanges = [],
      weekdayAvailability,
      eventHours,
      minimumRentalHours,
      maximumRentalHours,
      minimumRentalDays,
      maximumRentalDays,
      leadTimeDays,
      instantBookEnabled = false,
      alwaysAvailable = false,
      
      // Pricing
      baseHourlyPrice,
      baseDailyPrice,
      flatEventPrice,
      tierPricing = [],
      addonItems = [],
      depositRequired = false,
      depositAmount = 0,
      cleaningFee = 0,
      damageWaiver = 0,
      multiDayDiscountPercent = 0,
      salePrice,
      
      // Media
      heroImage,
      gallery = [],
      videoUrl,
      
      // Compliance
      documentUploads = [],
      documentCategoryGroup,
      permitRequired = false,
      insuranceRequired = false,
      titleDocument,
      vinOrSerialNumber,
      inspectionReport,
      notaryServiceAvailable = false
    } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: 'userId is required'
      });
    }

    if (!title) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'title is required'
      });
    }

    if (!listingCategory) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'listingCategory is required'
      });
    }

    // Validate at least one price or sale price is set
    const hasPrice = baseHourlyPrice || baseDailyPrice || flatEventPrice || salePrice;
    if (!hasPrice) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'At least one pricing option is required'
      });
    }

    // Determine primary price for listings table
    const primaryPrice = salePrice || baseDailyPrice || baseHourlyPrice || flatEventPrice || 0;

    // Step 1: Create the core listing record
    const [listing] = await sql`
      INSERT INTO listings (
        title,
        description,
        city,
        state,
        price,
        listing_type,
        booking_mode,
        latitude,
        longitude,
        postal_code,
        display_city,
        display_state,
        service_radius_miles,
        delivery_available,
        video_url,
        sale_category,
        owner_user_id
      ) VALUES (
        ${title},
        ${description || null},
        ${city || null},
        ${state || null},
        ${primaryPrice},
        ${listingType || listingCategory},
        ${listingMode === 'event_pro' ? 'hourly' : 'daily-with-time'},
        ${latitude || null},
        ${longitude || null},
        ${zipCode || null},
        ${city || null},
        ${state || null},
        ${serviceRadiusMiles},
        ${deliveryEnabled},
        ${videoUrl || null},
        ${listingMode === 'for_sale' ? listingCategory : null},
        ${userId}
      )
      RETURNING id, created_at
    `;

    const listingId = listing.id;

    // Step 2: Insert specifications
    await sql`
      INSERT INTO listing_specifications (
        listing_id,
        length_feet,
        width_feet,
        height_feet,
        weight_lbs,
        power_type,
        electrical_requirements,
        water_system,
        fresh_water_capacity_gallons,
        grey_water_capacity_gallons,
        ventilation_info,
        capacity_served,
        equipment_classification,
        vending_window_count,
        generator_included,
        pos_system_included,
        hand_wash_sink_included,
        wheelchair_accessible,
        commercial_grade_electrical,
        certified_kitchen_rating
      ) VALUES (
        ${listingId},
        ${lengthFeet || null},
        ${widthFeet || null},
        ${heightFeet || null},
        ${weightLbs || null},
        ${powerType || null},
        ${electricalRequirements || null},
        ${waterSystem || null},
        ${freshWaterCapacityGallons || null},
        ${greyWaterCapacityGallons || null},
        ${ventilationInfo || null},
        ${capacityServed || null},
        ${equipmentClassification || null},
        ${vendingWindowCount || null},
        ${generatorIncluded || false},
        ${posSystemIncluded || false},
        ${handWashSinkIncluded || false},
        ${wheelchairAccessible || false},
        ${commercialGradeElectrical || false},
        ${certifiedKitchenRating || null}
      )
      ON CONFLICT (listing_id) DO UPDATE SET
        length_feet = EXCLUDED.length_feet,
        width_feet = EXCLUDED.width_feet,
        updated_at = NOW()
    `;

    // Step 3: Insert availability
    await sql`
      INSERT INTO listing_availability (
        listing_id,
        blackout_dates,
        blackout_ranges,
        weekday_availability,
        event_hours,
        minimum_rental_hours,
        maximum_rental_hours,
        minimum_rental_days,
        maximum_rental_days,
        lead_time_days,
        instant_book_enabled,
        always_available
      ) VALUES (
        ${listingId},
        ${JSON.stringify(blackoutDates)},
        ${JSON.stringify(blackoutRanges)},
        ${weekdayAvailability ? JSON.stringify(weekdayAvailability) : '{"mon":true,"tue":true,"wed":true,"thu":true,"fri":true,"sat":true,"sun":true}'},
        ${eventHours ? JSON.stringify(eventHours) : '{"start":"09:00","end":"22:00"}'},
        ${minimumRentalHours || null},
        ${maximumRentalHours || null},
        ${minimumRentalDays || 1},
        ${maximumRentalDays || null},
        ${leadTimeDays || 1},
        ${instantBookEnabled},
        ${alwaysAvailable}
      )
      ON CONFLICT (listing_id) DO UPDATE SET
        blackout_dates = EXCLUDED.blackout_dates,
        updated_at = NOW()
    `;

    // Step 4: Insert pricing
    await sql`
      INSERT INTO listing_pricing (
        listing_id,
        base_hourly_price,
        base_daily_price,
        flat_event_price,
        tier_pricing,
        addon_items,
        deposit_required,
        deposit_amount,
        cleaning_fee,
        damage_waiver,
        multi_day_discount_percent,
        sale_price,
        delivery_flat_fee,
        delivery_rate_per_mile,
        delivery_included_miles
      ) VALUES (
        ${listingId},
        ${baseHourlyPrice || null},
        ${baseDailyPrice || null},
        ${flatEventPrice || null},
        ${JSON.stringify(tierPricing)},
        ${JSON.stringify(addonItems)},
        ${depositRequired},
        ${depositAmount},
        ${cleaningFee},
        ${damageWaiver},
        ${multiDayDiscountPercent},
        ${salePrice || null},
        ${deliveryFlatFee || 0},
        ${deliveryRatePerMile || 0},
        ${deliveryIncludedMiles || 0}
      )
      ON CONFLICT (listing_id) DO UPDATE SET
        base_daily_price = EXCLUDED.base_daily_price,
        updated_at = NOW()
    `;

    // Step 5: Insert location
    await sql`
      INSERT INTO listing_location (
        listing_id,
        latitude,
        longitude,
        masked_address,
        full_address,
        zip_code,
        city,
        state,
        service_radius_miles,
        delivery_enabled,
        delivery_range_miles,
        delivery_model
      ) VALUES (
        ${listingId},
        ${latitude || null},
        ${longitude || null},
        ${maskedAddress || null},
        ${fullAddress || null},
        ${zipCode || null},
        ${city || null},
        ${state || null},
        ${serviceRadiusMiles},
        ${deliveryEnabled},
        ${deliveryRangeMiles || null},
        ${deliveryModel}
      )
      ON CONFLICT (listing_id) DO UPDATE SET
        latitude = EXCLUDED.latitude,
        updated_at = NOW()
    `;

    // Step 6: Insert media
    if (heroImage) {
      await sql`
        INSERT INTO listing_media (listing_id, media_type, url, is_hero, sort_order)
        VALUES (${listingId}, 'image', ${heroImage}, true, 0)
      `;
    }

    if (gallery.length > 0) {
      for (let i = 0; i < gallery.length; i++) {
        const imageUrl = typeof gallery[i] === 'string' ? gallery[i] : gallery[i].url;
        await sql`
          INSERT INTO listing_media (listing_id, media_type, url, is_hero, sort_order)
          VALUES (${listingId}, 'image', ${imageUrl}, false, ${i + 1})
        `;
      }
    }

    if (videoUrl) {
      await sql`
        INSERT INTO listing_media (listing_id, media_type, url, is_hero, sort_order)
        VALUES (${listingId}, 'video', ${videoUrl}, false, 999)
      `;
    }

    // Step 7: Insert compliance
    await sql`
      INSERT INTO listing_compliance (
        listing_id,
        document_uploads,
        document_category_group,
        permit_required,
        insurance_required,
        title_document_url,
        vin_or_serial_number,
        inspection_report_url,
        notary_service_available
      ) VALUES (
        ${listingId},
        ${JSON.stringify(documentUploads)},
        ${documentCategoryGroup || null},
        ${permitRequired},
        ${insuranceRequired},
        ${titleDocument || null},
        ${vinOrSerialNumber || null},
        ${inspectionReport || null},
        ${notaryServiceAvailable}
      )
      ON CONFLICT (listing_id) DO UPDATE SET
        document_uploads = EXCLUDED.document_uploads,
        updated_at = NOW()
    `;

    // Step 8: Link listing to user
    await sql`
      INSERT INTO user_listings (user_id, listing_id, listing_status, is_primary_owner)
      VALUES (${userId}, ${listingId}, ${status}, true)
      ON CONFLICT (user_id, listing_id) DO UPDATE SET
        listing_status = EXCLUDED.listing_status,
        updated_at = NOW()
    `;

    // Return success response
    return res.status(201).json({
      success: true,
      data: {
        listingId,
        status,
        createdAt: listing.created_at
      },
      message: status === 'active' ? 'Listing published successfully' : 'Listing saved as draft'
    });

  } catch (error) {
    console.error('Create listing error:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to create listing',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
