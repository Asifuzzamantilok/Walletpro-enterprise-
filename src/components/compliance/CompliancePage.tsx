import React, { useState, useEffect } from 'react';
import { 
  Shield, Check, X, AlertTriangle, Search, Filter, ArrowUpDown, ChevronDown, 
  ChevronRight, ArrowUpRight, Clock, User, ShieldAlert, FileText, Ban, Eye, RotateCw, 
  ZoomIn, ZoomOut, Maximize2, MoreHorizontal, UserCheck, Play, HelpCircle, 
  Activity, CheckCircle, RotateCcw, AlertCircle, RefreshCw, Send, Plus, 
  Download, ListFilter, Trash, Star, Flag, Link, Lock, Info, Landmark, ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { ComplianceService } from './ComplianceService';
import { 
  KYCApplication, 
  ComplianceCase, 
  ComplianceNotification, 
  KYCStats, 
  KYCDocument, 
  KYCApplicationStatus, 
  KYCPriority,
  AccountTier
} from './ComplianceTypes';

interface CompliancePageProps {
  activeSubTab: string; // 'kyc-queue' | 'identity-verification' | 'aml-screening' | 'sanctions-screening' | 'pep-screening' | 'risk-reviews' | 'compliance-cases' | 'rejected-applications'
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
  onSelectTab?: (tab: string) => void;
}

export function CompliancePage({ activeSubTab, onToast, onSelectTab }: CompliancePageProps) {
  // Master state
  const [kycApps, setKycApps] = useState<KYCApplication[]>([]);
  const [cases, setCases] = useState<ComplianceCase[]>([]);
  const [notifications, setNotifications] = useState<ComplianceNotification[]>([]);
  const [stats, setStats] = useState<KYCStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Queue state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [countryFilter, setCountryFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [reviewerFilter, setReviewerFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<keyof KYCApplication>('submissionDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  
  // Dialog / Detail Drawer States
  const [selectedApp, setSelectedApp] = useState<KYCApplication | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<'overview' | 'identity' | 'documents' | 'aml_pep' | 'notes' | 'audit'>('overview');
  
  // Interactive Document Viewer State
  const [activeDocIndex, setActiveDocIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isSideBySide, setIsSideBySide] = useState<boolean>(false);
  
  // Notes / Input States
  const [newNoteText, setNewNoteText] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [reviewerName, setReviewerName] = useState('Sarah Jenkins'); // Simulated reviewer
  
  // Action Dialog States
  const [showActionDialog, setShowActionDialog] = useState<string | null>(null); // 'Approve' | 'Reject' | 'Request More Information' | 'Escalate' | 'Assign Reviewer' | 'Change Priority' | 'Freeze Account' | 'Flag Customer'
  const [assignedReviewerInput, setAssignedReviewerInput] = useState('');
  const [priorityInput, setPriorityInput] = useState<KYCPriority>('Medium');

  // Case Management states
  const [isCreateCaseOpen, setIsCreateCaseOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<ComplianceCase | null>(null);
  const [newCaseSubject, setNewCaseSubject] = useState('');
  const [newCasePriority, setNewCasePriority] = useState<KYCPriority>('Medium');
  const [newCaseCustomer, setNewCaseCustomer] = useState('');
  const [newCaseInvestigator, setNewCaseInvestigator] = useState('');
  const [caseNoteInput, setCaseNoteInput] = useState('');
  const [evidenceFileName, setEvidenceFileName] = useState('');
  const [evidenceFileType, setEvidenceFileType] = useState('Passport Copy');
  const [showResolveCaseDialog, setShowResolveCaseDialog] = useState(false);
  const [caseResolution, setCaseResolution] = useState('Permanent Freeze & Lock');
  const [caseResolutionReason, setCaseResolutionReason] = useState('');

  // Column Visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    customer: true,
    country: true,
    tier: true,
    submissionDate: true,
    status: true,
    riskScore: true,
    verification: true,
    reviewer: true,
    sla: true,
    priority: true,
    actions: true
  });

  // Load everything
  const loadData = async () => {
    try {
      setLoading(true);
      const appsData = await ComplianceService.getKYCApplications();
      const casesData = await ComplianceService.getComplianceCases();
      const notificationsData = await ComplianceService.getComplianceNotifications();
      const statsData = await ComplianceService.getKYCStats();

      setKycApps(appsData);
      setCases(casesData);
      setNotifications(notificationsData);
      setStats(statsData);
    } catch (e: any) {
      onToast('Error', 'Failed to retrieve compliance and KYC operations data.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    onToast('Data Synced', 'Compliance data packages reloaded from core ledger.', 'success');
  };

  // Status updates
  const handleUpdateStatus = async (status: KYCApplicationStatus, reason: string) => {
    if (!selectedApp) return;
    try {
      const updated = await ComplianceService.updateKYCApplicationStatus(selectedApp.id, status, reason, reviewerName);
      setKycApps(prev => prev.map(a => a.id === updated.id ? updated : a));
      setSelectedApp(updated);
      setShowActionDialog(null);
      setActionReason('');
      onToast('Status Updated', `Application ${updated.id} status changed to ${status}.`, 'success');
      
      // Update statistics
      const statsData = await ComplianceService.getKYCStats();
      setStats(statsData);
    } catch (e: any) {
      onToast('Error', e.message || 'Failed to update status', 'warning');
    }
  };

  const handleAddNote = async () => {
    if (!selectedApp || !newNoteText.trim()) return;
    try {
      const updated = await ComplianceService.addReviewerNote(selectedApp.id, newNoteText, reviewerName);
      setKycApps(prev => prev.map(a => a.id === updated.id ? updated : a));
      setSelectedApp(updated);
      setNewNoteText('');
      onToast('Note Saved', 'Review note written to compliance ledger.', 'success');
    } catch (e: any) {
      onToast('Error', 'Failed to add note', 'warning');
    }
  };

  const handleAssignReviewer = async (reviewer: string) => {
    if (!selectedApp) return;
    try {
      const updated = await ComplianceService.assignReviewer(selectedApp.id, reviewer);
      setKycApps(prev => prev.map(a => a.id === updated.id ? updated : a));
      setSelectedApp(updated);
      setShowActionDialog(null);
      onToast('Reviewer Assigned', `Case assigned to ${reviewer}.`, 'success');
    } catch (e: any) {
      onToast('Error', 'Failed to assign reviewer', 'warning');
    }
  };

  const handleChangePriority = async (priority: KYCPriority) => {
    if (!selectedApp) return;
    try {
      const updated = await ComplianceService.changePriority(selectedApp.id, priority);
      setKycApps(prev => prev.map(a => a.id === updated.id ? updated : a));
      setSelectedApp(updated);
      setShowActionDialog(null);
      onToast('Priority Updated', `SLA priorities escalated to ${priority}.`, 'success');
    } catch (e: any) {
      onToast('Error', 'Failed to update priority', 'warning');
    }
  };

  // Case updates
  const handleCreateCase = async () => {
    if (!newCaseCustomer || !newCaseSubject) {
      onToast('Missing Data', 'Please provide a customer name and case subject.', 'warning');
      return;
    }
    try {
      const dummyApp = kycApps.find(a => a.customerName === newCaseCustomer) || selectedApp;
      const newCase = await ComplianceService.createComplianceCase({
        customerName: newCaseCustomer,
        customerId: dummyApp?.customerId || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        subject: newCaseSubject,
        priority: newCasePriority,
        investigator: newCaseInvestigator || reviewerName,
        status: 'Open',
        applicationId: dummyApp?.id
      });
      setCases(prev => [newCase, ...prev]);
      setIsCreateCaseOpen(false);
      setNewCaseCustomer('');
      setNewCaseSubject('');
      setNewCaseInvestigator('');
      onToast('Investigation Open', `Compliance folder ${newCase.id} created successfully.`, 'success');
    } catch (e: any) {
      onToast('Error', 'Failed to open case.', 'warning');
    }
  };

  const handleAddCaseNote = async () => {
    if (!selectedCase || !caseNoteInput.trim()) return;
    try {
      const updated = await ComplianceService.addCaseNote(selectedCase.id, caseNoteInput, reviewerName);
      setCases(prev => prev.map(c => c.id === updated.id ? updated : c));
      setSelectedCase(updated);
      setCaseNoteInput('');
      onToast('Note Added', 'Investigation logs updated.', 'success');
    } catch (e: any) {
      onToast('Error', 'Failed to save case note.', 'warning');
    }
  };

  const handleUploadEvidence = async () => {
    if (!selectedCase || !evidenceFileName.trim()) return;
    try {
      const updated = await ComplianceService.uploadEvidence(
        selectedCase.id,
        evidenceFileType,
        evidenceFileName,
        '2.4 MB',
        reviewerName
      );
      setCases(prev => prev.map(c => c.id === updated.id ? updated : c));
      setSelectedCase(updated);
      setEvidenceFileName('');
      onToast('Evidence Logged', `File ${evidenceFileName} uploaded and cryptographically hashed.`, 'success');
    } catch (e: any) {
      onToast('Error', 'Failed to upload evidence.', 'warning');
    }
  };

  const handleResolveCase = async () => {
    if (!selectedCase || !caseResolutionReason.trim()) {
      onToast('Reason Required', 'Please enter a resolution justification.', 'warning');
      return;
    }
    try {
      const updated = await ComplianceService.updateComplianceCaseStatus(
        selectedCase.id,
        'Closed',
        caseResolution,
        caseResolutionReason,
        reviewerName
      );
      setCases(prev => prev.map(c => c.id === updated.id ? updated : c));
      setSelectedCase(updated);
      setShowResolveCaseDialog(false);
      setCaseResolutionReason('');
      onToast('Case Closed', `Investigation ${selectedCase.id} resolved as ${caseResolution}.`, 'success');
    } catch (e: any) {
      onToast('Error', 'Failed to resolve case.', 'warning');
    }
  };

  // False Positive watchlists management
  const handleToggleFalsePositive = async (type: 'aml' | 'sanctions' | 'pep') => {
    if (!selectedApp) return;
    const appCopy = { ...selectedApp };
    let field: any;
    if (type === 'aml') field = appCopy.amlResults;
    else if (type === 'sanctions') field = appCopy.sanctionsResults;
    else if (type === 'pep') field = appCopy.pepResults;

    const currentStatus = field.falsePositiveStatus || 'Pending';
    const nextStatus = currentStatus === 'Dismissed - False Positive' ? 'Confirmed Match' : 'Dismissed - False Positive';
    
    field.falsePositiveStatus = nextStatus;

    // Create an audit trail log
    const updatedApp = {
      ...appCopy,
      auditTimeline: [
        {
          id: `aud-${Math.random().toString(36).substr(2, 9)}`,
          reviewer: reviewerName,
          action: `Watchlist Dismissal: ${type.toUpperCase()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          reason: `Watchlist hit flagged as: ${nextStatus}.`,
          previousStatus: appCopy.status,
          newStatus: appCopy.status
        },
        ...appCopy.auditTimeline
      ]
    };

    setKycApps(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
    setSelectedApp(updatedApp);
    onToast('Screening Updated', `Watchlist entry marked as ${nextStatus}.`, 'info');
  };

  // Bulk actions
  const handleBulkAction = async (action: 'Approve' | 'Assign' | 'Reject') => {
    if (selectedAppIds.length === 0) return;
    try {
      const promises = selectedAppIds.map(id => {
        if (action === 'Approve') {
          return ComplianceService.updateKYCApplicationStatus(id, 'Approved', 'Approved via bulk operation action.', reviewerName);
        } else if (action === 'Reject') {
          return ComplianceService.updateKYCApplicationStatus(id, 'Rejected', 'Rejected via bulk operation action.', reviewerName);
        } else {
          return ComplianceService.assignReviewer(id, reviewerName);
        }
      });
      await Promise.all(promises);
      const updatedApps = await ComplianceService.getKYCApplications();
      setKycApps(updatedApps);
      setSelectedAppIds([]);
      onToast('Bulk Action Complete', `Successfully performed bulk ${action} on ${selectedAppIds.length} application files.`, 'success');
      
      const statsData = await ComplianceService.getKYCStats();
      setStats(statsData);
    } catch (e: any) {
      onToast('Error', 'Bulk compliance update failed.', 'warning');
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Application ID', 'Customer Name', 'Email', 'Country', 'Account Tier', 'Submission Date', 'Current Status', 'Risk Score', 'Priority'];
    const rows = filteredApps.map(a => [
      a.id, a.customerName, a.customerEmail, a.country, a.accountTier, a.submissionDate, a.status, a.riskScore, a.priority
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `WalletPro_KYC_Queue_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast('CSV Exported', 'KYC ledger database table downloaded to local system.', 'success');
  };

  // Filters logic
  // Determine filters based on subTab click in sidebar
  useEffect(() => {
    if (activeSubTab === 'rejected-applications') {
      setStatusFilter('Rejected');
    } else if (activeSubTab === 'aml-screening') {
      setStatusFilter('All');
      setRiskFilter('High'); // Focus high risk for screening
    } else if (activeSubTab === 'identity-verification') {
      setStatusFilter('Pending Review');
    } else {
      setStatusFilter('All');
    }
  }, [activeSubTab]);

  const filteredApps = kycApps.filter(app => {
    // Search filter across: Name, Email, Phone, AppId, CustId, Passport, NationalId
    const term = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      app.customerName.toLowerCase().includes(term) ||
      app.customerEmail.toLowerCase().includes(term) ||
      app.customerPhone.includes(term) ||
      app.id.toLowerCase().includes(term) ||
      app.customerId.toLowerCase().includes(term) ||
      (app.passportNumber && app.passportNumber.toLowerCase().includes(term)) ||
      (app.nationalId && app.nationalId.toLowerCase().includes(term));

    // Status filter
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    
    // Country filter
    const matchesCountry = countryFilter === 'All' || app.country === countryFilter;

    // Risk level filter
    const matchesRisk = riskFilter === 'All' || app.riskLevel === riskFilter;

    // Tier filter
    const matchesTier = tierFilter === 'All' || app.accountTier === tierFilter;

    // Reviewer filter
    const matchesReviewer = reviewerFilter === 'All' || app.assignedReviewer === reviewerFilter;

    return matchesSearch && matchesStatus && matchesCountry && matchesRisk && matchesTier && matchesReviewer;
  });

  // Sorting logic
  const sortedApps = [...filteredApps].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = (bVal as string).toLowerCase();
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalItems = sortedApps.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedApps.slice(indexOfFirstItem, indexOfLastItem);

  const countries = Array.from(new Set(kycApps.map(a => a.country)));
  const reviewers = Array.from(new Set(kycApps.map(a => a.assignedReviewer)));

  // Charts data
  const riskDistributionData = [
    { name: 'Low Risk', value: kycApps.filter(a => a.riskLevel === 'Low').length, color: '#10B981' },
    { name: 'Medium Risk', value: kycApps.filter(a => a.riskLevel === 'Medium').length, color: '#F59E0B' },
    { name: 'High Risk', value: kycApps.filter(a => a.riskLevel === 'High').length, color: '#EF4444' },
    { name: 'Critical Risk', value: kycApps.filter(a => a.riskLevel === 'Critical').length, color: '#7F1D1D' }
  ];

  const approvalRateData = [
    { name: 'Mon', approved: 4, rejected: 1 },
    { name: 'Tue', approved: 5, rejected: 0 },
    { name: 'Wed', approved: 7, rejected: 2 },
    { name: 'Thu', approved: 3, rejected: 1 },
    { name: 'Fri', approved: 6, rejected: 3 },
    { name: 'Sat', approved: 2, rejected: 1 },
    { name: 'Sun', approved: stats?.approvedToday || 2, rejected: stats?.rejectedToday || 1 }
  ];

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] py-12">
        <div className="flex items-center gap-3 text-slate-500 animate-pulse text-sm font-semibold">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          Synchronizing compliance ledger packets...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1.5">
            <Shield className="w-4 h-4" /> Compliance Operations
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Enterprise Compliance & KYC Command
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono border font-semibold uppercase tracking-wider">
              Secure Hub
            </span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Real-time biometric validation, PEP/Sanctions screening list overrides, custom risk score assessments, and high-tier audit ledger logs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-500' : ''}`} />
            Sync Ledger
          </button>
          
          <button 
            onClick={() => setIsCreateCaseOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all cursor-pointer shadow-sm shadow-blue-500/10"
          >
            <Plus className="w-3.5 h-3.5" />
            Open Compliance Case
          </button>
        </div>
      </div>

      {/* Stats Cards Section */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <span className="text-slate-400 font-medium text-xs">Pending Reviews</span>
              <div className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800 font-mono">{stats.pendingReviews}</span>
              <span className="text-[10px] font-semibold text-yellow-700 bg-yellow-100/50 px-1.5 py-0.2 rounded font-mono">
                SLA active
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Requires reviewer assignment</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <span className="text-slate-400 font-medium text-xs">Approved Today</span>
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800 font-mono">{stats.approvedToday}</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/50 px-1.5 py-0.2 rounded font-mono">
                98% clean
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Approved for account sweep</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <span className="text-slate-400 font-medium text-xs">Sanction Alerts</span>
              <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800 font-mono">{stats.sanctionMatchesCount}</span>
              <span className="text-[10px] font-semibold text-red-700 bg-red-100/50 px-1.5 py-0.2 rounded font-mono">
                High Priority
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Active OFAC / EU list matches</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <span className="text-slate-400 font-medium text-xs">PEP Screening Hits</span>
              <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                <User className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800 font-mono">{stats.pepMatchesCount}</span>
              <span className="text-[10px] font-semibold text-purple-700 bg-purple-100/50 px-1.5 py-0.2 rounded font-mono">
                VIP review
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Politically exposed persons</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm hover:shadow-md transition-all col-span-2 lg:col-span-1">
            <div className="flex justify-between items-start">
              <span className="text-slate-400 font-medium text-xs">Manual Escalations</span>
              <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800 font-mono">{stats.manualReviewsCount}</span>
              <span className="text-[10px] font-semibold text-orange-700 bg-orange-100/50 px-1.5 py-0.2 rounded font-mono">
                Escalated
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">L3 Senior Review queue</p>
          </div>
        </div>
      )}

      {/* Analytics Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts: Left Area */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Compliance & KYC Processing Volume</h3>
              <p className="text-[11px] text-slate-400">Weekly resolution metrics for digital bank verification tiers</p>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
              SLA Compliance 98.4%
            </span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={approvalRateData}>
                <defs>
                  <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="approved" name="Approved Cases" stroke="#10B981" fillOpacity={1} fill="url(#colorApproved)" strokeWidth={2} />
                <Area type="monotone" dataKey="rejected" name="Rejected Cases" stroke="#EF4444" fillOpacity={1} fill="url(#colorRejected)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts: Right Risk Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Queue Risk Profile Distribution</h3>
          <p className="text-[11px] text-slate-400 mb-4">Live portfolio categorization by automated risk score calculation</p>
          <div className="h-32 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {riskDistributionData.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                <span>{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Command Workspace (Tabs/Queues) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        
        {/* Table Controls (Search, Filters, CSV Export) */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search inputs */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Customer name, Email, ID, National ID, Passport..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white placeholder-slate-400 shadow-sm"
              />
            </div>

            {/* Quick action controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Bulk actions */}
              {selectedAppIds.length > 0 && (
                <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg text-xs text-blue-700 font-semibold shadow-sm animate-fade-in">
                  <span>{selectedAppIds.length} Selected</span>
                  <div className="w-px h-4 bg-blue-200 mx-1.5" />
                  <button 
                    onClick={() => handleBulkAction('Approve')}
                    className="hover:text-emerald-700 font-bold transition-all cursor-pointer"
                  >
                    Bulk Approve
                  </button>
                  <span className="text-blue-300">•</span>
                  <button 
                    onClick={() => handleBulkAction('Reject')}
                    className="hover:text-red-700 font-bold transition-all cursor-pointer"
                  >
                    Bulk Reject
                  </button>
                </div>
              )}

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs text-slate-700 font-semibold cursor-pointer shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Advanced Multi-filters Row */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="More Info Requested">More Info Requested</option>
                <option value="Escalated">Escalated</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Risk Tier</label>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="All">All Risks</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
                <option value="Critical">Critical Risk</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Account Tier</label>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="All">All Tiers</option>
                <option value="Tier 1">Tier 1</option>
                <option value="Tier 2">Tier 2</option>
                <option value="Tier 3 (VIP)">Tier 3 (VIP)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Country</label>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="All">All Countries</option>
                {countries.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reviewer</label>
              <select
                value={reviewerFilter}
                onChange={(e) => setReviewerFilter(e.target.value)}
                className="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="All">All Reviewers</option>
                <option value="Unassigned">Unassigned</option>
                {reviewers.filter(r => r !== 'Unassigned').map((r, idx) => (
                  <option key={idx} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end justify-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('All');
                  setRiskFilter('All');
                  setTierFilter('All');
                  setCountryFilter('All');
                  setReviewerFilter('All');
                }}
                className="w-full p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Professional Queue Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedAppIds.length === currentItems.length && currentItems.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAppIds(currentItems.map(a => a.id));
                      } else {
                        setSelectedAppIds([]);
                      }
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="p-3 cursor-pointer" onClick={() => { setSortField('id'); setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                  Application ID <ArrowUpDown className="w-3 h-3 inline ml-1 text-slate-300" />
                </th>
                <th className="p-3 cursor-pointer" onClick={() => { setSortField('customerName'); setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                  Customer <ArrowUpDown className="w-3 h-3 inline ml-1 text-slate-300" />
                </th>
                <th className="p-3 cursor-pointer" onClick={() => { setSortField('country'); setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                  Country <ArrowUpDown className="w-3 h-3 inline ml-1 text-slate-300" />
                </th>
                <th className="p-3 text-center">Tier</th>
                <th className="p-3 cursor-pointer" onClick={() => { setSortField('submissionDate'); setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                  Submission Date <ArrowUpDown className="w-3 h-3 inline ml-1 text-slate-300" />
                </th>
                <th className="p-3 text-center">Risk Score</th>
                <th className="p-3">Current Status</th>
                <th className="p-3">SLA Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 font-semibold">
                    No KYC applications match the selected criteria.
                  </td>
                </tr>
              ) : (
                currentItems.map((app) => {
                  const isChecked = selectedAppIds.includes(app.id);
                  return (
                    <tr 
                      key={app.id} 
                      className={`hover:bg-slate-50/50 transition-colors ${isChecked ? 'bg-blue-50/10' : ''}`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAppIds(prev => [...prev, app.id]);
                            } else {
                              setSelectedAppIds(prev => prev.filter(id => id !== app.id));
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">{app.id}</td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{app.customerName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{app.customerEmail}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-500 font-semibold">{app.country}</td>
                      <td className="p-3 text-center">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                          {app.accountTier.replace('Tier ', 'T')}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono">{app.submissionDate}</td>
                      <td className="p-3">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1.5 w-full max-w-[100px]">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${
                                  app.riskScore > 75 ? 'bg-red-500' :
                                  app.riskScore > 50 ? 'bg-orange-500' :
                                  app.riskScore > 25 ? 'bg-yellow-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${app.riskScore}%` }}
                              />
                            </div>
                            <span className="font-mono text-[10px] font-bold text-slate-600 shrink-0">{app.riskScore}</span>
                          </div>
                          <span className={`text-[9px] font-bold uppercase ${
                            app.riskLevel === 'Critical' ? 'text-red-800' :
                            app.riskLevel === 'High' ? 'text-red-500' :
                            app.riskLevel === 'Medium' ? 'text-yellow-600' : 'text-emerald-600'
                          }`}>
                            {app.riskLevel}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          app.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          app.status === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                          app.status === 'Pending Review' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          app.status === 'Escalated' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            app.status === 'Approved' ? 'bg-emerald-500' :
                            app.status === 'Rejected' ? 'bg-red-500' :
                            app.status === 'Pending Review' ? 'bg-blue-500' :
                            app.status === 'Escalated' ? 'bg-orange-500' : 'bg-slate-400'
                          }`} />
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {app.status === 'Pending Review' ? (
                          app.slaTimeLeftSeconds > 0 ? (
                            <span className="text-[10px] text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-md font-mono">
                              {Math.floor(app.slaTimeLeftSeconds / 3600)}h left
                            </span>
                          ) : (
                            <span className="text-[10px] text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md font-mono font-bold animate-pulse">
                              SLA BREACH
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">-</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setIsDetailOpen(true);
                            setDetailTab('overview');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Review File
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-slate-500 text-xs">
            Showing <strong className="text-slate-700 font-semibold">{totalItems === 0 ? 0 : indexOfFirstItem + 1}</strong> to <strong className="text-slate-700 font-semibold">{Math.min(indexOfLastItem, totalItems)}</strong> of <strong className="text-slate-700 font-semibold">{totalItems}</strong> applications
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-xs font-semibold rounded-lg text-slate-700 transition-all cursor-pointer"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                    : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-xs font-semibold rounded-lg text-slate-700 transition-all cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Case Management Tab / Segment (If selected case tab in sidebar) */}
      {(activeSubTab === 'compliance-cases' || activeSubTab === 'risk-reviews') && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Active Investigation Cases</h3>
              <p className="text-[11px] text-slate-400">Formal regulatory reporting cases, SAR compilations, and blocked portfolios</p>
            </div>
            <span className="text-[10px] bg-red-100 text-red-700 font-mono font-bold px-2 py-0.5 rounded-full">
              {cases.filter(c => c.status !== 'Closed').length} Active Files
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Case List */}
            <div className="md:col-span-1 border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden bg-slate-50/10">
              {cases.map((c) => (
                <div 
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`p-3 cursor-pointer hover:bg-slate-50 transition-colors text-left ${
                    selectedCase?.id === c.id ? 'bg-blue-50/50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-[10px] font-bold text-slate-950">{c.id}</span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      c.status === 'Open' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      c.status === 'Closed' ? 'bg-slate-100 text-slate-500 border border-slate-200' :
                      'bg-orange-50 text-orange-700 border border-orange-200'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 truncate">{c.customerName}</h4>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{c.subject}</p>
                  <div className="flex items-center justify-between mt-2 text-[9px] text-slate-400">
                    <span>Investigator: {c.investigator}</span>
                    <span className="font-mono">{c.createdDate.substring(0, 10)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Case Details Workspace */}
            <div className="md:col-span-2 border border-slate-200 rounded-lg p-4 space-y-4">
              {selectedCase ? (
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono font-bold text-slate-400">
                        <span>FOLDER ID: {selectedCase.id}</span>
                        <span>•</span>
                        <span className="text-red-500 uppercase font-bold">{selectedCase.priority} PRIORITY</span>
                      </div>
                      <h3 className="font-bold text-base text-slate-800">{selectedCase.customerName}</h3>
                      <p className="text-xs text-slate-500 mt-1">{selectedCase.subject}</p>
                    </div>
                    {selectedCase.status !== 'Closed' && (
                      <button
                        onClick={() => setShowResolveCaseDialog(true)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                      >
                        Resolve & Close Case
                      </button>
                    )}
                  </div>

                  {/* Evidence Vault */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-2">Cryptographic Evidence Dossier</h4>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                      {selectedCase.evidence.length === 0 ? (
                        <p className="text-[10px] text-slate-400 font-medium">No formal electronic evidence logs attached yet.</p>
                      ) : (
                        selectedCase.evidence.map((ev, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-white border border-slate-100 p-2 rounded-md shadow-sm">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-slate-400" />
                              <div>
                                <span className="font-bold text-slate-800 block truncate max-w-[200px]">{ev.fileName}</span>
                                <span className="text-[9px] text-slate-400 block">{ev.type} • Uploaded by {ev.uploadedBy}</span>
                              </div>
                            </div>
                            <span className="font-mono text-[10px] text-slate-500">{ev.size}</span>
                          </div>
                        ))
                      )}

                      {/* Add evidence */}
                      <div className="mt-3 flex items-center gap-2">
                        <select 
                          value={evidenceFileType}
                          onChange={(e) => setEvidenceFileType(e.target.value)}
                          className="p-1.5 border border-slate-200 rounded bg-white text-xs font-medium"
                        >
                          <option value="Passport Copy">Passport Copy</option>
                          <option value="Proof of Wealth">Proof of Wealth</option>
                          <option value="IP Access Logs">IP Access Logs</option>
                          <option value="Suspicious Transactions Ledger">Suspicious Transactions Ledger</option>
                        </select>
                        <input 
                          type="text" 
                          placeholder="File name (e.g. statement_jul26.pdf)..."
                          value={evidenceFileName}
                          onChange={(e) => setEvidenceFileName(e.target.value)}
                          className="flex-1 p-1.5 border border-slate-200 rounded text-xs bg-white outline-none"
                        />
                        <button
                          onClick={handleUploadEvidence}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold text-xs"
                        >
                          Add Log
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Case Notes & Timeline split */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 mb-2">Internal Investigator Log</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedCase.internalNotes.length === 0 ? (
                          <p className="text-[10px] text-slate-400">No notes written.</p>
                        ) : (
                          selectedCase.internalNotes.map((note, idx) => (
                            <div key={idx} className="bg-slate-50 p-2 rounded border border-slate-100 text-[11px]">
                              <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                                <span>{note.author}</span>
                                <span>{note.timestamp}</span>
                              </div>
                              <p className="text-slate-700 leading-relaxed font-medium">{note.note}</p>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="mt-2 flex gap-1.5">
                        <input
                          type="text"
                          value={caseNoteInput}
                          onChange={(e) => setCaseNoteInput(e.target.value)}
                          placeholder="Write log entry..."
                          className="flex-1 border border-slate-200 rounded p-1.5 text-xs bg-white outline-none"
                        />
                        <button
                          onClick={handleAddCaseNote}
                          className="px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold"
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-700 mb-2">Audit Timeline Tracking</h4>
                      <div className="space-y-3 max-h-48 overflow-y-auto pl-2 border-l border-slate-100">
                        {selectedCase.timeline.map((evt, idx) => (
                          <div key={idx} className="relative text-[11px]">
                            <div className="absolute -left-[14px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white" />
                            <div className="font-bold text-slate-600 flex justify-between items-center">
                              <span>{evt.event}</span>
                              <span className="font-mono text-[9px] text-slate-400">{evt.timestamp.substring(11, 19)}</span>
                            </div>
                            <p className="text-slate-500 mt-0.5">{evt.details}</p>
                            <span className="text-[9px] text-slate-400 block font-medium">By: {evt.performedBy}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400">
                  <Shield className="w-10 h-10 text-slate-300 mb-2" />
                  <p className="text-xs font-bold">No case dossier selected</p>
                  <p className="text-[10px] text-slate-400">Select an active investigation case folder from the left list.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Biometric Drawer & File Reviewer (Details Screen) */}
      {isDetailOpen && selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-end z-50 animate-fade-in text-left">
          <div className="bg-white w-full max-w-5xl h-full shadow-2xl flex flex-col overflow-hidden animate-slide-left">
            
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-blue-400 font-bold">{selectedApp.id}</span>
                    <span className="text-[9px] bg-blue-800 text-blue-100 px-1.5 rounded uppercase font-bold tracking-wider font-mono">
                      {selectedApp.riskLevel} Risk
                    </span>
                  </div>
                  <h2 className="font-bold text-sm text-white">{selectedApp.customerName}</h2>
                </div>
              </div>
              <button 
                onClick={() => setIsDetailOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dialog tab buttons */}
            <div className="flex border-b border-slate-100 bg-slate-50 shrink-0">
              {(['overview', 'identity', 'documents', 'aml_pep', 'notes', 'audit'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(tab)}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    detailTab === tab 
                      ? 'border-blue-600 text-blue-600 bg-white' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.replace('_', ' / ')}
                </button>
              ))}
            </div>

            {/* Tab content area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* OVERVIEW TAB */}
              {detailTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column Profile */}
                  <div className="bg-slate-50 p-4 border border-slate-150 rounded-xl space-y-4">
                    <div className="flex flex-col items-center text-center">
                      <img 
                        src={selectedApp.selfieUrl} 
                        alt="Customer portrait selfie"
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 rounded-full border-2 border-white shadow-md object-cover"
                      />
                      <h3 className="font-bold text-slate-800 mt-2 text-sm">{selectedApp.customerName}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {selectedApp.customerId}</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Country</span>
                        <span className="font-bold text-slate-700">{selectedApp.country}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Account Tier</span>
                        <span className="font-bold text-slate-700">{selectedApp.accountTier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Verification</span>
                        <span className="font-bold text-slate-700">{selectedApp.verificationLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Assigned To</span>
                        <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {selectedApp.assignedReviewer}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column Risk analysis */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-orange-500" /> Automated Risk Calculation
                    </h4>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-bold font-mono text-slate-800">{selectedApp.riskScore}</div>
                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            selectedApp.riskScore > 75 ? 'bg-red-500' :
                            selectedApp.riskScore > 50 ? 'bg-orange-500' :
                            selectedApp.riskScore > 25 ? 'bg-yellow-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${selectedApp.riskScore}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>Biometrics Match Confidence</span>
                        <span className="font-mono font-bold text-emerald-600">{selectedApp.livenessConfidence}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Liveness Verification</span>
                        <span className="font-bold text-slate-700">{selectedApp.livenessResult}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column Screening Hits overview */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Flag className="w-3.5 h-3.5 text-blue-500" /> Watchlist Matches
                    </h4>
                    
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between p-1.5 rounded bg-slate-50">
                        <span>AML / Adverse Media</span>
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                          selectedApp.amlResults.status === 'Match Found' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {selectedApp.amlResults.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-1.5 rounded bg-slate-50">
                        <span>Sanctions Matches</span>
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                          selectedApp.sanctionsResults.status === 'Match Found' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {selectedApp.sanctionsResults.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-1.5 rounded bg-slate-50">
                        <span>PEP Screening</span>
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                          selectedApp.pepResults.status === 'Match Found' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {selectedApp.pepResults.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* IDENTITY TAB */}
              {detailTab === 'identity' && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Customer Demographics & Verified Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Full Legal Name</label>
                      <input type="text" readOnly value={selectedApp.customerName} className="w-full p-2 border border-slate-200 bg-slate-50 rounded" />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Email Address</label>
                      <input type="text" readOnly value={selectedApp.customerEmail} className="w-full p-2 border border-slate-200 bg-slate-50 rounded" />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Phone Number</label>
                      <input type="text" readOnly value={selectedApp.customerPhone} className="w-full p-2 border border-slate-200 bg-slate-50 rounded" />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">National ID / Passport</label>
                      <input type="text" readOnly value={selectedApp.passportNumber || selectedApp.nationalId || 'N/A'} className="w-full p-2 border border-slate-200 bg-slate-50 rounded" />
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 pt-2">Address Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="col-span-3">
                      <label className="text-slate-400 block mb-1">Street Address</label>
                      <input type="text" readOnly value={selectedApp.address.street} className="w-full p-2 border border-slate-200 bg-slate-50 rounded" />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">City</label>
                      <input type="text" readOnly value={selectedApp.address.city} className="w-full p-2 border border-slate-200 bg-slate-50 rounded" />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Postal Code</label>
                      <input type="text" readOnly value={selectedApp.address.postalCode} className="w-full p-2 border border-slate-200 bg-slate-50 rounded" />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Country</label>
                      <input type="text" readOnly value={selectedApp.address.country} className="w-full p-2 border border-slate-200 bg-slate-50 rounded" />
                    </div>
                  </div>
                </div>
              )}

              {/* DOCUMENTS INTERACTIVE VIEWER TAB */}
              {detailTab === 'documents' && (
                <div className="space-y-4">
                  <div className="flex flex-col lg:flex-row items-stretch gap-4 min-h-[400px]">
                    
                    {/* Documents list switcher */}
                    <div className="lg:w-1/4 border border-slate-200 bg-slate-50 p-3 rounded-xl space-y-2 shrink-0">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Attached Documents</h4>
                      {selectedApp.documents.map((doc, idx) => (
                        <div 
                          key={idx}
                          onClick={() => {
                            setActiveDocIndex(idx);
                            setZoomLevel(1);
                            setRotation(0);
                          }}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                            activeDocIndex === idx 
                              ? 'bg-blue-600 text-white border-blue-600 shadow' 
                              : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-xs">{doc.type}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              doc.status === 'Verified' ? 'bg-emerald-500 text-white' : 'bg-yellow-500 text-slate-900'
                            }`}>
                              {doc.status}
                            </span>
                          </div>
                          <span className="text-[10px] opacity-80 block font-mono">No: {doc.documentNumber || 'N/A'}</span>
                        </div>
                      ))}
                    </div>

                    {/* Interactive Image Display Window */}
                    <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 flex flex-col overflow-hidden relative group min-h-[300px]">
                      
                      {/* Control Panel overlays */}
                      <div className="p-3 bg-slate-900/95 border-b border-slate-800 text-white flex items-center justify-between shrink-0 z-10">
                        <span className="text-xs font-bold font-mono text-slate-300">
                          {selectedApp.documents[activeDocIndex]?.type} Viewer
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs cursor-pointer"
                            title="Zoom In"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs cursor-pointer"
                            title="Zoom Out"
                          >
                            <ZoomOut className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => setRotation(prev => (prev + 90) % 360)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs cursor-pointer"
                            title="Rotate 90° Clockwise"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => { setZoomLevel(1); setRotation(0); }}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs cursor-pointer text-[9px] font-bold"
                          >
                            RESET
                          </button>
                          <button 
                            onClick={() => setIsSideBySide(prev => !prev)}
                            className={`p-1.5 rounded text-xs font-bold transition-all ${
                              isSideBySide ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            Compare Selfie
                          </button>
                        </div>
                      </div>

                      {/* Display image sandbox */}
                      <div className="flex-1 flex items-center justify-center overflow-hidden relative bg-slate-900 p-4">
                        <div className={`grid gap-4 w-full h-full ${isSideBySide ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          
                          {/* Document Pane */}
                          <div className="relative flex items-center justify-center overflow-hidden border border-slate-800 roundedbg-slate-950">
                            <img 
                              src={selectedApp.documents[activeDocIndex]?.imageUrl} 
                              alt="KYC scan"
                              referrerPolicy="no-referrer"
                              className="max-h-[300px] object-contain transition-transform duration-200"
                              style={{ 
                                transform: `scale(${zoomLevel}) rotate(${rotation}deg)` 
                              }}
                            />
                            
                            {/* Image Metrics / Quality Gauges */}
                            <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-800 p-2.5 rounded-lg text-white space-y-1.5 max-w-xs text-[10px] z-10 font-mono">
                              <div className="flex justify-between items-center gap-4">
                                <span className="text-slate-400">Quality Index:</span>
                                <span className="font-bold text-emerald-400">{selectedApp.documents[activeDocIndex]?.imageQualityScore}%</span>
                              </div>
                              <div className="flex justify-between items-center gap-4">
                                <span className="text-slate-400">Glare Check:</span>
                                <span className={selectedApp.documents[activeDocIndex]?.glareDetected ? 'text-yellow-400' : 'text-emerald-400'}>
                                  {selectedApp.documents[activeDocIndex]?.glareDetected ? 'DETECTED' : 'CLEAR'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center gap-4">
                                <span className="text-slate-400">Corners Check:</span>
                                <span className={selectedApp.documents[activeDocIndex]?.cornersCutOff ? 'text-red-400' : 'text-emerald-400'}>
                                  {selectedApp.documents[activeDocIndex]?.cornersCutOff ? 'CUT-OFF' : 'OK'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Side-by-side Selfie Pane */}
                          {isSideBySide && (
                            <div className="relative flex items-center justify-center overflow-hidden border border-slate-800 bg-slate-950 rounded">
                              <img 
                                src={selectedApp.selfieUrl} 
                                alt="Selfie compare portrait"
                                referrerPolicy="no-referrer"
                                className="max-h-[300px] object-contain"
                              />
                              <div className="absolute top-2 right-2 bg-emerald-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow">
                                LIVENESS PASSED
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AML / PEP SCREENING DEEP-DIVE */}
              {detailTab === 'aml_pep' && (
                <div className="space-y-6">
                  {/* AML Matches list */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 text-left">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-2 mb-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">AML & Terrorist Financing Watchlists</h4>
                        <p className="text-[10px] text-slate-400">Automated global matching across Interpol, FBI, and corporate watchlists</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        selectedApp.amlResults.status === 'Match Found' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {selectedApp.amlResults.status}
                      </span>
                    </div>

                    {selectedApp.amlResults.status === 'Match Found' ? (
                      <div className="space-y-4">
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-2">
                          <div className="flex justify-between text-xs font-bold text-red-800">
                            <span>Detected Entity: {selectedApp.customerName}</span>
                            <span>Score: {selectedApp.amlResults.matchScore || 90}%</span>
                          </div>
                          <p className="text-xs text-red-700">
                            Flagged Watchlist: <strong>{selectedApp.amlResults.watchlistName}</strong>
                          </p>
                          <p className="text-[11px] text-red-600">
                            Found <strong>{selectedApp.amlResults.adverseMediaCount}</strong> adverse media articles relating to financial crime. False-Positive override must be explicitly authorized.
                          </p>
                        </div>

                        {/* False positive toggle override action */}
                        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                          <div>
                            <span className="text-xs font-bold text-slate-700 block">False Positive Override Handler</span>
                            <span className="text-[10px] text-slate-400">Override match if investigator confirms name similarity conflict.</span>
                          </div>
                          <button
                            onClick={() => handleToggleFalsePositive('aml')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm cursor-pointer ${
                              selectedApp.amlResults.falsePositiveStatus === 'Dismissed - False Positive'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {selectedApp.amlResults.falsePositiveStatus === 'Dismissed - False Positive'
                              ? 'Dismissed (False Positive)'
                              : 'Dismiss as False Positive'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 font-medium">All database files scan clear. No matches found.</p>
                    )}
                  </div>

                  {/* Sanctions & PEP Matches list */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 text-left">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-2 mb-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Sanctions Screening Records</h4>
                        <p className="text-[10px] text-slate-400">OFAC, HM Treasury, EU consolidated sanctions matching</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        selectedApp.sanctionsResults.status === 'Match Found' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {selectedApp.sanctionsResults.status}
                      </span>
                    </div>

                    {selectedApp.sanctionsResults.status === 'Match Found' ? (
                      <div className="space-y-4">
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-2">
                          <div className="flex justify-between text-xs font-bold text-red-800">
                            <span>Detected Entity: {selectedApp.customerName}</span>
                            <span>Score: {selectedApp.sanctionsResults.matchScore || 85}%</span>
                          </div>
                          <p className="text-xs text-red-700">
                            Flagged Watchlist: <strong>{selectedApp.sanctionsResults.watchlistName}</strong>
                          </p>
                        </div>

                        {/* False positive toggle */}
                        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                          <div>
                            <span className="text-xs font-bold text-slate-700 block">Sanctions False Positive Toggle</span>
                            <span className="text-[10px] text-slate-400">Override matching flag on compliance audit ledger.</span>
                          </div>
                          <button
                            onClick={() => handleToggleFalsePositive('sanctions')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm cursor-pointer ${
                              selectedApp.sanctionsResults.falsePositiveStatus === 'Dismissed - False Positive'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {selectedApp.sanctionsResults.falsePositiveStatus === 'Dismissed - False Positive'
                              ? 'Dismissed (False Positive)'
                              : 'Dismiss as False Positive'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 font-medium">All global sanctions registries scan clear.</p>
                    )}
                  </div>
                </div>
              )}

              {/* REVIEWER NOTES TAB */}
              {detailTab === 'notes' && (
                <div className="space-y-4 text-left">
                  <h3 className="font-bold text-slate-800 text-sm">Regulatory Assessment Notes</h3>
                  
                  <div className="space-y-3">
                    {selectedApp.reviewerNotes.length === 0 ? (
                      <p className="text-xs text-slate-400">No reviewer logs written to this application yet.</p>
                    ) : (
                      selectedApp.reviewerNotes.map((note) => (
                        <div key={note.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1">
                            <span>{note.author}</span>
                            <span>{note.timestamp}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed font-semibold">{note.note}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <label className="text-xs font-bold text-slate-500 block">Add Assessment Observation</label>
                    <textarea
                      rows={3}
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Enter legal assessment notes or biometric audit observations here..."
                      className="w-full border border-slate-200 rounded p-2 text-xs bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleAddNote}
                        disabled={!newNoteText.trim()}
                        className="px-4 py-2 bg-blue-600 disabled:opacity-50 text-white rounded-lg hover:bg-blue-700 text-xs font-semibold cursor-pointer shadow-sm shadow-blue-500/10"
                      >
                        Append Review Note
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* AUDIT TIMELINE TAB */}
              {detailTab === 'audit' && (
                <div className="space-y-4 text-left">
                  <h3 className="font-bold text-slate-800 text-sm">Cryptographic Onboarding Audit Log</h3>
                  <div className="space-y-4 pl-3 border-l border-slate-100">
                    {selectedApp.auditTimeline.map((item) => (
                      <div key={item.id} className="relative text-xs">
                        <div className="absolute -left-[18px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white" />
                        <div className="flex justify-between items-start font-bold text-slate-800">
                          <span>{item.action}</span>
                          <span className="font-mono text-[10px] text-slate-400">{item.timestamp}</span>
                        </div>
                        <p className="text-slate-500 mt-0.5 leading-normal">{item.reason}</p>
                        <div className="flex gap-2.5 mt-1.5 text-[10px] text-slate-400">
                          <span>Reviewer: <strong>{item.reviewer}</strong></span>
                          <span>•</span>
                          <span>Transition: <strong>{item.previousStatus} → {item.newStatus}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Actions Tray */}
            <div className="p-4 bg-slate-50 border-t border-slate-150 shrink-0 flex flex-wrap gap-2.5 items-center justify-between">
              
              {/* Quick Risk Status */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400">File Status:</span>
                <span className="font-bold text-slate-800">{selectedApp.status}</span>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                
                {/* Secondary compliance actions */}
                <button 
                  onClick={() => setShowActionDialog('Assign Reviewer')}
                  className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer shadow-sm transition-all"
                >
                  Assign Reviewer
                </button>

                <button 
                  onClick={() => setShowActionDialog('Change Priority')}
                  className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer shadow-sm transition-all"
                >
                  Escalate Priority
                </button>

                <button 
                  onClick={() => setShowActionDialog('Request More Information')}
                  className="px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-yellow-800 rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-all"
                >
                  Request Info
                </button>

                {/* Primary critical actions */}
                <button 
                  onClick={() => setShowActionDialog('Reject')}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
                >
                  Reject File
                </button>

                <button 
                  onClick={() => setShowActionDialog('Approve')}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
                >
                  Approve Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Dialog Modal */}
      {showActionDialog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in text-left">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-slate-100 animate-scale-up">
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Authorize Compliance Action: {showActionDialog}</h3>
            <p className="text-xs text-slate-500 mb-4">This action will be written to the blockchain audit log. Reason justification is mandatory.</p>
            
            {/* Conditional inputs */}
            {showActionDialog === 'Assign Reviewer' ? (
              <div className="space-y-3 mb-4">
                <label className="text-xs font-bold text-slate-600 block">Select Compliance Officer</label>
                <select
                  value={assignedReviewerInput}
                  onChange={(e) => setAssignedReviewerInput(e.target.value)}
                  className="w-full border border-slate-200 rounded p-2 text-xs bg-white outline-none"
                >
                  <option value="">-- Choose Reviewer --</option>
                  <option value="Sarah Jenkins">Sarah Jenkins (L3 Senior Analyst)</option>
                  <option value="David Miller">David Miller (AML Lead Investigator)</option>
                  <option value="Alex Wong">Alex Wong (Risk Manager)</option>
                </select>
              </div>
            ) : showActionDialog === 'Change Priority' ? (
              <div className="space-y-3 mb-4">
                <label className="text-xs font-bold text-slate-600 block">SLA Priority Rating</label>
                <select
                  value={priorityInput}
                  onChange={(e) => setPriorityInput(e.target.value as any)}
                  className="w-full border border-slate-200 rounded p-2 text-xs bg-white outline-none"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority (Immediate Action)</option>
                  <option value="Critical">Critical Priority (OFAC / SLA warning)</option>
                </select>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                <label className="text-xs font-bold text-slate-600 block">Reasoning & Legality Justification</label>
                <textarea
                  rows={3}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Enter detailed compliance assessment justification for the audit trail..."
                  className="w-full border border-slate-200 rounded p-2 text-xs bg-white outline-none"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 text-xs font-semibold">
              <button
                onClick={() => {
                  setShowActionDialog(null);
                  setActionReason('');
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                onClick={() => {
                  if (showActionDialog === 'Assign Reviewer') {
                    handleAssignReviewer(assignedReviewerInput || reviewerName);
                  } else if (showActionDialog === 'Change Priority') {
                    handleChangePriority(priorityInput);
                  } else if (showActionDialog === 'Approve') {
                    handleUpdateStatus('Approved', actionReason || 'All automated and manual identity checks passed successfully.');
                  } else if (showActionDialog === 'Reject') {
                    handleUpdateStatus('Rejected', actionReason || 'Application rejected due to failed screening verification guidelines.');
                  } else if (showActionDialog === 'Request More Information') {
                    handleUpdateStatus('More Info Requested', actionReason || 'Requested customer re-submission of clear identity documentation.');
                  }
                }}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer shadow-sm shadow-blue-500/10"
              >
                Confirm Authorize
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Case Creation Modal */}
      {isCreateCaseOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in text-left">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-slate-100 animate-scale-up">
            <h3 className="font-bold text-slate-900 text-base mb-1">Open Regulatory Investigation Folder</h3>
            <p className="text-xs text-slate-400 mb-4">Initialize a structured review folder for SAR logging, asset locks, or enhanced screening matches.</p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-bold">Target Customer Name</label>
                <input
                  type="text"
                  value={newCaseCustomer}
                  onChange={(e) => setNewCaseCustomer(e.target.value)}
                  placeholder="e.g. Dimitri Karpov"
                  className="w-full p-2 border border-slate-200 rounded bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">Investigation Subject / Focus</label>
                <input
                  type="text"
                  value={newCaseSubject}
                  onChange={(e) => setNewCaseSubject(e.target.value)}
                  placeholder="e.g. Suspicious Wire Activity or Watchlist Hit"
                  className="w-full p-2 border border-slate-200 rounded bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Priority Tier</label>
                  <select
                    value={newCasePriority}
                    onChange={(e) => setNewCasePriority(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded bg-white outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Investigator Assignee</label>
                  <input
                    type="text"
                    value={newCaseInvestigator}
                    onChange={(e) => setNewCaseInvestigator(e.target.value)}
                    placeholder="Sarah Jenkins"
                    className="w-full p-2 border border-slate-200 rounded bg-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5 text-xs font-semibold">
              <button
                onClick={() => setIsCreateCaseOpen(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCase}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer shadow-sm shadow-blue-500/10"
              >
                Initialize Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Case Resolution Modal */}
      {showResolveCaseDialog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in text-left">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-slate-100 animate-scale-up">
            <h3 className="font-bold text-slate-900 text-base mb-1">Resolve Investigation Case</h3>
            <p className="text-xs text-slate-400 mb-4">Complete investigation and write resolution decision to security ledger.</p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-bold">Resolution Action</label>
                <select
                  value={caseResolution}
                  onChange={(e) => setCaseResolution(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded bg-white outline-none"
                >
                  <option value="Permanent Profile Blacklist">Permanent Profile Blacklist</option>
                  <option value="Asset Freeze & SAR Filed">Asset Freeze & SAR Filed</option>
                  <option value="Exonerated - False Positive Dismissed">Exonerated - False Positive Dismissed</option>
                  <option value="Resolved - Restricted Capabilities">Resolved - Restricted Capabilities</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">Investigation Summary Justification</label>
                <textarea
                  rows={3}
                  value={caseResolutionReason}
                  onChange={(e) => setCaseResolutionReason(e.target.value)}
                  placeholder="Describe final findings and regulatory reasoning..."
                  className="w-full p-2 border border-slate-200 rounded bg-white outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5 text-xs font-semibold">
              <button
                onClick={() => setShowResolveCaseDialog(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveCase}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer shadow-sm shadow-blue-500/10"
              >
                Write Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
