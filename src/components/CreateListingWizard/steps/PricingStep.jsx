import { useState } from 'react';
import { DollarSign, Plus, X, Percent, Truck, Shield } from 'lucide-react';

/**
 * Step 4: Pricing and Financials
 * Base pricing, tiers, add-ons, deposits, delivery fees
 */
export function PricingStep({ formData, updateFormData }) {
  const { listingMode } = formData;
  const isForSale = listingMode === 'for_sale';
  const isEventPro = listingMode === 'event_pro';

  const [newTier, setNewTier] = useState({ name: '', price: '', inclusions: '' });
  const [newAddon, setNewAddon] = useState({ name: '', price: '', quantity: '' });

  const addTier = () => {
    if (newTier.name && newTier.price) {
      updateFormData({
        tierPricing: [...formData.tierPricing, { ...newTier, id: Date.now() }]
      });
      setNewTier({ name: '', price: '', inclusions: '' });
    }
  };

  const removeTier = (id) => {
    updateFormData({
      tierPricing: formData.tierPricing.filter(t => t.id !== id)
    });
  };

  const addAddon = () => {
    if (newAddon.name && newAddon.price) {
      updateFormData({
        addonItems: [...formData.addonItems, { ...newAddon, id: Date.now() }]
      });
      setNewAddon({ name: '', price: '', quantity: '' });
    }
  };

  const removeAddon = (id) => {
    updateFormData({
      addonItems: formData.addonItems.filter(a => a.id !== id)
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Pricing</h2>
        <p className="mt-2 text-slate-600">
          Set your rates, fees, and add-ons
        </p>
      </div>

      {/* For Sale Pricing */}
      {isForSale ? (
        <section className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <DollarSign className="h-5 w-5 text-orange-500" />
            Sale Price
          </h3>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Asking Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={formData.salePrice || ''}
                onChange={(e) => updateFormData({ salePrice: parseFloat(e.target.value) || null })}
                placeholder="25000"
                className="w-full rounded-xl border border-slate-300 pl-8 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800">
              <strong>Commission:</strong> A 13% commission will be deducted from the sale price upon successful sale.
            </p>
          </div>
        </section>
      ) : (
        <>
          {/* Base Pricing */}
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <DollarSign className="h-5 w-5 text-orange-500" />
              Base Pricing
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {!isEventPro && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Daily Rate
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={formData.baseDailyPrice || ''}
                      onChange={(e) => updateFormData({ baseDailyPrice: parseFloat(e.target.value) || null })}
                      placeholder="500"
                      className="w-full rounded-xl border border-slate-300 pl-8 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Hourly Rate
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    value={formData.baseHourlyPrice || ''}
                    onChange={(e) => updateFormData({ baseHourlyPrice: parseFloat(e.target.value) || null })}
                    placeholder="75"
                    className="w-full rounded-xl border border-slate-300 pl-8 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>
              </div>

              {isEventPro && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Flat Event Rate
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={formData.flatEventPrice || ''}
                      onChange={(e) => updateFormData({ flatEventPrice: parseFloat(e.target.value) || null })}
                      placeholder="1500"
                      className="w-full rounded-xl border border-slate-300 pl-8 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Multi-day discount */}
            {!isEventPro && (
              <div className="max-w-xs">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                  <Percent className="h-4 w-4" />
                  Multi-Day Discount (%)
                </label>
                <input
                  type="number"
                  value={formData.multiDayDiscountPercent || ''}
                  onChange={(e) => updateFormData({ multiDayDiscountPercent: parseFloat(e.target.value) || 0 })}
                  placeholder="10"
                  min={0}
                  max={50}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
            )}
          </section>

          {/* Tiered/Package Pricing */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {isEventPro ? 'Packages' : 'Tiered Pricing'} (Optional)
            </h3>
            <p className="text-sm text-slate-600">
              Create pricing tiers or packages for different service levels
            </p>

            <div className="space-y-3 rounded-xl border border-slate-200 p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  type="text"
                  value={newTier.name}
                  onChange={(e) => setNewTier({ ...newTier, name: e.target.value })}
                  placeholder="Tier name (e.g., Premium)"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                  <input
                    type="number"
                    value={newTier.price}
                    onChange={(e) => setNewTier({ ...newTier, price: e.target.value })}
                    placeholder="Price"
                    className="w-full rounded-lg border border-slate-300 pl-7 pr-3 py-2 text-sm"
                  />
                </div>
                <input
                  type="text"
                  value={newTier.inclusions}
                  onChange={(e) => setNewTier({ ...newTier, inclusions: e.target.value })}
                  placeholder="What's included"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={addTier}
                disabled={!newTier.name || !newTier.price}
                className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add Tier
              </button>
            </div>

            {formData.tierPricing.length > 0 && (
              <div className="space-y-2">
                {formData.tierPricing.map((tier) => (
                  <div
                    key={tier.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
                  >
                    <div>
                      <span className="font-medium text-slate-900">{tier.name}</span>
                      <span className="mx-2 text-slate-400">—</span>
                      <span className="text-orange-600 font-semibold">${tier.price}</span>
                      {tier.inclusions && (
                        <p className="text-sm text-slate-500">{tier.inclusions}</p>
                      )}
                    </div>
                    <button onClick={() => removeTier(tier.id)} className="text-slate-400 hover:text-red-500">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Add-ons */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Add-ons (Optional)</h3>
            <p className="text-sm text-slate-600">
              Offer optional extras that renters can add to their booking
            </p>

            <div className="space-y-3 rounded-xl border border-slate-200 p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  type="text"
                  value={newAddon.name}
                  onChange={(e) => setNewAddon({ ...newAddon, name: e.target.value })}
                  placeholder="Add-on name"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                  <input
                    type="number"
                    value={newAddon.price}
                    onChange={(e) => setNewAddon({ ...newAddon, price: e.target.value })}
                    placeholder="Price"
                    className="w-full rounded-lg border border-slate-300 pl-7 pr-3 py-2 text-sm"
                  />
                </div>
                <input
                  type="text"
                  value={newAddon.quantity}
                  onChange={(e) => setNewAddon({ ...newAddon, quantity: e.target.value })}
                  placeholder="Qty options (e.g., 1-5)"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={addAddon}
                disabled={!newAddon.name || !newAddon.price}
                className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>

            {formData.addonItems.length > 0 && (
              <div className="space-y-2">
                {formData.addonItems.map((addon) => (
                  <div
                    key={addon.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
                  >
                    <div>
                      <span className="font-medium text-slate-900">{addon.name}</span>
                      <span className="mx-2 text-slate-400">—</span>
                      <span className="text-orange-600 font-semibold">${addon.price}</span>
                      {addon.quantity && (
                        <span className="ml-2 text-sm text-slate-500">({addon.quantity})</span>
                      )}
                    </div>
                    <button onClick={() => removeAddon(addon.id)} className="text-slate-400 hover:text-red-500">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Deposits and Fees */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Shield className="h-5 w-5 text-orange-500" />
          Deposits & Fees
        </h3>

        <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.depositRequired}
            onChange={(e) => updateFormData({ depositRequired: e.target.checked })}
            className="h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
          />
          <div>
            <span className="font-medium text-slate-900">Require Security Deposit</span>
            <p className="text-sm text-slate-500">Collect a refundable deposit from renters</p>
          </div>
        </label>

        {formData.depositRequired && (
          <div className="max-w-xs pl-8">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Deposit Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={formData.depositAmount || ''}
                onChange={(e) => updateFormData({ depositAmount: parseFloat(e.target.value) || 0 })}
                placeholder="500"
                className="w-full rounded-xl border border-slate-300 pl-8 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cleaning Fee
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={formData.cleaningFee || ''}
                onChange={(e) => updateFormData({ cleaningFee: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="w-full rounded-xl border border-slate-300 pl-8 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Damage Waiver
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={formData.damageWaiver || ''}
                onChange={(e) => updateFormData({ damageWaiver: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="w-full rounded-xl border border-slate-300 pl-8 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Pricing (if enabled) */}
      {formData.deliveryEnabled && (
        <section className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Truck className="h-5 w-5 text-orange-500" />
            Delivery Pricing
          </h3>

          {formData.deliveryModel === 'flat_fee' && (
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-600">
                Flat delivery fee: <span className="font-semibold text-slate-900">${formData.deliveryFlatFee || 0}</span>
              </p>
            </div>
          )}

          {formData.deliveryModel === 'mileage_based' && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <p className="text-sm text-slate-600">
                Rate: <span className="font-semibold text-slate-900">${formData.deliveryRatePerMile || 0}/mile</span>
              </p>
              <p className="text-sm text-slate-600">
                Max range: <span className="font-semibold text-slate-900">{formData.deliveryRangeMiles || '—'} miles</span>
              </p>
            </div>
          )}

          {formData.deliveryModel === 'delivery_included' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm text-emerald-800">
                Free delivery included up to <span className="font-semibold">{formData.deliveryIncludedMiles || 0} miles</span>
              </p>
            </div>
          )}
        </section>
      )}

      {/* For Sale Add-ons */}
      {isForSale && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Sale Add-ons</h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.deliveryEnabled}
                onChange={(e) => updateFormData({ deliveryEnabled: e.target.checked })}
                className="h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
              />
              <div>
                <span className="font-medium text-slate-900">Delivery Available</span>
                <p className="text-sm text-slate-500">Can deliver to buyer's location</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notaryServiceAvailable}
                onChange={(e) => updateFormData({ notaryServiceAvailable: e.target.checked })}
                className="h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
              />
              <div>
                <span className="font-medium text-slate-900">Notary Service Available</span>
                <p className="text-sm text-slate-500">Offer notary service for title transfer</p>
              </div>
            </label>
          </div>
        </section>
      )}
    </div>
  );
}

export default PricingStep;
