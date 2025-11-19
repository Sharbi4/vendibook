import { useState } from 'react';
import { Search, Truck } from 'lucide-react';

function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      <header style={{ borderBottom: '1px solid #e5e7eb', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(to bottom right, #FF6B35, #FF8C42)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF6B35' }}>vendibook</span>
          </div>
          <button style={{ background: '#FF6B35', color: 'white', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Sign Up</button>
        </div>
      </header>
      
      <section style={{ background: 'linear-gradient(to bottom right, #1f2937, #FF6B35)', color: 'white', padding: '100px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '24px' }}>
            Start Your Mobile Business <span style={{ color: '#FFD700' }}>Today</span>
          </h1>
          <p style={{ fontSize: '20px', marginBottom: '40px' }}>Rent food trucks, trailers, and ghost kitchens</p>
        </div>
      </section>
      
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px' }}>Featured Listings</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ height: '200px', background: '#f3f4f6' }}></div>
              <div style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Food Truck {i}</h3>
                <p style={{ color: '#6b7280' }}>Tucson, AZ</p>
                <p style={{ color: '#FF6B35', fontWeight: 'bold', marginTop: '8px' }}>$250/day</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
