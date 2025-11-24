import { useNavigate } from 'react-router-dom';
import { Truck, ShoppingCart, Users, ArrowRight, DollarSign, Shield, Calendar } from 'lucide-react';

function BecomeHostLanding() {
  const navigate = useNavigate();

  const HostingType = ({ icon: Icon, title, description, examples }) => (
    <div style={{
      padding: '32px',
      border: '1px solid #EBEBEB',
      borderRadius: '16px',
      background: 'white',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      <div style={{
        width: '64px',
        height: '64px',
        background: '#FF5124',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <Icon style={{ width: '32px', height: '32px', color: 'white' }} />
      </div>
      <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px', color: '#343434' }}>
        {title}
      </h3>
      <p style={{ fontSize: '16px', color: '#717171', marginBottom: '16px', lineHeight: '1.5' }}>
        {description}
      </p>
      <p style={{ fontSize: '14px', color: '#717171', fontStyle: 'italic' }}>
        Examples: {examples}
      </p>
    </div>
  );

  const Benefit = ({ icon: Icon, title, description }) => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
      <div style={{
        width: '48px',
        height: '48px',
        background: '#FFF3F0',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon style={{ width: '24px', height: '24px', color: '#FF5124' }} />
      </div>
      <div>
        <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#343434' }}>
          {title}
        </h4>
        <p style={{ fontSize: '15px', color: '#717171', lineHeight: '1.5' }}>
          {description}
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #EBEBEB'
      }}>
        <div style={{ maxWidth: '1760px', margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
            <div
              onClick={() => navigate('/')}
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
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #343434 0%, #FF5124 100%)',
        padding: '80px 40px',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '56px', fontWeight: '700', marginBottom: '24px', letterSpacing: '-2px' }}>
            Become a Vendibook Host
          </h1>
          <p style={{ fontSize: '24px', marginBottom: '48px', opacity: 0.95 }}>
            Turn your mobile business assets into income
          </p>
          <button
            onClick={() => navigate('/host/onboarding')}
            style={{
              background: 'white',
              color: '#FF5124',
              border: 'none',
              padding: '20px 48px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}
          >
            Get Started
            <ArrowRight style={{ width: '24px', height: '24px' }} />
          </button>
        </div>
      </section>

      {/* Hosting Types */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 40px' }}>
        <h2 style={{ fontSize: '40px', fontWeight: '700', textAlign: 'center', marginBottom: '56px', color: '#343434' }}>
          Choose Your Hosting Style
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          <HostingType
            icon={Truck}
            title="List for Rent"
            description="Rent out your food truck, trailer, ghost kitchen, or vending location by the day or week."
            examples="Food trucks, trailers, ghost kitchens, vending lots"
          />
          <HostingType
            icon={ShoppingCart}
            title="Sell Equipment"
            description="Sell your mobile food business equipment and assets to verified buyers."
            examples="Food trucks, trailers, commercial equipment"
          />
          <HostingType
            icon={Users}
            title="Offer Services"
            description="List your professional services as a chef, caterer, or event specialist."
            examples="Chefs, caterers, baristas, event staff"
          />
        </div>
      </section>

      {/* Benefits */}
      <section style={{ background: '#FAFAFA', padding: '80px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '700', textAlign: 'center', marginBottom: '56px', color: '#343434' }}>
            Why Host on Vendibook?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '48px' }}>
            <Benefit
              icon={DollarSign}
              title="Earn Extra Income"
              description="Turn idle equipment into revenue. Hosts earn an average of $3,500-$8,000 per month."
            />
            <Benefit
              icon={Shield}
              title="Protected & Insured"
              description="Every rental includes $1M liability coverage and damage protection at no extra cost."
            />
            <Benefit
              icon={Calendar}
              title="You're in Control"
              description="Set your own availability, pricing, and rental terms. Approve each booking."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '24px', color: '#343434' }}>
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: '18px', color: '#717171', marginBottom: '40px' }}>
            Create your first listing in under 10 minutes
          </p>
          <button
            onClick={() => navigate('/host/onboarding')}
            style={{
              background: '#FF5124',
              color: 'white',
              border: 'none',
              padding: '20px 48px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            Create Your Listing
            <ArrowRight style={{ width: '24px', height: '24px' }} />
          </button>
        </div>
      </section>
    </div>
  );
}

export default BecomeHostLanding;
