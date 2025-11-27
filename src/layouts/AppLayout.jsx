import AppHeader from '../components/AppHeader';

function AppLayout({ children, fullWidth = false, contentClassName = '' }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <AppHeader />
      <main className={`flex-1 w-full ${fullWidth ? '' : 'mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'} ${contentClassName}`}>
        {children}
      </main>
    </div>
  );
}

export default AppLayout;
