import { Truck, UtensilsCrossed, Wrench, DollarSign } from 'lucide-react';

/**
 * Step 0: Listing Mode Selection
 * Allows user to select what type of listing they want to create
 */
export function ListingModeStep({ formData, updateFormData }) {
  const modes = [
    {
      id: 'rental',
      title: 'Rent a food truck or trailer',
      description: 'For mobile kitchens, trailers, ghost kitchens, vending units',
      icon: Truck,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 'equipment',
      title: 'Rent equipment or mobile assets',
      description: 'Generators, smokers, POS systems, serving equipment',
      icon: Wrench,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'event_pro',
      title: 'Book an Event Pro',
      description: 'Catering, bartending, coffee carts, dessert bars, DJ and entertainment',
      icon: UtensilsCrossed,
      color: 'bg-emerald-100 text-emerald-600'
    },
    {
      id: 'for_sale',
      title: 'List for sale',
      description: 'Food trucks, trailers, carts, equipment and mobile business assets',
      icon: DollarSign,
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">What are you listing?</h2>
        <p className="mt-2 text-slate-600">
          Select the type of listing you want to create
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = formData.listingMode === mode.id;

          return (
            <button
              key={mode.id}
              onClick={() => updateFormData({ listingMode: mode.id })}
              className={`
                relative flex flex-col items-start p-6 rounded-2xl border-2 transition-all text-left
                ${isSelected 
                  ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200' 
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }
              `}
            >
              <div className={`rounded-xl p-3 ${mode.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {mode.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {mode.description}
              </p>
              {isSelected && (
                <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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

export default ListingModeStep;
