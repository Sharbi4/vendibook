import { Truck, ChefHat, Coffee, Store, Package, Music, Sparkles, MoreHorizontal } from 'lucide-react';

/**
 * Step 1: Listing Type Selection
 * Shows category options based on selected mode
 */
export function ListingTypeStep({ formData, updateFormData }) {
  const { listingMode } = formData;

  const categoryOptions = {
    rental: [
      { id: 'food_truck', title: 'Food Truck', icon: Truck, description: 'Mobile kitchen on wheels' },
      { id: 'food_trailer', title: 'Food Trailer', icon: ChefHat, description: 'Towable food service unit' },
      { id: 'ghost_kitchen', title: 'Ghost Kitchen', icon: Store, description: 'Commercial kitchen space' },
      { id: 'vendor_space', title: 'Vendor Space', icon: Package, description: 'Event or market location' }
    ],
    equipment: [
      { id: 'generator', title: 'Generator', description: 'Power equipment' },
      { id: 'smoker', title: 'Smoker', description: 'BBQ and smoking equipment' },
      { id: 'pos_terminal', title: 'POS Terminal', description: 'Point of sale system' },
      { id: 'tent_canopy', title: 'Tent or Canopy', description: 'Shade and shelter' },
      { id: 'lighting', title: 'Lighting', description: 'Event lighting equipment' },
      { id: 'water_tank', title: 'Water Tank', description: 'Water storage and supply' },
      { id: 'cookware', title: 'Cookware', description: 'Pots, pans, and cooking gear' },
      { id: 'other_equipment', title: 'Other Equipment', icon: MoreHorizontal, description: 'Other rental equipment' }
    ],
    event_pro: [
      { id: 'catering', title: 'Catering', icon: ChefHat, description: 'Full service food catering' },
      { id: 'bartending', title: 'Bartending', icon: Coffee, description: 'Bar and cocktail service' },
      { id: 'coffee_beverage', title: 'Coffee & Beverages', icon: Coffee, description: 'Coffee carts and drinks' },
      { id: 'dessert_sweets', title: 'Desserts & Sweets', icon: Sparkles, description: 'Dessert bars and treats' },
      { id: 'dj_entertainment', title: 'DJ & Entertainment', icon: Music, description: 'Music and entertainment' },
      { id: 'other_services', title: 'Other Services', icon: MoreHorizontal, description: 'Other event services' }
    ],
    for_sale: [
      { id: 'food_truck', title: 'Food Truck', icon: Truck, description: 'Complete mobile kitchen' },
      { id: 'food_trailer', title: 'Food Trailer', icon: ChefHat, description: 'Towable food unit' },
      { id: 'vendor_cart', title: 'Vendor Cart', icon: Package, description: 'Mobile vending cart' },
      { id: 'equipment', title: 'Equipment', icon: Package, description: 'Commercial equipment' },
      { id: 'other_sale', title: 'Other', icon: MoreHorizontal, description: 'Other items for sale' }
    ]
  };

  const categories = categoryOptions[listingMode] || [];
  const modeLabels = {
    rental: 'Select your rental type',
    equipment: 'Select equipment type',
    event_pro: 'Select your service type',
    for_sale: 'What are you selling?'
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">
          {modeLabels[listingMode] || 'Select listing type'}
        </h2>
        <p className="mt-2 text-slate-600">
          Choose the category that best describes your listing
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {categories.map((category) => {
          const Icon = category.icon || Package;
          const isSelected = formData.listingCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => updateFormData({ 
                listingCategory: category.id,
                listingType: category.id
              })}
              className={`
                flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left
                ${isSelected 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }
              `}
            >
              <div className={`
                rounded-lg p-2.5 
                ${isSelected ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}
              `}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{category.title}</h3>
                <p className="text-sm text-slate-500">{category.description}</p>
              </div>
              {isSelected && (
                <div className="h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ListingTypeStep;
