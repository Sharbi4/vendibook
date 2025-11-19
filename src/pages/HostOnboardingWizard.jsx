import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, ChevronLeft, ChevronRight, Check, MapPin, Star } from 'lucide-react';
import { LISTING_TYPES, PRICE_UNITS, getCategoriesByType, getListingTypeInfo, formatPrice } from '../data/listings';

function HostOnboardingWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [listingData, setListingData] = useState({
    listingType: '',
    title: '',
    category: '',
    city: '',
    state: 'AZ',
    price: '',
    priceUnit: '',
    tags: [],
    imageUrl: '',
    description: ''
  });

  const updateData = (field, value) => {
    setListingData(prev => ({ ...prev, [field]: value }));
  };

  const toggleTag = (tag) => {
    setListingData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const isStepComplete = (step) => {
    switch (step) {
      case 1:
        return listingData.listingType !== '';
      case 2:
        return listingData.title && listingData.category && listingData.city;
      case 3:
        return listingData.price && listingData.priceUnit;
      case 4:
        return listingData.tags.length > 0;
      case 5:
        return listingData.description;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (isStepComplete(currentStep) && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const newListing = {
      ...listingData,
      id: `new-${Date.now()}`,
      rating: 0,
      reviewCount: 0,
      hostName: 'Your Name',
      isVerified: false,
      deliveryAvailable: listingData.tags.includes('Delivery Available'),
      highlights: listingData.tags,
      imageUrl: listingData.imageUrl || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&auto=format&fit=crop&q=80'
    };

    // Store in localStorage for demo (in production this would be an API call)
    const existingListings = JSON.parse(localStorage.getItem('myListings') || '[]');
    existingListings.push(newListing);
    localStorage.setItem('myListings', JSON.stringify(existingListings));

    navigate('/host/dashboard');
  };

  // Live Preview Component
  const LivePreview = () => {
    const typeInfo = listingData.listingType ? getListingTypeInfo(listingData.listingType) : null;

    return (
      <div style={{
        position: 'sticky',
        top: '32px',
        padding: '24px',
        background: 'white',
        border: '1px solid #EBEBEB',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#343434' }}>
          Live Preview
        </h3>
        <div style={{
          border: '1px solid #EBEBEB',
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'white'
        }}>
          {/* Preview Image */}
          <div style={{ position: 'relative', aspectRatio: '20/19', background: '#F7F7F7' }}>
            {listingData.imageUrl || listingData.title ? (
              <img
                src={listingData.imageUrl || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&auto=format&fit=crop&q=80'}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#717171'
              }}>
                No image yet
              </div>
            )}
            {typeInfo && (
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                padding: '6px 12px',
                background: typeInfo.bgColor,
                color: typeInfo.color,
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {typeInfo.label}
              </div>
            )}
          </div>

          {/* Preview Content */}
          <div style={{ padding: '16px' }}>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#343434',
              minHeight: '24px'
            }}>
              {listingData.title || 'Your listing title'}
            </h4>

            <p style={{ fontSize: '14px', color: '#717171', marginBottom: '8px', minHeight: '21px' }}>
              {listingData.city ? `${listingData.city}, ${listingData.state}` : 'City, State'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
              <Star style={{ width: '14px', height: '14px', fill: '#FF5124', color: '#FF5124' }} />
              <span style={{ fontSize: '14px', fontWeight: '600' }}>New</span>
            </div>

            {listingData.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {listingData.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '11px',
                      color: '#717171',
                      padding: '4px 8px',
                      background: '#F7F7F7',
                      borderRadius: '4px'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <p style={{ fontSize: '16px', fontWeight: '600', color: '#343434' }}>
              {listingData.price && listingData.priceUnit
                ? formatPrice(parseInt(listingData.price), listingData.priceUnit)
                : 'Set your price'}
            </p>
          </div>
        </div>

        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#FFF3F0',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#717171'
        }}>
          <strong style={{ color: '#FF5124' }}>Tip:</strong> This is how your listing will appear to renters
        </div>
      </div>
    );
  };

  // Step 1: Listing Type
  const Step1 = () => (
    <div>
      <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px', color: '#343434' }}>
        What would you like to list?
      </h2>
      <p style={{ fontSize: '16px', color: '#717171', marginBottom: '32px' }}>
        Choose the type of listing you want to create
      </p>

      <div style={{ display: 'grid', gap: '16px' }}>
        {[
          { type: LISTING_TYPES.RENT, label: 'Rent out equipment', desc: 'Food trucks, trailers, ghost kitchens, vending locations' },
          { type: LISTING_TYPES.SALE, label: 'Sell equipment', desc: 'Food trucks, trailers, commercial kitchen equipment' },
          { type: LISTING_TYPES.EVENT_PRO, label: 'Offer professional services', desc: 'Chef, caterer, barista, or event services' }
        ].map(({ type, label, desc }) => (
          <div
            key={type}
            onClick={() => {
              updateData('listingType', type);
              if (type === LISTING_TYPES.RENT) updateData('priceUnit', PRICE_UNITS.PER_DAY);
              else if (type === LISTING_TYPES.SALE) updateData('priceUnit', PRICE_UNITS.ONE_TIME);
              else updateData('priceUnit', PRICE_UNITS.PER_HOUR);
            }}
            style={{
              padding: '24px',
              border: listingData.listingType === type ? '2px solid #FF5124' : '2px solid #EBEBEB',
              borderRadius: '12px',
              cursor: 'pointer',
              background: listingData.listingType === type ? '#FFF3F0' : 'white',
              transition: 'all 0.2s'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#343434' }}>
              {label}
            </h3>
            <p style={{ fontSize: '14px', color: '#717171' }}>
              {desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  // Step 2: Basic Info
  const Step2 = () => (
    <div>
      <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px', color: '#343434' }}>
        Tell us about your listing
      </h2>
      <p style={{ fontSize: '16px', color: '#717171', marginBottom: '32px' }}>
        Provide the basic details
      </p>

      <div style={{ display: 'grid', gap: '24px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#343434' }}>
            Title *
          </label>
          <input
            type="text"
            value={listingData.title}
            onChange={(e) => updateData('title', e.target.value)}
            placeholder="e.g., Fully Equipped Taco Truck"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #EBEBEB',
              borderRadius: '8px',
              fontSize: '15px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#343434' }}>
            Category *
          </label>
          <select
            value={listingData.category}
            onChange={(e) => updateData('category', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #EBEBEB',
              borderRadius: '8px',
              fontSize: '15px'
            }}
          >
            <option value="">Select a category</option>
            {getCategoriesByType(listingData.listingType).slice(1).map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#343434' }}>
              City *
            </label>
            <input
              type="text"
              value={listingData.city}
              onChange={(e) => updateData('city', e.target.value)}
              placeholder="Phoenix"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #EBEBEB',
                borderRadius: '8px',
                fontSize: '15px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#343434' }}>
              State *
            </label>
            <select
              value={listingData.state}
              onChange={(e) => updateData('state', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #EBEBEB',
                borderRadius: '8px',
                fontSize: '15px'
              }}
            >
              <option value="AZ">AZ</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 3: Pricing
  const Step3 = () => (
    <div>
      <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px', color: '#343434' }}>
        Set your {listingData.listingType === LISTING_TYPES.SALE ? 'price' : 'rate'}
      </h2>
      <p style={{ fontSize: '16px', color: '#717171', marginBottom: '32px' }}>
        {listingData.listingType === LISTING_TYPES.SALE
          ? 'Set your asking price'
          : listingData.listingType === LISTING_TYPES.EVENT_PRO
          ? 'Set your hourly service rate'
          : 'Set your daily rental rate'}
      </p>

      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#343434' }}>
          {listingData.listingType === LISTING_TYPES.SALE ? 'Price' : 'Rate'} *
        </label>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '18px',
            color: '#717171'
          }}>
            $
          </span>
          <input
            type="number"
            value={listingData.price}
            onChange={(e) => updateData('price', e.target.value)}
            placeholder="250"
            style={{
              width: '100%',
              padding: '12px 12px 12px 32px',
              border: '1px solid #EBEBEB',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '600'
            }}
          />
        </div>
        <p style={{ fontSize: '13px', color: '#717171', marginTop: '8px' }}>
          {listingData.listingType === LISTING_TYPES.RENT && 'per day'}
          {listingData.listingType === LISTING_TYPES.EVENT_PRO && 'per hour'}
          {listingData.listingType === LISTING_TYPES.SALE && 'one-time purchase'}
        </p>
      </div>
    </div>
  );

  // Step 4: Tags
  const Step4 = () => {
    const tagOptions = listingData.listingType === LISTING_TYPES.EVENT_PRO
      ? ['Certified', 'Licensed', 'Insured', 'Menu Planning', 'Catering', 'Bar Service', '10+ Years Exp']
      : ['Power', 'Water', 'Propane', 'Full Kitchen', 'Storage', 'WiFi', 'Delivery Available', 'High Foot Traffic'];

    return (
      <div>
        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px', color: '#343434' }}>
          Add features and amenities
        </h2>
        <p style={{ fontSize: '16px', color: '#717171', marginBottom: '32px' }}>
          Select all that apply to your listing
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {tagOptions.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              style={{
                padding: '12px 20px',
                border: listingData.tags.includes(tag) ? '2px solid #FF5124' : '2px solid #EBEBEB',
                borderRadius: '24px',
                background: listingData.tags.includes(tag) ? '#FFF3F0' : 'white',
                color: listingData.tags.includes(tag) ? '#FF5124' : '#717171',
                fontSize: '14px',
                fontWeight: listingData.tags.includes(tag) ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Step 5: Description & Photos
  const Step5 = () => (
    <div>
      <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px', color: '#343434' }}>
        Add final details
      </h2>
      <p style={{ fontSize: '16px', color: '#717171', marginBottom: '32px' }}>
        Help renters understand what makes your listing special
      </p>

      <div style={{ display: 'grid', gap: '24px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#343434' }}>
            Description *
          </label>
          <textarea
            value={listingData.description}
            onChange={(e) => updateData('description', e.target.value)}
            placeholder="Describe your listing, what makes it special, and any important details..."
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #EBEBEB',
              borderRadius: '8px',
              fontSize: '15px',
              minHeight: '120px',
              resize: 'vertical'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#343434' }}>
            Photo URL (optional)
          </label>
          <input
            type="text"
            value={listingData.imageUrl}
            onChange={(e) => updateData('imageUrl', e.target.value)}
            placeholder="https://images.unsplash.com/..."
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #EBEBEB',
              borderRadius: '8px',
              fontSize: '15px'
            }}
          />
          <p style={{ fontSize: '13px', color: '#717171', marginTop: '8px' }}>
            In production, you would upload photos here
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      case 4:
        return <Step4 />;
      case 5:
        return <Step5 />;
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #EBEBEB',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1760px', margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
            <div
              onClick={() => navigate('/become-host')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                background: '#FF5124',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Truck style={{ width: '18px', height: '18px', color: 'white' }} />
              </div>
              <span style={{ fontSize: '20px', fontWeight: '700', color: '#FF5124' }}>
                vendibook
              </span>
            </div>
            <span style={{ fontSize: '14px', color: '#717171' }}>
              Step {currentStep} of 5
            </span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #EBEBEB' }}>
        <div style={{ maxWidth: '1760px', margin: '0 auto', padding: '0 40px' }}>
          <div style={{ height: '4px', background: '#EBEBEB', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              background: '#FF5124',
              width: `${(currentStep / 5) * 100}%`,
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '48px' }}>
          {/* Form */}
          <div>
            {renderStep()}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '48px' }}>
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  border: '1px solid #EBEBEB',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#343434',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentStep === 1 ? 0.5 : 1
                }}
              >
                <ChevronLeft style={{ width: '20px', height: '20px' }} />
                Back
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={nextStep}
                  disabled={!isStepComplete(currentStep)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    background: isStepComplete(currentStep) ? '#FF5124' : '#EBEBEB',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: isStepComplete(currentStep) ? 'pointer' : 'not-allowed'
                  }}
                >
                  Next
                  <ChevronRight style={{ width: '20px', height: '20px' }} />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={!isStepComplete(5)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 32px',
                    border: 'none',
                    borderRadius: '8px',
                    background: isStepComplete(5) ? '#FF5124' : '#EBEBEB',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: isStepComplete(5) ? 'pointer' : 'not-allowed'
                  }}
                >
                  <Check style={{ width: '20px', height: '20px' }} />
                  Complete & Publish
                </button>
              )}
            </div>
          </div>

          {/* Live Preview */}
          <LivePreview />
        </div>
      </div>
    </div>
  );
}

export default HostOnboardingWizard;
