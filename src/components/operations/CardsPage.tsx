import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, Filter, SlidersHorizontal, Eye, ShieldAlert, Lock, Unlock, 
  CheckCircle2, XCircle, RefreshCw, ArrowRightLeft, FileDown, AlertTriangle, 
  DollarSign, Plus, Play, HelpCircle, ArrowUpDown, ChevronDown, 
  ChevronRight, ArrowUpRight, ArrowDownLeft, X, Check, FileText, Ban, Sliders,
  CreditCard, Package, History, ToggleLeft, Percent, ShieldCheck, EyeOff,
  User, Mail, Phone, MapPin, Truck, Settings, AlertCircle, Fingerprint, RefreshCcw, Landmark, Wallet
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { OperationsService } from './OperationsService';
import { Card, CardOrder, CardTransaction, CardFraudAlert, CardStatus, CardType, CardNetwork } from './OperationsTypes';

interface CardsPageProps {
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
  activeSubTab?: 'cards' | 'card-orders' | 'card-transactions' | 'card-limits' | 'card-controls' | 'card-security';
}

export function CardsPage({ onToast, activeSubTab = 'cards' }: CardsPageProps) {
  const queryClient = useQueryClient();

  // Search and Filter State
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [currencyFilter, setCurrencyFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [networkFilter, setNetworkFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Card Selection & Detail Drawer
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedCardTab, setSelectedCardTab] = useState<'overview' | 'limits' | 'transactions' | 'wallet' | 'security' | 'fraud' | 'timeline'>('overview');

  // Reveal Credentials State
  const [revealNumMap, setRevealNumMap] = useState<Record<string, boolean>>({});
  const [revealCvvMap, setRevealCvvMap] = useState<Record<string, boolean>>({});

  // Issuing Modal State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueCardType, setIssueCardType] = useState<'Virtual' | 'Physical'>('Virtual');
  const [issueNetwork, setIssueNetwork] = useState<'Visa' | 'Mastercard' | 'Amex'>('Visa');
  const [issueCustomerName, setIssueCustomerName] = useState('Acme Global Inc.');
  const [issueCustomerEmail, setIssueCustomerEmail] = useState('finance@acmeglobal.com');
  const [issueCustomerPhone, setIssueCustomerPhone] = useState('+1 (555) 019-2834');
  const [issueLinkedWallet, setIssueLinkedWallet] = useState('W-ENT-9021');
  const [issueCurrency, setIssueCurrency] = useState('USD');
  const [issueLimit, setIssueLimit] = useState('5000');
  const [issueShippingAddress, setIssueShippingAddress] = useState('100 Pine St, San Francisco, CA 94111, USA');

  // Limit Adjustment Modal State
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [targetLimitCard, setTargetLimitCard] = useState<Card | null>(null);
  const [dailyLimitVal, setDailyLimitVal] = useState('');
  const [weeklyLimitVal, setWeeklyLimitVal] = useState('');
  const [monthlyLimitVal, setMonthlyLimitVal] = useState('');
  const [atmLimitVal, setAtmLimitVal] = useState('');
  const [onlineLimitVal, setOnlineLimitVal] = useState('');
  const [posLimitVal, setPosLimitVal] = useState('');

  // PIN Reset Modal State
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [targetPinCard, setTargetPinCard] = useState<Card | null>(null);
  const [newPinVal, setNewPinVal] = useState('');

  // Country/Merchant restriction state
  const [restrictCard, setRestrictCard] = useState<Card | null>(null);
  const [merchantRestStr, setMerchantRestStr] = useState('');
  const [countryRestStr, setCountryRestStr] = useState('');
  const [categoryRestStr, setCategoryRestStr] = useState('');

  // React Query Fetch Calls
  const { data: cards = [], isLoading: isCardsLoading, isFetching: isCardsFetching, refetch: refetchCards } = useQuery({
    queryKey: ['operations-cards'],
    queryFn: () => OperationsService.getCards(),
    staleTime: 5000
  });

  const { data: cardOrders = [], isLoading: isOrdersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['operations-card-orders'],
    queryFn: () => OperationsService.getCardOrders(),
    staleTime: 5000
  });

  const { data: cardTransactions = [], isLoading: isTxsLoading, refetch: refetchTxs } = useQuery({
    queryKey: ['operations-card-transactions'],
    queryFn: () => OperationsService.getCardTransactions(),
    staleTime: 5000
  });

  const { data: fraudAlerts = [], isLoading: isFraudLoading, refetch: refetchFraud } = useQuery({
    queryKey: ['operations-card-fraud-alerts'],
    queryFn: () => OperationsService.getCardFraudAlerts(),
    staleTime: 5000
  });

  const { data: wallets = [] } = useQuery({
    queryKey: ['operations-wallets'],
    queryFn: () => OperationsService.getWallets()
  });

  // MUTATIONS
  const issueMutation = useMutation({
    mutationFn: ({ cardFields, shippingAddress }: { cardFields: Partial<Card>; shippingAddress?: string }) => 
      OperationsService.issueCard(cardFields, shippingAddress),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['operations-cards'] });
      queryClient.invalidateQueries({ queryKey: ['operations-card-orders'] });
      onToast('Card Issued', `Successfully issued new ${data.cardType} ${data.network} Card (${data.id})`, 'success');
      setIsIssueModalOpen(false);
    },
    onError: (err: any) => {
      onToast('Issuing Failed', err.message || 'Unable to issue new card', 'warning');
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ cardId, status, note }: { cardId: string; status: CardStatus; note?: string }) => 
      OperationsService.updateCardStatus(cardId, status, note),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['operations-cards'] });
      onToast('Card Status Updated', `Card ${data.id} is now ${data.status.toUpperCase()}`, 'success');
    },
    onError: (err: any) => {
      onToast('Update Failed', err.message || 'Unable to update card status', 'warning');
    }
  });

  const securityMutation = useMutation({
    mutationFn: ({ cardId, fields }: { cardId: string; fields: Partial<Card> }) => 
      OperationsService.updateCardSecurity(cardId, fields),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['operations-cards'] });
      onToast('Security Controls Updated', `Successfully updated channel controls for Card ${data.id}`, 'success');
    },
    onError: (err: any) => {
      onToast('Update Failed', err.message || 'Unable to update card channels', 'warning');
    }
  });

  const limitsMutation = useMutation({
    mutationFn: ({ cardId, fields }: { cardId: string; fields: Partial<Card> }) => 
      OperationsService.updateCardLimits(cardId, fields),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['operations-cards'] });
      onToast('Card Limits Updated', `Velocity spending caps adjusted for Card ${data.id}`, 'success');
      setLimitModalOpen(false);
    },
    onError: (err: any) => {
      onToast('Adjustment Failed', err.message || 'Unable to update card limits', 'warning');
    }
  });

  const restrictionsMutation = useMutation({
    mutationFn: ({ cardId, blockedMerchants, blockedCountries, blockedCategories }: { cardId: string; blockedMerchants: string[]; blockedCountries: string[]; blockedCategories: string[] }) => 
      OperationsService.updateCardRestrictions(cardId, blockedMerchants, blockedCountries, blockedCategories),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['operations-cards'] });
      onToast('Merchant Controls Saved', `Rules & geographic restrictions updated for Card ${data.id}`, 'success');
      setRestrictCard(null);
    },
    onError: (err: any) => {
      onToast('Update Failed', err.message || 'Unable to apply card rules', 'warning');
    }
  });

  const regenerateMutation = useMutation({
    mutationFn: (cardId: string) => OperationsService.regenerateCard(cardId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['operations-cards'] });
      onToast('Card Reissued', `Generated new credentials and credentials token for Card ${data.id}`, 'success');
    },
    onError: (err: any) => {
      onToast('Regenerating Failed', err.message || 'Unable to regenerate card', 'warning');
    }
  });

  // HANDLERS
  const handleIssueCard = (e: React.FormEvent) => {
    e.preventDefault();
    const cardFields: Partial<Card> = {
      customerName: issueCustomerName,
      customerEmail: issueCustomerEmail,
      customerPhone: issueCustomerPhone,
      cardType: issueCardType,
      network: issueNetwork,
      currency: issueCurrency,
      linkedWalletId: issueLinkedWallet,
      currentLimit: parseFloat(issueLimit),
      status: 'Active'
    };
    issueMutation.mutate({ cardFields, shippingAddress: issueShippingAddress });
  };

  const handleUpdateStatus = (cardId: string, status: CardStatus, note?: string) => {
    statusMutation.mutate({ cardId, status, note });
  };

  const handleToggleSecurityChannel = (card: Card, channel: 'online' | 'atm' | 'contactless' | 'international') => {
    const fields: Partial<Card> = {};
    if (channel === 'online') fields.onlinePaymentsEnabled = !card.onlinePaymentsEnabled;
    if (channel === 'atm') fields.atmEnabled = !card.atmEnabled;
    if (channel === 'contactless') fields.contactlessEnabled = !card.contactlessEnabled;
    if (channel === 'international') fields.internationalEnabled = !card.internationalEnabled;
    securityMutation.mutate({ cardId: card.id, fields });
  };

  const handleSaveLimits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLimitCard) return;
    const fields: Partial<Card> = {
      dailyLimit: parseFloat(dailyLimitVal) || targetLimitCard.dailyLimit,
      weeklyLimit: parseFloat(weeklyLimitVal) || targetLimitCard.weeklyLimit,
      monthlyLimit: parseFloat(monthlyLimitVal) || targetLimitCard.monthlyLimit,
      atmLimit: parseFloat(atmLimitVal) || targetLimitCard.atmLimit,
      onlineLimit: parseFloat(onlineLimitVal) || targetLimitCard.onlineLimit,
      posLimit: parseFloat(posLimitVal) || targetLimitCard.posLimit,
    };
    limitsMutation.mutate({ cardId: targetLimitCard.id, fields });
  };

  const handleSaveRestrictions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restrictCard) return;
    const merchants = merchantRestStr.split(',').map(s => s.trim()).filter(Boolean);
    const countries = countryRestStr.split(',').map(s => s.trim()).filter(Boolean);
    const categories = categoryRestStr.split(',').map(s => s.trim()).filter(Boolean);
    restrictionsMutation.mutate({
      cardId: restrictCard.id,
      blockedMerchants: merchants,
      blockedCountries: countries,
      blockedCategories: categories
    });
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPinCard) return;
    securityMutation.mutate({
      cardId: targetPinCard.id,
      fields: { pin: newPinVal }
    });
    setPinModalOpen(false);
  };

  const handleRegenerate = (cardId: string) => {
    if (window.confirm('Are you sure you want to regenerate this card credentials? This will issue a new 16-digit card number and security code, making the old ones obsolete immediately.')) {
      regenerateMutation.mutate(cardId);
    }
  };

  const handleExportCSV = () => {
    onToast('Export Started', 'Assembling and preparing cards list...', 'info');
    setTimeout(() => {
      const headers = ['Card ID', 'Masked Number', 'Customer', 'Type', 'Network', 'Status', 'Currency', 'Linked Wallet', 'Current Limit', 'Country', 'Issue Date'];
      const rows = cards.map(c => [
        c.id,
        maskCardNum(c.cardNumber),
        c.customerName,
        c.cardType,
        c.network,
        c.status,
        c.currency,
        c.linkedWalletId,
        c.currentLimit,
        c.country,
        c.issueDate
      ]);
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `WalletPro_Issuing_Cards_${new Date().toISOString().substring(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onToast('Export Complete', 'Successfully generated cards spreadsheet catalog', 'success');
    }, 800);
  };

  // HELPERS
  const maskCardNum = (num: string) => {
    if (!num) return '';
    return `${num.substring(0, 4)} •••• •••• ${num.substring(num.length - 4)}`;
  };

  const toggleRevealNum = (id: string) => {
    setRevealNumMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleRevealCvv = (id: string) => {
    setRevealCvvMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatCurrency = (val: number, curr: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(val);
  };

  // FILTER LOGIC
  const filteredCards = cards.filter(card => {
    const searchLower = searchText.toLowerCase();
    const matchesSearch = 
      card.id.toLowerCase().includes(searchLower) ||
      card.customerName.toLowerCase().includes(searchLower) ||
      card.customerEmail.toLowerCase().includes(searchLower) ||
      card.cardNumber.includes(searchLower) ||
      card.linkedWalletId.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    if (statusFilter !== 'All' && card.status !== statusFilter) return false;
    if (typeFilter !== 'All' && card.cardType !== typeFilter) return false;
    if (currencyFilter !== 'All' && card.currency !== currencyFilter) return false;
    if (countryFilter !== 'All' && card.country !== countryFilter) return false;
    if (networkFilter !== 'All' && card.network !== networkFilter) return false;
    if (riskFilter !== 'All' && card.riskLevel !== riskFilter) return false;

    return true;
  });

  // METRICS FOR DASHBOARD
  const totalCardsCount = cards.length;
  const activeCardsCount = cards.filter(c => c.status === 'Active').length;
  const frozenCardsCount = cards.filter(c => c.status === 'Frozen').length;
  const expiredCardsCount = cards.filter(c => c.status === 'Expired').length;
  const blockedCardsCount = cards.filter(c => c.status === 'Blocked').length;
  const pendingCardsCount = cards.filter(c => c.status === 'Pending').length;
  const virtualCardsCount = cards.filter(c => c.cardType === 'Virtual').length;
  const physicalCardsCount = cards.filter(c => c.cardType === 'Physical').length;

  const cardSpendToday = cardTransactions
    .filter(t => t.status === 'Settled' || t.status === 'Authorized')
    .reduce((sum, t) => sum + (t.currency === 'USD' ? t.amount : t.amount * 0.73), 0);

  const cardSpendMonthly = cardSpendToday * 28.5; // Estimated monthly spend
  const failedPaymentsCount = cardTransactions.filter(t => t.status === 'Declined').length;
  const chargebacksCount = fraudAlerts.length;

  // Selected Card Details Mapping
  const selectedCard = cards.find(c => c.id === selectedCardId);
  const selectedCardTransactions = cardTransactions.filter(t => t.cardId === selectedCardId);
  const selectedCardWallet = wallets.find(w => w.id === selectedCard?.linkedWalletId);
  const selectedCardAlerts = fraudAlerts.filter(a => a.cardId === selectedCardId);

  // CHARTS DATA PREPARATION
  const spendTrendData = [
    { name: '07-02', Spend: 1200 },
    { name: '07-03', Spend: 2100 },
    { name: '07-04', Spend: 3400 },
    { name: '07-05', Spend: 1900 },
    { name: '07-06', Spend: 4500 },
    { name: '07-07', Spend: 2800 },
    { name: '07-08', Spend: cardSpendToday },
  ];

  const categoryChartData = [
    { name: 'SaaS', value: cardTransactions.filter(t => t.merchantCategory === 'SaaS').reduce((sum, t) => sum + t.amount, 0) },
    { name: 'Travel', value: cardTransactions.filter(t => t.merchantCategory === 'Travel').reduce((sum, t) => sum + t.amount, 0) },
    { name: 'Transport', value: cardTransactions.filter(t => t.merchantCategory === 'Transport').reduce((sum, t) => sum + t.amount, 0) },
    { name: 'Finance', value: cardTransactions.filter(t => t.merchantCategory === 'Financial Services').reduce((sum, t) => sum + t.amount, 0) },
  ].filter(d => d.value > 0);

  const countryChartData = [
    { name: 'US', value: cardTransactions.filter(t => t.merchantCountry === 'United States').length },
    { name: 'UK', value: cardTransactions.filter(t => t.merchantCountry === 'United Kingdom').length },
    { name: 'Ireland', value: cardTransactions.filter(t => t.merchantCountry === 'Ireland').length },
    { name: 'Rest', value: cardTransactions.filter(t => t.merchantCountry !== 'United States' && t.merchantCountry !== 'United Kingdom' && t.merchantCountry !== 'Ireland').length },
  ];

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      
      {/* Dynamic Header actions depending on selected tab */}
      <div className="bg-white border-b border-slate-200/60 p-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight font-sans">
            {activeSubTab === 'cards' && 'Card Operations Center'}
            {activeSubTab === 'card-orders' && 'Card Distribution & Orders'}
            {activeSubTab === 'card-transactions' && 'Card Authorizations Stream'}
            {activeSubTab === 'card-limits' && 'Velocity & Spending Workspace'}
            {activeSubTab === 'card-controls' && 'Channel & Geography Restrictions'}
            {activeSubTab === 'card-security' && 'Security Management Desk'}
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            {activeSubTab === 'cards' && 'Manage all custom commercial virtual & physical debit cards'}
            {activeSubTab === 'card-orders' && 'Track physical card orders, carrier shipping, and production stages'}
            {activeSubTab === 'card-transactions' && 'Live merchant authorizations, network declines, and settling audits'}
            {activeSubTab === 'card-limits' && 'Configure custom daily, monthly, ATM and transaction velocity limits'}
            {activeSubTab === 'card-controls' && 'Add category blacklists, country merchant locks, and token parameters'}
            {activeSubTab === 'card-security' && 'PIN resets, compromise reporting, and active fraud velocity blocks'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              refetchCards();
              refetchOrders();
              refetchTxs();
              refetchFraud();
            }}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold bg-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Registry
          </button>

          {activeSubTab === 'cards' && (
            <>
              <button 
                onClick={handleExportCSV}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold bg-white"
              >
                <FileDown className="w-3.5 h-3.5" />
                Export CSV
              </button>
              
              <button 
                onClick={() => setIsIssueModalOpen(true)}
                className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-sm shadow-blue-500/10"
              >
                <Plus className="w-3.5 h-3.5" />
                Issue New Card
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col p-4 md:p-6 space-y-6">

          {/* ================= CARD DASHBOARD METRICS VIEW ================= */}
          {activeSubTab === 'cards' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200/50 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Cards</span>
                <span className="text-2xl font-bold text-slate-900 mt-2">{totalCardsCount}</span>
                <div className="text-[9px] text-slate-500 font-mono mt-1 flex justify-between">
                  <span>{virtualCardsCount} Virtual</span>
                  <span>{physicalCardsCount} Physical</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/50 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Cards</span>
                <span className="text-2xl font-bold text-emerald-600 mt-2">{activeCardsCount}</span>
                <span className="text-[9px] text-slate-400 font-mono mt-1">Ready for real-time auth</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/50 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Frozen Cards</span>
                <span className="text-2xl font-bold text-amber-500 mt-2">{frozenCardsCount}</span>
                <span className="text-[9px] text-slate-400 font-mono mt-1">Temporary blocks active</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/50 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blocked / Expired</span>
                <span className="text-2xl font-bold text-rose-600 mt-2">{blockedCardsCount + expiredCardsCount}</span>
                <div className="text-[9px] text-slate-500 font-mono mt-1 flex justify-between">
                  <span>{blockedCardsCount} Blocked</span>
                  <span>{expiredCardsCount} Expired</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/50 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending / Orders</span>
                <span className="text-2xl font-bold text-indigo-600 mt-2">{pendingCardsCount}</span>
                <span className="text-[9px] text-slate-400 font-mono mt-1">Awaiting shipping/activation</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/50 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Card Spend Today</span>
                <span className="text-2xl font-bold text-slate-900 mt-2 font-mono">{formatCurrency(cardSpendToday, 'USD')}</span>
                <span className="text-[9px] text-slate-400 font-mono mt-1">Est. Monthly: {formatCurrency(cardSpendMonthly, 'USD')}</span>
              </div>
            </div>
          )}

          {/* ================= VIEW 1: CARDS LIST (REGISTRY) ================= */}
          {activeSubTab === 'cards' && (
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm flex flex-col overflow-hidden">
              {/* Search & Filter Bar */}
              <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search card number, customer name, email, wallet..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-3 py-2 border rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition ${
                      showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Filters
                    { (statusFilter !== 'All' || typeFilter !== 'All' || currencyFilter !== 'All' || networkFilter !== 'All' || riskFilter !== 'All') && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsible Filter Panel */}
              {showFilters && (
                <div className="p-4 bg-slate-50 border-b border-slate-100 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full text-xs font-medium bg-white border border-slate-200 rounded p-1.5 focus:outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Frozen">Frozen</option>
                      <option value="Expired">Expired</option>
                      <option value="Blocked">Blocked</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Card Type</label>
                    <select 
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full text-xs font-medium bg-white border border-slate-200 rounded p-1.5 focus:outline-none"
                    >
                      <option value="All">All Types</option>
                      <option value="Virtual">Virtual</option>
                      <option value="Physical">Physical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Network</label>
                    <select 
                      value={networkFilter}
                      onChange={(e) => setNetworkFilter(e.target.value)}
                      className="w-full text-xs font-medium bg-white border border-slate-200 rounded p-1.5 focus:outline-none"
                    >
                      <option value="All">All Networks</option>
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="Amex">Amex</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Currency</label>
                    <select 
                      value={currencyFilter}
                      onChange={(e) => setCurrencyFilter(e.target.value)}
                      className="w-full text-xs font-medium bg-white border border-slate-200 rounded p-1.5 focus:outline-none"
                    >
                      <option value="All">All Currencies</option>
                      <option value="USD">USD ($)</option>
                      <option value="SGD">SGD (S$)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Risk Profile</label>
                    <select 
                      value={riskFilter}
                      onChange={(e) => setRiskFilter(e.target.value)}
                      className="w-full text-xs font-medium bg-white border border-slate-200 rounded p-1.5 focus:outline-none"
                    >
                      <option value="All">All Risk</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button 
                      onClick={() => {
                        setStatusFilter('All');
                        setTypeFilter('All');
                        setCurrencyFilter('All');
                        setCountryFilter('All');
                        setNetworkFilter('All');
                        setRiskFilter('All');
                      }}
                      className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-800 p-1.5 bg-blue-50 hover:bg-blue-100 rounded transition cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}

              {/* Table Registry */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      <th className="px-4 py-3 text-center">Brand</th>
                      <th className="px-4 py-3">Card ID</th>
                      <th className="px-4 py-3">Masked Number</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Available Limit</th>
                      <th className="px-4 py-3">Linked Wallet</th>
                      <th className="px-4 py-3 text-center">Risk</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {isCardsLoading ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-300" />
                          Indexing WalletPro Cards Registry...
                        </td>
                      </tr>
                    ) : filteredCards.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                          No cards match your current search constraints.
                        </td>
                      </tr>
                    ) : (
                      filteredCards.map(card => {
                        const isRevealed = !!revealNumMap[card.id];
                        return (
                          <tr 
                            key={card.id}
                            onClick={() => {
                              setSelectedCardId(card.id);
                              setSelectedCardTab('overview');
                            }}
                            className={`hover:bg-slate-50/80 transition cursor-pointer ${
                              selectedCardId === card.id ? 'bg-blue-50/40 border-l-2 border-l-blue-600' : ''
                            }`}
                          >
                            {/* Brand / Logo */}
                            <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-center">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  card.network === 'Visa' ? 'bg-blue-100 text-blue-800' :
                                  card.network === 'Mastercard' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-800'
                                }`}>
                                  {card.network}
                                </span>
                              </div>
                            </td>

                            {/* Card ID */}
                            <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{card.id}</td>

                            {/* Masked Number */}
                            <td className="px-4 py-3 font-mono text-slate-900 font-semibold" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-1.5">
                                <span>{isRevealed ? card.cardNumber.replace(/(.{4})/g, '$1 ') : maskCardNum(card.cardNumber)}</span>
                                <button 
                                  onClick={() => toggleRevealNum(card.id)}
                                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                                  title="Reveal Card Credentials"
                                >
                                  {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </button>
                              </div>
                            </td>

                            {/* Customer */}
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-900">{card.customerName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{card.cardType} • {card.country}</div>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase ${
                                card.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                                card.status === 'Frozen' ? 'bg-amber-100 text-amber-800' :
                                card.status === 'Blocked' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {card.status}
                              </span>
                            </td>

                            {/* Limits */}
                            <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                              <div>{formatCurrency(card.availableLimit, card.currency)}</div>
                              <div className="text-[9px] text-slate-400 font-normal">Cap: {formatCurrency(card.currentLimit, card.currency)}</div>
                            </td>

                            {/* Linked Wallet */}
                            <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">{card.linkedWalletId}</td>

                            {/* Risk */}
                            <td className="px-4 py-3 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                card.riskLevel === 'Low' ? 'bg-slate-100 text-slate-600' :
                                card.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                Score: {card.riskScore}
                              </span>
                            </td>

                            {/* Quick Inline Actions */}
                            <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-1">
                                {card.status === 'Active' ? (
                                  <button 
                                    onClick={() => handleUpdateStatus(card.id, 'Frozen')}
                                    className="p-1 rounded text-amber-500 hover:bg-amber-50 cursor-pointer"
                                    title="Freeze Card"
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>
                                ) : card.status === 'Frozen' ? (
                                  <button 
                                    onClick={() => handleUpdateStatus(card.id, 'Active')}
                                    className="p-1 rounded text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                                    title="Activate / Unfreeze Card"
                                  >
                                    <Play className="w-3.5 h-3.5" />
                                  </button>
                                ) : null}

                                <button 
                                  onClick={() => {
                                    setTargetLimitCard(card);
                                    setDailyLimitVal(String(card.dailyLimit));
                                    setWeeklyLimitVal(String(card.weeklyLimit));
                                    setMonthlyLimitVal(String(card.monthlyLimit));
                                    setAtmLimitVal(String(card.atmLimit));
                                    setOnlineLimitVal(String(card.onlineLimit));
                                    setPosLimitVal(String(card.posLimit));
                                    setLimitModalOpen(true);
                                  }}
                                  className="p-1 rounded text-blue-600 hover:bg-blue-50 cursor-pointer"
                                  title="Velocity spending caps"
                                >
                                  <Sliders className="w-3.5 h-3.5" />
                                </button>

                                <button 
                                  onClick={() => {
                                    setRestrictCard(card);
                                    setMerchantRestStr(card.blockedMerchants.join(', '));
                                    setCountryRestStr(card.blockedCountries.join(', '));
                                    setCategoryRestStr(card.blockedCategories.join(', '));
                                  }}
                                  className="p-1 rounded text-purple-600 hover:bg-purple-50 cursor-pointer"
                                  title="Merchant & Geographic restrictions"
                                >
                                  <Settings className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= VIEW 2: CARD ORDERS ================= */}
          {activeSubTab === 'card-orders' && (
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800 text-xs font-mono uppercase tracking-wide">Physical Card Production &amp; Mailing Queue</h3>
                <span className="text-[10px] text-slate-500 font-mono font-bold">{cardOrders.length} orders total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Card Reference</th>
                      <th className="px-4 py-3">Customer Name</th>
                      <th className="px-4 py-3">Mailing Carrier</th>
                      <th className="px-4 py-3">Tracking Number</th>
                      <th className="px-4 py-3">Destination Address</th>
                      <th className="px-4 py-3 text-center">Distribution Status</th>
                      <th className="px-4 py-3">Shipment Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {isOrdersLoading ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-slate-400">Loading orders...</td>
                      </tr>
                    ) : cardOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-slate-400">No physical cards ordered yet.</td>
                      </tr>
                    ) : (
                      cardOrders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-4 py-3 font-mono text-[10px] text-slate-500 font-bold">{order.id}</td>
                          <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{order.cardId}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{order.customerName}</td>
                          <td className="px-4 py-3 font-medium text-slate-600 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            {order.carrier}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">{order.trackingNumber}</td>
                          <td className="px-4 py-3 max-w-xs truncate text-slate-500" title={order.shippingAddress}>{order.shippingAddress}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${
                              order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                              order.status === 'Shipped' ? 'bg-indigo-100 text-indigo-800' :
                              order.status === 'Printing' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{order.createdDate}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= VIEW 3: CARD TRANSACTIONS ================= */}
          {activeSubTab === 'card-transactions' && (
            <div className="space-y-6">
              
              {/* Analytics Graphs section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Spend Trend */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/50 shadow-sm">
                  <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-4">Spend Trend (USD)</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={spendTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="Spend" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Categories */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/50 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-4">Top Merchant Categories</h3>
                    <div className="h-32 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={45}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categoryChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {categoryChartData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-1 text-[10px]">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-slate-500 font-semibold">{d.name} ({formatCurrency(d.value, 'USD')})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Country Mismatches & Security stats */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/50 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-2">Network Diagnostics</h3>
                    <div className="space-y-3 mt-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-semibold">Declined Transactions</span>
                        <span className="font-mono font-bold text-rose-600">{failedPaymentsCount} declines</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full" style={{ width: `${(failedPaymentsCount / cardTransactions.length) * 100}%` }} />
                      </div>

                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-semibold">International Spend Volume</span>
                        <span className="font-mono font-bold text-indigo-600">35.4% of volume</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full" style={{ width: '35.4%' }} />
                      </div>

                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-semibold">Authorization Success Rate</span>
                        <span className="font-mono font-bold text-emerald-600">89.2%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full" style={{ width: '89.2%' }} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Transactions Table */}
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-xs font-mono uppercase tracking-wide">Network Transactions Stream (Authorizations)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        <th className="px-4 py-3">Tx ID</th>
                        <th className="px-4 py-3">Card Ref</th>
                        <th className="px-4 py-3">Merchant</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-center">Risk Score</th>
                        <th className="px-4 py-3">Auth Code</th>
                        <th className="px-4 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                      {isTxsLoading ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-12 text-center text-slate-400">Streaming authorization logs...</td>
                        </tr>
                      ) : cardTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-12 text-center text-slate-400">No transactions recorded yet.</td>
                        </tr>
                      ) : (
                        cardTransactions.map(tx => (
                          <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-4 py-3 font-mono text-[10px] text-slate-500 font-bold">{tx.id}</td>
                            <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{tx.cardId}</td>
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              <div>{tx.merchantName}</div>
                              <div className="text-[9px] text-slate-400 font-mono font-normal">{tx.merchantCountry}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200/50 text-[10px] text-slate-600 font-semibold font-mono">
                                {tx.merchantCategory}
                              </span>
                            </td>
                            <td className={`px-4 py-3 text-right font-mono font-bold ${
                              tx.status === 'Declined' ? 'text-slate-400 line-through' : 'text-slate-900'
                            }`}>
                              {formatCurrency(tx.amount, tx.currency)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                tx.status === 'Settled' ? 'bg-emerald-100 text-emerald-800' :
                                tx.status === 'Authorized' ? 'bg-indigo-100 text-indigo-800' :
                                tx.status === 'Declined' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {tx.status}
                              </span>
                              {tx.declineReason && (
                                <div className="text-[9px] text-rose-600 mt-1 italic font-normal max-w-[140px] truncate" title={tx.declineReason}>
                                  {tx.declineReason}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center font-mono">
                              <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                                tx.riskScore > 80 ? 'bg-rose-100 text-rose-800 font-bold' :
                                tx.riskScore > 40 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {tx.riskScore}%
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-400 text-[10px]">{tx.authorizationCode}</td>
                            <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{tx.createdDate}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= VIEW 4: CARD LIMITS WORKSPACE ================= */}
          {activeSubTab === 'card-limits' && (
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Enterprise Limits &amp; Velocities Workstation</h3>
                  <p className="text-xs text-slate-500">Modify spend velocities to control active cards instantly.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map(card => (
                  <div key={card.id} className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 flex flex-col justify-between space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{card.customerName}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">{card.id} ({maskCardNum(card.cardNumber)})</div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-200 text-slate-700 uppercase tracking-wider font-bold">
                        {card.currency}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-slate-500">Daily Limit:</span>
                        <strong className="text-slate-900">{formatCurrency(card.dailyLimit, card.currency)}</strong>
                      </div>
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-slate-500">Weekly Limit:</span>
                        <strong className="text-slate-900">{formatCurrency(card.weeklyLimit, card.currency)}</strong>
                      </div>
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-slate-500">Monthly Limit:</span>
                        <strong className="text-slate-900">{formatCurrency(card.monthlyLimit, card.currency)}</strong>
                      </div>
                      <div className="flex justify-between font-mono text-[11px] border-t border-slate-200/50 pt-2">
                        <span className="text-slate-500">ATM Ceiling:</span>
                        <strong className="text-slate-900">{formatCurrency(card.atmLimit, card.currency)}</strong>
                      </div>
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-slate-500">Online Cap:</span>
                        <strong className="text-slate-900">{formatCurrency(card.onlineLimit, card.currency)}</strong>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setTargetLimitCard(card);
                        setDailyLimitVal(String(card.dailyLimit));
                        setWeeklyLimitVal(String(card.weeklyLimit));
                        setMonthlyLimitVal(String(card.monthlyLimit));
                        setAtmLimitVal(String(card.atmLimit));
                        setOnlineLimitVal(String(card.onlineLimit));
                        setPosLimitVal(String(card.posLimit));
                        setLimitModalOpen(true);
                      }}
                      className="w-full text-center text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 py-2 border border-slate-200 rounded-lg cursor-pointer transition"
                    >
                      Configure Caps
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= VIEW 5: CARD CONTROLS ================= */}
          {activeSubTab === 'card-controls' && (
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6 space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Channel &amp; Merchant Restrictions Board</h3>
                <p className="text-xs text-slate-500">Lock down usage channels and configure custom block lists on any card.</p>
              </div>

              <div className="space-y-4">
                {cards.map(card => (
                  <div key={card.id} className="p-4 rounded-xl border border-slate-150 bg-slate-50/50 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <div className="font-bold text-slate-800 text-xs">{card.customerName}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">{card.id} • {card.cardType}</div>
                      <div className="flex gap-1 mt-2">
                        {card.blockedMerchants.length > 0 && (
                          <span className="text-[8px] font-mono bg-rose-50 text-rose-700 border border-rose-200/50 px-1 py-0.2 rounded">
                            {card.blockedMerchants.length} Blocked Merchants
                          </span>
                        )}
                        {card.blockedCountries.length > 0 && (
                          <span className="text-[8px] font-mono bg-slate-100 text-slate-700 border border-slate-200/50 px-1 py-0.2 rounded">
                            {card.blockedCountries.length} Restricted Countries
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Channel Toggles */}
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => handleToggleSecurityChannel(card, 'online')}
                        className={`px-2 py-1.5 rounded border text-[10px] font-bold flex items-center justify-between cursor-pointer transition ${
                          card.onlinePaymentsEnabled ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                        }`}
                      >
                        <span>Online Payments</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${card.onlinePaymentsEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      </button>

                      <button 
                        onClick={() => handleToggleSecurityChannel(card, 'atm')}
                        className={`px-2 py-1.5 rounded border text-[10px] font-bold flex items-center justify-between cursor-pointer transition ${
                          card.atmEnabled ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                        }`}
                        disabled={card.cardType === 'Virtual'}
                      >
                        <span>ATM Access</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${card.atmEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      </button>

                      <button 
                        onClick={() => handleToggleSecurityChannel(card, 'contactless')}
                        className={`px-2 py-1.5 rounded border text-[10px] font-bold flex items-center justify-between cursor-pointer transition ${
                          card.contactlessEnabled ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                        }`}
                        disabled={card.cardType === 'Virtual'}
                      >
                        <span>Contactless POS</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${card.contactlessEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      </button>

                      <button 
                        onClick={() => handleToggleSecurityChannel(card, 'international')}
                        className={`px-2 py-1.5 rounded border text-[10px] font-bold flex items-center justify-between cursor-pointer transition ${
                          card.internationalEnabled ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                        }`}
                      >
                        <span>Cross-Border Tx</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${card.internationalEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      </button>
                    </div>

                    {/* Manage Button */}
                    <div className="flex justify-end">
                      <button 
                        onClick={() => {
                          setRestrictCard(card);
                          setMerchantRestStr(card.blockedMerchants.join(', '));
                          setCountryRestStr(card.blockedCountries.join(', '));
                          setCategoryRestStr(card.blockedCategories.join(', '));
                        }}
                        className="px-4 py-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer transition"
                      >
                        Configure Restrictions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= VIEW 6: CARD SECURITY & FRAUD ================= */}
          {activeSubTab === 'card-security' && (
            <div className="space-y-6">
              
              {/* Active Fraud Alerts */}
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 space-y-4">
                <div className="flex items-center gap-2 text-rose-600">
                  <ShieldAlert className="w-5 h-5" />
                  <h3 className="font-bold text-slate-900 text-sm">Active Threat Assessment &amp; Fraud Alerts</h3>
                </div>
                
                <div className="space-y-3">
                  {fraudAlerts.map(alert => (
                    <div key={alert.id} className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start justify-between gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-rose-800 uppercase text-[10px] tracking-wider">{alert.type}</span>
                          <span className="font-mono text-[9px] text-slate-400">{alert.createdDate}</span>
                        </div>
                        <p className="text-slate-700 font-medium">{alert.details}</p>
                        <div className="text-[10px] text-slate-400 font-mono">Card Ref: {alert.cardId} • Customer: {alert.customerName}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold font-mono uppercase text-[9px]">
                          Risk: {alert.riskScore}%
                        </span>
                        
                        <span className="px-2 py-0.5 rounded border border-rose-200 text-rose-700 font-semibold text-[10px]">
                          {alert.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Actions Workstation */}
              <div className="bg-white rounded-xl border border-slate-200/60 p-6 space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Active Security Workstation</h3>
                  <p className="text-xs text-slate-500">Instant administrator interventions for compromised, lost or stolen cards.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cards.map(card => (
                    <div key={card.id} className="p-4 rounded-xl border border-slate-150 bg-slate-50/50 flex flex-col justify-between space-y-4">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-bold text-slate-800 text-xs">{card.customerName}</div>
                          <div className="text-[10px] font-mono text-slate-400">{card.id} • {maskCardNum(card.cardNumber)}</div>
                        </div>
                        
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                          card.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                          card.status === 'Frozen' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {card.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {card.status === 'Active' ? (
                          <button 
                            onClick={() => handleUpdateStatus(card.id, 'Frozen')}
                            className="text-center bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded text-xs font-semibold text-amber-700 cursor-pointer"
                          >
                            Lock Card
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUpdateStatus(card.id, 'Active')}
                            className="text-center bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 p-2 rounded text-xs font-semibold text-emerald-800 cursor-pointer"
                            disabled={card.status === 'Blocked'}
                          >
                            Unlock Card
                          </button>
                        )}

                        <button 
                          onClick={() => {
                            setTargetPinCard(card);
                            setNewPinVal('');
                            setPinModalOpen(true);
                          }}
                          className="text-center bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded text-xs font-semibold text-slate-700 cursor-pointer"
                        >
                          Change PIN
                        </button>

                        <button 
                          onClick={() => handleUpdateStatus(card.id, 'Blocked', 'Stolen/compromised card reported by administrator')}
                          className="text-center bg-rose-50 hover:bg-rose-100 border border-rose-200 p-2 rounded text-xs font-semibold text-rose-800 cursor-pointer"
                          disabled={card.status === 'Blocked'}
                        >
                          Report Stolen
                        </button>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono border-t border-slate-150 pt-2">
                        <span>Device Pairing: {card.deviceVerified ? `Verified (${card.deviceModel})` : 'Unpaired'}</span>
                        <button 
                          onClick={() => handleRegenerate(card.id)}
                          className="text-blue-600 font-bold hover:underline cursor-pointer"
                        >
                          Regenerate Token
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}

        </div>

        {/* ========================================================================================= */}
        {/* ==================================== DRAWER DETAILS ==================================== */}
        {/* ========================================================================================= */}
        {selectedCardId && selectedCard && (
          <div className="w-[380px] border-l border-slate-200/80 bg-white shadow-2xl flex flex-col shrink-0 overflow-hidden relative z-10">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200/50 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Card Details Overview</h4>
                <span className="text-[10px] font-mono text-slate-400">{selectedCard.id}</span>
              </div>
              <button 
                onClick={() => setSelectedCardId(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab selection within drawer */}
            <div className="flex border-b border-slate-100 text-[10px] font-bold text-slate-400 font-sans tracking-wide shrink-0">
              <button 
                onClick={() => setSelectedCardTab('overview')}
                className={`flex-1 py-2 text-center border-b transition ${selectedCardTab === 'overview' ? 'text-blue-600 border-b-blue-600 bg-blue-50/20' : 'hover:bg-slate-50'}`}
              >
                Overview
              </button>
              <button 
                onClick={() => setSelectedCardTab('limits')}
                className={`flex-1 py-2 text-center border-b transition ${selectedCardTab === 'limits' ? 'text-blue-600 border-b-blue-600 bg-blue-50/20' : 'hover:bg-slate-50'}`}
              >
                Limits
              </button>
              <button 
                onClick={() => setSelectedCardTab('transactions')}
                className={`flex-1 py-2 text-center border-b transition ${selectedCardTab === 'transactions' ? 'text-blue-600 border-b-blue-600 bg-blue-50/20' : 'hover:bg-slate-50'}`}
              >
                Txs
              </button>
              <button 
                onClick={() => setSelectedCardTab('security')}
                className={`flex-1 py-2 text-center border-b transition ${selectedCardTab === 'security' ? 'text-blue-600 border-b-blue-600 bg-blue-50/20' : 'hover:bg-slate-50'}`}
              >
                Security
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">

              {/* OVERVIEW TAB */}
              {selectedCardTab === 'overview' && (
                <div className="space-y-4">
                  
                  {/* Visually stunning Card */}
                  <div className="relative bg-slate-900 rounded-xl p-5 text-white shadow-xl border border-slate-800 flex flex-col justify-between h-44 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-indigo-950/20 to-slate-900 pointer-events-none" />
                    
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <div className="font-black tracking-tight text-sm text-slate-100 flex items-center gap-1">
                          <Wallet className="w-3.5 h-3.5 text-blue-500" />
                          WalletPro
                        </div>
                        <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">{selectedCard.cardType}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 font-sans tracking-wide px-2 py-0.5 rounded bg-white/10 uppercase">
                        {selectedCard.network}
                      </span>
                    </div>

                    <div className="font-mono text-sm tracking-widest text-slate-100 font-semibold relative z-10 mt-2">
                      {revealNumMap[selectedCard.id] ? selectedCard.cardNumber.replace(/(.{4})/g, '$1 ') : maskCardNum(selectedCard.cardNumber)}
                    </div>

                    <div className="flex justify-between items-end relative z-10 mt-auto">
                      <div>
                        <div className="text-[7px] uppercase tracking-widest text-slate-400 font-bold">Cardholder</div>
                        <div className="font-sans font-bold text-[10px] text-slate-200 truncate max-w-[150px]">{selectedCard.customerName}</div>
                      </div>

                      <div className="flex gap-4">
                        <div>
                          <div className="text-[7px] uppercase tracking-widest text-slate-400 font-bold">Expiry</div>
                          <div className="font-mono text-[9px] text-slate-200 font-bold">{selectedCard.expiryDate}</div>
                        </div>
                        <div>
                          <div className="text-[7px] uppercase tracking-widest text-slate-400 font-bold">CVV</div>
                          <div className="font-mono text-[9px] text-slate-200 font-bold">
                            {revealCvvMap[selectedCard.id] ? selectedCard.cvv : '•••'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Copy & Reveal Quick buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => toggleRevealNum(selectedCard.id)}
                      className="text-center py-1.5 border border-slate-200 rounded hover:bg-slate-50 font-bold text-[10px] text-slate-600 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {revealNumMap[selectedCard.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      Credentials Info
                    </button>
                    <button 
                      onClick={() => toggleRevealCvv(selectedCard.id)}
                      className="text-center py-1.5 border border-slate-200 rounded hover:bg-slate-50 font-bold text-[10px] text-slate-600 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Reveal CVV Code
                    </button>
                  </div>

                  {/* Details block */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/50 space-y-2.5">
                    <h5 className="font-bold text-slate-800 text-[10px] uppercase font-mono tracking-wider border-b pb-1">Primary Parameters</h5>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Customer Email:</span>
                      <strong className="text-slate-900 font-normal">{selectedCard.customerEmail}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Customer Phone:</span>
                      <strong className="text-slate-900 font-normal">{selectedCard.customerPhone}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Network/Brand:</span>
                      <strong className="text-slate-900 font-mono font-normal">{selectedCard.network}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Currency Type:</span>
                      <strong className="text-slate-900 font-mono font-normal">{selectedCard.currency}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Issuing Date:</span>
                      <strong className="text-slate-900 font-mono font-normal">{selectedCard.issueDate}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Active Country:</span>
                      <strong className="text-slate-900 font-normal">{selectedCard.country}</strong>
                    </div>

                    {selectedCard.compromisedReason && (
                      <div className="border-t border-rose-100 pt-2 text-rose-700">
                        <strong className="block text-[10px] font-bold">Compromise Statement:</strong>
                        <p className="mt-0.5">{selectedCard.compromisedReason}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions list */}
                  <div className="space-y-2">
                    <h5 className="font-bold text-slate-800 text-[10px] uppercase font-mono tracking-wider">Administrative Interventions</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedCard.status === 'Active' ? (
                        <button 
                          onClick={() => handleUpdateStatus(selectedCard.id, 'Frozen')}
                          className="p-2 border border-amber-200 hover:bg-amber-50 text-amber-800 font-semibold rounded text-center transition cursor-pointer"
                        >
                          Lock Card
                        </button>
                      ) : selectedCard.status === 'Frozen' ? (
                        <button 
                          onClick={() => handleUpdateStatus(selectedCard.id, 'Active')}
                          className="p-2 border border-emerald-200 hover:bg-emerald-50 text-emerald-800 font-semibold rounded text-center transition cursor-pointer"
                        >
                          Unlock Card
                        </button>
                      ) : null}

                      <button 
                        onClick={() => handleUpdateStatus(selectedCard.id, 'Blocked', 'Admin terminated')}
                        className="p-2 border border-rose-200 hover:bg-rose-50 text-rose-800 font-semibold rounded text-center transition cursor-pointer"
                        disabled={selectedCard.status === 'Blocked'}
                      >
                        Terminate Card
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* LIMITS TAB */}
              {selectedCardTab === 'limits' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 space-y-3">
                    <h5 className="font-bold text-slate-800 text-[10px] uppercase font-mono tracking-wider">Velocity Restrictions</h5>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Daily Spend Limit:</span>
                        <strong className="font-mono">{formatCurrency(selectedCard.dailyLimit, selectedCard.currency)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Weekly Spend Limit:</span>
                        <strong className="font-mono">{formatCurrency(selectedCard.weeklyLimit, selectedCard.currency)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Monthly Spend Limit:</span>
                        <strong className="font-mono">{formatCurrency(selectedCard.monthlyLimit, selectedCard.currency)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 space-y-3">
                    <h5 className="font-bold text-slate-800 text-[10px] uppercase font-mono tracking-wider">Usage Channel Caps</h5>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">ATM Cash Access:</span>
                        <strong className="font-mono">{formatCurrency(selectedCard.atmLimit, selectedCard.currency)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Online Purchases:</span>
                        <strong className="font-mono">{formatCurrency(selectedCard.onlineLimit, selectedCard.currency)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">In-Store Merchant POS:</span>
                        <strong className="font-mono">{formatCurrency(selectedCard.posLimit, selectedCard.currency)}</strong>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setTargetLimitCard(selectedCard);
                      setDailyLimitVal(String(selectedCard.dailyLimit));
                      setWeeklyLimitVal(String(selectedCard.weeklyLimit));
                      setMonthlyLimitVal(String(selectedCard.monthlyLimit));
                      setAtmLimitVal(String(selectedCard.atmLimit));
                      setOnlineLimitVal(String(selectedCard.onlineLimit));
                      setPosLimitVal(String(selectedCard.posLimit));
                      setLimitModalOpen(true);
                    }}
                    className="w-full text-center py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition cursor-pointer"
                  >
                    Adjust All Spending Caps
                  </button>
                </div>
              )}

              {/* TRANSACTIONS TAB */}
              {selectedCardTab === 'transactions' && (
                <div className="space-y-3">
                  <h5 className="font-bold text-slate-800 text-[10px] uppercase font-mono tracking-wider">Authorized Logs</h5>
                  {selectedCardTransactions.length === 0 ? (
                    <div className="text-slate-400 text-center py-8">No authorizations logged on this token.</div>
                  ) : (
                    selectedCardTransactions.map(tx => (
                      <div key={tx.id} className="p-3 bg-slate-50 border border-slate-200/50 rounded-lg flex justify-between items-center text-xs">
                        <div>
                          <div className="font-semibold text-slate-900">{tx.merchantName}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{tx.createdDate}</div>
                        </div>

                        <div className="text-right">
                          <strong className="font-mono block text-slate-900">{formatCurrency(tx.amount, tx.currency)}</strong>
                          <span className={`text-[8px] font-bold uppercase ${
                            tx.status === 'Settled' ? 'text-emerald-600' :
                            tx.status === 'Declined' ? 'text-rose-600' : 'text-slate-400'
                          }`}>{tx.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* SECURITY TAB */}
              {selectedCardTab === 'security' && (
                <div className="space-y-4">
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 space-y-3">
                    <h5 className="font-bold text-slate-800 text-[10px] uppercase font-mono tracking-wider">Channel Controls</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Online Transactions:</span>
                        <button 
                          onClick={() => handleToggleSecurityChannel(selectedCard, 'online')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                            selectedCard.onlinePaymentsEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {selectedCard.onlinePaymentsEnabled ? 'ENABLED' : 'DISABLED'}
                        </button>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">ATM Withdrawals:</span>
                        <button 
                          onClick={() => handleToggleSecurityChannel(selectedCard, 'atm')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                            selectedCard.atmEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                          }`}
                          disabled={selectedCard.cardType === 'Virtual'}
                        >
                          {selectedCard.atmEnabled ? 'ENABLED' : 'DISABLED'}
                        </button>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">In-Store Contactless:</span>
                        <button 
                          onClick={() => handleToggleSecurityChannel(selectedCard, 'contactless')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                            selectedCard.contactlessEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                          }`}
                          disabled={selectedCard.cardType === 'Virtual'}
                        >
                          {selectedCard.contactlessEnabled ? 'ENABLED' : 'DISABLED'}
                        </button>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Cross-Border/Intl:</span>
                        <button 
                          onClick={() => handleToggleSecurityChannel(selectedCard, 'international')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                            selectedCard.internationalEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {selectedCard.internationalEnabled ? 'ENABLED' : 'DISABLED'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-bold text-slate-800 text-[10px] uppercase font-mono tracking-wider">Device &amp; Token Verifications</h5>
                    <div className="p-3 rounded border border-slate-200/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="font-semibold text-slate-900">Device Pairing</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {selectedCard.deviceVerified ? `Verified (${selectedCard.deviceModel})` : 'No verified device'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setTargetPinCard(selectedCard);
                      setNewPinVal('');
                      setPinModalOpen(true);
                    }}
                    className="w-full text-center py-2 border border-slate-200 rounded hover:bg-slate-50 text-slate-700 font-bold transition cursor-pointer"
                  >
                    Reset PIN Code
                  </button>

                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* ========================================================================================= */}
      {/* ================================== ISSUE NEW CARD MODAL ================================== */}
      {/* ========================================================================================= */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col relative">
            <div className="p-4 border-b border-slate-200/60 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Issue Commercial Corporate Card</h3>
              </div>
              <button 
                onClick={() => setIsIssueModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIssueCard} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Card Type</label>
                  <div className="flex border rounded overflow-hidden">
                    <button 
                      type="button"
                      onClick={() => setIssueCardType('Virtual')}
                      className={`flex-1 py-2 font-bold text-center cursor-pointer transition ${
                        issueCardType === 'Virtual' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Virtual Card
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIssueCardType('Physical')}
                      className={`flex-1 py-2 font-bold text-center cursor-pointer transition ${
                        issueCardType === 'Physical' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Physical Card
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Payment Network</label>
                  <select 
                    value={issueNetwork}
                    onChange={(e) => setIssueNetwork(e.target.value as any)}
                    className="w-full text-xs font-medium border border-slate-200 rounded p-2 focus:outline-none bg-white"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Amex">Amex</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cardholder Name</label>
                <input 
                  type="text"
                  value={issueCustomerName}
                  onChange={(e) => setIssueCustomerName(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded p-2 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Customer Email</label>
                  <input 
                    type="email"
                    value={issueCustomerEmail}
                    onChange={(e) => setIssueCustomerEmail(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-200 rounded p-2 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Customer Phone</label>
                  <input 
                    type="text"
                    value={issueCustomerPhone}
                    onChange={(e) => setIssueCustomerPhone(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-200 rounded p-2 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Linked Wallet ID</label>
                  <select 
                    value={issueLinkedWallet}
                    onChange={(e) => {
                      setIssueLinkedWallet(e.target.value);
                      const wal = wallets.find(w => w.id === e.target.value);
                      if (wal) {
                        setIssueCurrency(wal.currency);
                      }
                    }}
                    className="w-full text-xs font-medium border border-slate-200 rounded p-2 focus:outline-none bg-white"
                  >
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.customerName} ({w.id} - {w.currency})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Initial Limit</label>
                  <input 
                    type="number"
                    value={issueLimit}
                    onChange={(e) => setIssueLimit(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-200 rounded p-2 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {issueCardType === 'Physical' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mailing Address (Standard Courier)</label>
                  <textarea 
                    value={issueShippingAddress}
                    onChange={(e) => setIssueShippingAddress(e.target.value)}
                    rows={2}
                    className="w-full text-xs font-medium border border-slate-200 rounded p-2 focus:outline-none resize-none"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg font-bold text-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition cursor-pointer"
                >
                  Issue Token
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* ================================== EDIT LIMITS MODAL ================================== */}
      {/* ========================================================================================= */}
      {limitModalOpen && targetLimitCard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col relative">
            <div className="p-4 border-b border-slate-200/60 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Configure Spend Caps ({targetLimitCard.id})</h3>
              <button onClick={() => setLimitModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLimits} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Daily Cap ({targetLimitCard.currency})</label>
                  <input type="number" value={dailyLimitVal} onChange={(e) => setDailyLimitVal(e.target.value)} className="w-full border rounded p-2 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Weekly Cap ({targetLimitCard.currency})</label>
                  <input type="number" value={weeklyLimitVal} onChange={(e) => setWeeklyLimitVal(e.target.value)} className="w-full border rounded p-2 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Monthly Cap ({targetLimitCard.currency})</label>
                  <input type="number" value={monthlyLimitVal} onChange={(e) => setMonthlyLimitVal(e.target.value)} className="w-full border rounded p-2 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">ATM Withdrawal limit</label>
                  <input type="number" value={atmLimitVal} onChange={(e) => setAtmLimitVal(e.target.value)} className="w-full border rounded p-2 focus:outline-none" disabled={targetLimitCard.cardType === 'Virtual'} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Online Purchase Cap</label>
                  <input type="number" value={onlineLimitVal} onChange={(e) => setOnlineLimitVal(e.target.value)} className="w-full border rounded p-2 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">POS Cap</label>
                  <input type="number" value={posLimitVal} onChange={(e) => setPosLimitVal(e.target.value)} className="w-full border rounded p-2 focus:outline-none" />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 mt-6">
                <button type="button" onClick={() => setLimitModalOpen(false)} className="px-4 py-2 border rounded hover:bg-slate-50 font-bold text-slate-700 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded cursor-pointer">Apply Caps</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* ================================== RESET PIN MODAL ================================== */}
      {/* ========================================================================================= */}
      {pinModalOpen && targetPinCard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden flex flex-col relative">
            <div className="p-4 border-b border-slate-200/60 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Reset PIN Credentials</h3>
              <button onClick={() => setPinModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePin} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">New 4-Digit Security PIN</label>
                <input 
                  type="password" 
                  maxLength={4}
                  placeholder="••••"
                  value={newPinVal}
                  onChange={(e) => setNewPinVal(e.target.value.replace(/\D/g, ''))}
                  className="w-full border rounded p-2.5 text-center text-lg font-mono tracking-widest focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 mt-6">
                <button type="button" onClick={() => setPinModalOpen(false)} className="px-4 py-2 border rounded hover:bg-slate-50 font-bold text-slate-700 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded cursor-pointer">Reset PIN</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* =============================== EDIT RESTRICTIONS MODAL =============================== */}
      {/* ========================================================================================= */}
      {restrictCard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col relative">
            <div className="p-4 border-b border-slate-200/60 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Restrict Card Merchants &amp; Regions</h3>
              <button onClick={() => setRestrictCard(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRestrictions} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Blocked Merchants (Comma separated)</label>
                <input 
                  type="text" 
                  value={merchantRestStr}
                  placeholder="GamblingHub, CryptoExchange, LotteryExpress"
                  onChange={(e) => setMerchantRestStr(e.target.value)}
                  className="w-full border rounded p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Blocked Country Codes (ISO Comma separated)</label>
                <input 
                  type="text" 
                  value={countryRestStr}
                  placeholder="KP, IR, SY"
                  onChange={(e) => setCountryRestStr(e.target.value)}
                  className="w-full border rounded p-2 focus:outline-none font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Blocked Category Types (Comma separated)</label>
                <input 
                  type="text" 
                  value={categoryRestStr}
                  placeholder="Gaming, Lottery, Crypto"
                  onChange={(e) => setCategoryRestStr(e.target.value)}
                  className="w-full border rounded p-2 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 mt-6">
                <button type="button" onClick={() => setRestrictCard(null)} className="px-4 py-2 border rounded hover:bg-slate-50 font-bold text-slate-700 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded cursor-pointer">Apply Rules</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
