// Bill.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Bill = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [barcode, setBarcode] = useState('');

  // Bill information
  const [billNumber, setBillNumber] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  // Customer information
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerGST, setCustomerGST] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerType, setCustomerType] = useState('external'); // 'internal' or 'external'
  const [, setCustomerDiscount] = useState(0); // Default discount for customer type

  // Patient / Doctor information
  const [doctorName, setDoctorName] = useState('');
  const [doctorRegNo, setDoctorRegNo] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [prescriptionImage, setPrescriptionImage] = useState(null);
  const [isPrescriptionRequired, setIsPrescriptionRequired] = useState(false);
  const [patientName, setPatientName] = useState('');


  // Company information (from selected company)
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [showCompanySelector, setShowCompanySelector] = useState(false);

  // User information (bill created by)
  const [createdBy, setCreatedBy] = useState('');

  // Discount information
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' or 'fixed'
  const [manualDiscount, setManualDiscount] = useState(false); // Track if discount is manually set

  // Tax information
  const [tax, setTax] = useState(0);
  const [taxType, setTaxType] = useState('percentage'); // 'percentage' or 'fixed'

  // Payment information
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentStatus, setPaymentStatus] = useState('pending');

  // Payment details for different methods
  const [cashReceived, setCashReceived] = useState(0);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [bankName, setBankName] = useState('');
  const [chequeNumber, setChequeNumber] = useState('');

  // UI states
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [billSaved, setBillSaved] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [lastGeneratedBill, setLastGeneratedBill] = useState(null);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [, setSavedBillId] = useState(null);
  const [fetchingCustomer, setFetchingCustomer] = useState(false);

  // Shop details (will be overridden by selected company)
  const defaultShopDetails = {
    name: 'SRI GANAPATHY MEDICALS',
    subtitle: 'CHEMISTS & DRUGGISTS',
    address: '158,M.R.H.Road,Thabalpetti, Madhavaram, Chennai- 60.',
    city: '',
    phone: '98401 50118',
    dlNo: 'D.L. No. 0175 / ZIV / 20 / 21',
  };

  const [shopDetails, setShopDetails] = useState(defaultShopDetails);

  // Refs
  const billPaperRef = useRef(null);
  const downloadLinkRef = useRef(null);

  // Create axios instance with credentials
  const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Add request interceptor for debugging
  api.interceptors.request.use(request => {
    console.log('Starting Request:', request.url);
    return request;
  });

  // Add response interceptor for error handling
  api.interceptors.response.use(
    response => {
      console.log('Response:', response.status);
      return response;
    },
    error => {
      console.log('Response Error:', error.response?.status, error.response?.data);
      if (error.response?.status === 401) {
        setIsAuthenticated(false);
        setError('Session expired. Please login again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
      return Promise.reject(error);
    }
  );

  // Base styles (without dynamic values)
  const baseStyles = {
    container: {
      display: 'grid',
      gridTemplateColumns: '1fr 380px',
      gap: '24px',
      padding: '24px',
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: "'Inter', sans-serif",
    },
    productPanel: {
      background: 'white',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      overflow: 'auto',
      maxHeight: 'calc(100vh - 48px)',
      border: '1px solid #e2e8f0',
    },
    productPanelTitle: {
      marginBottom: '20px',
      color: '#333',
      borderBottom: '2px solid #333',
      paddingBottom: '10px',
      fontSize: '24px',
    },
    alert: {
      padding: '12px',
      borderRadius: '5px',
      marginBottom: '20px',
      fontWeight: 'bold',
      animation: 'slideIn 0.3s ease',
    },
    alertError: {
      background: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb',
    },
    alertSuccess: {
      background: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb',
    },
    searchSection: {
      background: '#f8f9fa',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid #e9ecef',
    },
    searchBox: {
      marginBottom: '15px',
      position: 'relative',
    },
    searchLabel: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold',
      color: '#333',
      fontSize: '14px',
    },
    searchInput: {
      width: '100%',
      padding: '12px',
      border: '2px solid #ddd',
      borderRadius: '5px',
      fontSize: '16px',
      fontFamily: "'Courier New', monospace",
      transition: 'border-color 0.3s, box-shadow 0.3s',
      outline: 'none',
    },
    searchLoading: {
      position: 'absolute',
      right: '10px',
      top: '40px',
      color: '#666',
      fontSize: '12px',
      background: 'white',
      padding: '2px 8px',
      borderRadius: '3px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    barcodeInput: {
      display: 'flex',
      gap: '10px',
    },
    barcodeField: {
      flex: 1,
      padding: '12px',
      border: '2px solid #ddd',
      borderRadius: '5px',
      fontSize: '16px',
      fontFamily: "'Courier New', monospace",
      outline: 'none',
    },
    barcodeButton: {
      padding: '12px 20px',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'background 0.3s, transform 0.1s',
    },
    barcodeButtonDisabled: {
      background: '#6c757d',
      cursor: 'not-allowed',
      opacity: 0.7,
    },
    searchResults: {
      background: 'white',
      border: '1px solid #007bff',
      borderRadius: '5px',
      maxHeight: '300px',
      overflowY: 'auto',
      marginTop: '10px',
      boxShadow: '0 4px 12px rgba(0,123,255,0.15)',
      width: '100%',
    },
    searchResultItem: {
      padding: '12px',
      borderBottom: '1px solid #eee',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'background 0.2s',
    },
    resultInfo: {
      flex: 1,
    },
    resultName: {
      fontWeight: 'bold',
      color: '#333',
    },
    resultDetails: {
      fontSize: '12px',
      color: '#666',
      marginTop: '2px',
    },
    resultPrice: {
      fontWeight: 'bold',
      color: '#28a745',
      fontSize: '16px',
    },
    selectedProducts: {
      marginTop: '20px',
    },
    selectedProductsTitle: {
      marginBottom: '15px',
      color: '#333',
      borderBottom: '1px solid #ddd',
      paddingBottom: '8px',
      fontSize: '18px',
    },
    noItems: {
      textAlign: 'center',
      color: '#999',
      padding: '30px',
      fontStyle: 'italic',
      background: '#f8f9fa',
      borderRadius: '5px',
    },
    selectedItemsList: {
      maxHeight: '400px',
      overflowY: 'auto',
    },
    selectedItem: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 110px 100px 40px',
      gap: '10px',
      padding: '12px',
      background: '#f8f9fa',
      marginBottom: '8px',
      borderRadius: '5px',
      alignItems: 'center',
      border: '1px solid #e9ecef',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    itemInfo: {
      display: 'flex',
      flexDirection: 'column',
    },
    itemName: {
      fontWeight: 'bold',
      color: '#333',
    },
    itemModel: {
      fontSize: '11px',
      color: '#666',
    },
    itemPrice: {
      fontWeight: 'bold',
      color: '#28a745',
    },
    itemTotal: {
      fontWeight: 'bold',
      color: '#28a745',
    },
    itemQuantity: {
      width: '70px',
      padding: '5px',
      border: '1px solid #ddd',
      borderRadius: '3px',
      textAlign: 'center',
      fontFamily: "'Courier New', monospace",
    },
    removeBtn: {
      background: '#dc3545',
      color: 'white',
      border: 'none',
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      cursor: 'pointer',
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 0.3s, transform 0.1s',
    },
    billPanel: {
      background: 'white',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: '20px',
      height: 'fit-content',
      maxHeight: 'calc(100vh - 40px)',
      overflow: 'auto',
    },
    billContainer: {
      padding: '15px',
    },
    billPaper: {
      background: 'white',
      padding: '15px 12px',
      border: '1px solid #ccc',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      position: 'relative',
      marginBottom: '15px',
      borderRadius: '3px',
      width: '320px',
      margin: '0 auto',
      fontFamily: "'Courier New', monospace",
      fontSize: '11px',
      lineHeight: '1.3',
    },
    billHeader: {
      textAlign: 'center',
      marginBottom: '4px',
      paddingBottom: '2px',
      borderBottom: '1px dashed #333',
    },
    billHeaderH1: {
      fontSize: '22px',
      letterSpacing: '0px',
      marginBottom: '3px',
      color: '#000',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    billHeaderP: {
      fontSize: '9px',
      color: '#666',
      margin: '1px 0',
      lineHeight: '1.2',
      textAlign: 'center',
    },
    billInfo: {
      margin: '4px 0',
      padding: '4px 0',
      borderTop: '1px dashed #333',
      borderBottom: '1px dashed #333',
    },
    billInfoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '2px',
      fontSize: '10px',
    },
    billNumber: {
      fontWeight: 'bold',
      color: '#007bff',
    },
    customerSection: {
      margin: '10px 0',
      padding: '8px',
      background: '#f9f9f9',
      borderRadius: '2px',
      border: '1px solid #e9ecef',
    },
    customerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '4px',
      fontSize: '10px',
    },
    customerValue: {
      color: '#333',
      maxWidth: '180px',
      textAlign: 'right',
      wordBreak: 'break-word',
    },
    medicalSection: {
      margin: '8px 0',
      padding: '8px',
      background: '#f0f9ff',
      borderRadius: '4px',
      border: '1px solid #bae6fd',
    },
    medicalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '3px',
      fontSize: '9px',
    },
    medicalLabel: {
      fontWeight: 'bold',
      color: '#0369a1',
    },
    customerTypeBadge: {
      padding: '2px 6px',
      borderRadius: '3px',
      fontSize: '9px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    internalBadge: {
      background: '#cce5ff',
      color: '#004085',
    },
    externalBadge: {
      background: '#fff3cd',
      color: '#856404',
    },
    customerInput: {
      width: '100%',
      padding: '4px 6px',
      marginBottom: '4px',
      border: '1px solid #ddd',
      borderRadius: '2px',
      fontFamily: "'Courier New', monospace",
      fontSize: '10px',
      transition: 'border-color 0.3s',
    },
    customerTypeSelect: {
      width: '100%',
      padding: '4px',
      marginBottom: '4px',
      border: '1px solid #ddd',
      borderRadius: '2px',
      fontFamily: "'Courier New', monospace",
      fontSize: '10px',
    },
    billItems: {
      margin: '10px 0',
    },
    billItemsHeader: {
      fontWeight: 'bold',
      padding: '4px 2px',
      fontSize: '9px',
      background: '#f0f0f0',
    },
    billItem: {
      padding: '4px 2px',
      fontSize: '9px',
    },
    billTable: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '9px',
    },
    billTh: {
      padding: '3px 2px',
      fontWeight: 'bold',
      fontSize: '9px',
      background: '#f0f0f0',
      borderTop: '1px solid #333',
      borderBottom: '1px solid #333',
      textAlign: 'left',
    },
    billTd: {
      padding: '3px 2px',
      fontSize: '9px',
      borderBottom: '1px dotted #ccc',
      verticalAlign: 'top',
    },
    billItemEmpty: {
      textAlign: 'center',
      color: '#999',
      padding: '10px',
      fontStyle: 'italic',
      fontSize: '10px',
    },
    billItemName: {
      display: 'flex',
      flexDirection: 'column',
    },
    billItemSmall: {
      fontSize: '7px',
      color: '#666',
    },
    billSummary: {
      margin: '10px 0',
      padding: '8px 0',
      borderTop: '1px solid #333',
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '3px',
      fontSize: '10px',
    },
    summaryRowTotal: {
      fontWeight: 'bold',
      fontSize: '12px',
      borderTop: '1px dashed #333',
      paddingTop: '6px',
      marginTop: '6px',
      color: '#333',
    },
    discountSection: {
      margin: '8px 0',
      padding: '6px',
      background: '#f0f7ff',
      borderRadius: '3px',
      border: '1px solid #b8daff',
    },
    discountHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '5px',
      cursor: 'pointer',
    },
    discountTitle: {
      fontWeight: 'bold',
      color: '#004085',
      fontSize: '11px',
    },
    discountToggle: {
      color: '#007bff',
      fontSize: '12px',
    },
    discountControls: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '5px',
      marginTop: '5px',
    },
    discountInput: {
      padding: '4px',
      border: '1px solid #ddd',
      borderRadius: '3px',
      fontFamily: "'Courier New', monospace",
      fontSize: '10px',
      width: '100%',
    },
    discountTypeSelect: {
      padding: '4px',
      border: '1px solid #ddd',
      borderRadius: '3px',
      fontFamily: "'Courier New', monospace",
      fontSize: '10px',
      width: '100%',
    },
    discountAmount: {
      fontSize: '10px',
      color: '#28a745',
      fontWeight: 'bold',
      marginTop: '3px',
    },
    summaryInput: {
      width: '50px',
      padding: '2px',
      border: '1px solid #ddd',
      borderRadius: '2px',
      textAlign: 'right',
      fontFamily: "'Courier New', monospace",
      fontSize: '9px',
      marginLeft: '3px',
    },
    paymentSection: {
      margin: '10px 0',
      padding: '8px',
      background: '#f0f0f0',
      borderRadius: '2px',
      border: '1px solid #ddd',
      fontSize: '10px',
    },
    paymentRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '4px',
      alignItems: 'center',
    },
    paymentSelect: {
      padding: '4px',
      width: '100px',
      border: '1px solid #ddd',
      borderRadius: '2px',
      fontFamily: "'Courier New', monospace",
      fontSize: '9px',
    },
    paymentInput: {
      width: '80px',
      padding: '3px',
      border: '1px solid #ddd',
      borderRadius: '2px',
      textAlign: 'right',
      fontFamily: "'Courier New', monospace",
      fontSize: '9px',
    },
    paymentDetails: {
      marginTop: '8px',
      padding: '6px',
      background: 'white',
      borderRadius: '2px',
      border: '1px solid #ccc',
    },
    paymentDetailsInput: {
      width: '100%',
      padding: '4px',
      marginBottom: '4px',
      border: '1px solid #ddd',
      borderRadius: '2px',
      fontFamily: "'Courier New', monospace",
      fontSize: '9px',
    },
    billFooter: {
      textAlign: 'center',
      marginTop: '15px',
      paddingTop: '10px',
      borderTop: '1px dashed #333',
      fontSize: '8px',
    },
    billFooterP: {
      marginBottom: '2px',
      color: '#666',
    },
    actionButtons: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '8px',
      marginTop: '15px',
    },
    whatsappButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '10px',
      marginTop: '10px',
      background: '#25D366',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'background 0.3s',
      textDecoration: 'none',
      width: '100%',
    },
    btn: {
      padding: '10px',
      border: 'none',
      borderRadius: '3px',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '12px',
      transition: 'all 0.3s',
      fontFamily: "'Courier New', monospace",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '3px',
    },
    btnDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    btnPrimary: {
      background: '#007bff',
      color: 'white',
    },
    btnSuccess: {
      background: '#28a745',
      color: 'white',
    },
    btnDanger: {
      background: '#dc3545',
      color: 'white',
    },
    btnSecondary: {
      background: '#6c757d',
      color: 'white',
    },
    btnInfo: {
      background: '#17a2b8',
      color: 'white',
    },
    btnWarning: {
      background: '#ffc107',
      color: '#333',
    },
    downloadLink: {
      display: 'none',
    },
    companySelector: {
      marginBottom: '15px',
      padding: '10px',
      background: '#e9ecef',
      borderRadius: '5px',
      cursor: 'pointer',
    },
    companyName: {
      fontWeight: 'bold',
      color: '#007bff',
      fontSize: '14px',
    },
    companyDropdown: {
      marginTop: '5px',
      padding: '5px',
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: '3px',
      maxHeight: '200px',
      overflowY: 'auto',
    },
    companyOption: {
      padding: '8px',
      cursor: 'pointer',
      borderBottom: '1px solid #eee',
      transition: 'background 0.2s',
    },
    companyOptionHover: {
      background: '#f0f7ff',
    },
  };

  // Check authentication on mount
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        // Set the name for display and the ID for saving
        setCreatedBy(userData.full_name || userData.name || userData.username || 'System');
      } catch (e) {
        setCreatedBy('System');
      }
    } else {
      setIsAuthenticated(false);
      setError('Please login first');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
  }, []);

  // Fetch companies on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchCompanies(); }, []);

  // Fetch companies from API
  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies/list');
      if (response.data && response.data.length > 0) {
        setCompanies(response.data);
        // Auto-select first company if available
        const firstCompany = response.data[0];
        setSelectedCompany(firstCompany);
        fetchCompanyDetails(firstCompany.id);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to fetch companies');
    }
  };

  // Fetch company details by ID
  const fetchCompanyDetails = async (companyId) => {
    try {
      const response = await api.get(`/companies/${companyId}`);
      if (response.data) {
        const company = response.data;
        setShopDetails({
          name: company.name || defaultShopDetails.name,
          subtitle: company.subtitle || defaultShopDetails.subtitle,
          address: company.address || defaultShopDetails.address,
          city: company.city || defaultShopDetails.city,
          phone: company.phone || '',
          gst: company.gst_number || '',
          dlNo: company.dl_no || defaultShopDetails.dlNo,
        });
      }
    } catch (err) {
      console.error('Error fetching company details:', err);
    }
  };

  // Handle company selection
  const handleCompanySelect = async (company) => {
    setSelectedCompany(company);
    setShowCompanySelector(false);
    await fetchCompanyDetails(company.id);
    setSuccess(`Switched to ${company.name}`);
    setTimeout(() => setSuccess(''), 2000);
  };

  // Generate random bill number (for display only, backend will generate unique)
  const generateBillNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let random = '';
    for (let i = 0; i < 8; i++) {
      random += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }

    setBillNumber(`BT-${year}${month}${day}-${random}`);
  };

  // Update date and time
  const updateDateTime = () => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }));
    setCurrentTime(now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }));
  };

  // Initialize
  useEffect(() => {
    generateBillNumber();
    updateDateTime();

    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Search products with debounce
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchProducts();
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Update payment status when paid amount changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const total = calculateTotal();
    if (paidAmount === 0) {
      setPaymentStatus('pending');
    } else if (paidAmount < total) {
      setPaymentStatus('partial');
    } else if (paidAmount >= total) {
      setPaymentStatus('paid');
    }
  }, [paidAmount, selectedProducts, discount, tax, discountType, taxType]);

  // Set discount based on customer type (only if not manually set)
  useEffect(() => {
    if (!manualDiscount) {
      if (customerType === 'internal') {
        setCustomerDiscount(10); // 10% discount for internal customers
        setDiscount(10);
        setDiscountType('percentage');
      } else {
        setCustomerDiscount(0);
        setDiscount(0);
        setDiscountType('percentage');
      }
    }
  }, [customerType, manualDiscount]);

  // Add thermal print styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          box-shadow: none !important;
          background: transparent !important;
        }
        
        #billPaper, #billPaper * {
          visibility: visible !important;
          background: white !important;
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
        }
        
        #billPaper {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 280px !important;
          margin: 0 !important;
          padding: 12px !important;
          border: none !important;
          box-shadow: none !important;
          background: white !important;
        }
        
        #billPaper div,
        #billPaper span,
        #billPaper p,
        #billPaper h1,
        #billPaper h2,
        #billPaper h3,
        #billPaper table,
        #billPaper tr,
        #billPaper td,
        #billPaper th {
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
          background: white !important;
        }
        
        #billPaper .bill-header {
          border-bottom: none !important;
          margin-bottom: 4px !important;
          padding-bottom: 0px !important;
        }
        
        #billPaper .bill-header h1 {
          font-size: 22px !important;
          font-weight: bold !important;
          letter-spacing: 0px !important;
          color: #000 !important;
          text-align: center !important;
        }
        
        #billPaper .bill-header p {
          text-align: center !important;
        }
        
        #billPaper .bill-info {
          border-top: none !important;
          border-bottom: none !important;
          margin-top: 4px !important;
          margin-bottom: 4px !important;
          padding: 2px 0 !important;
        }
        
        #billPaper .bill-items-header {
          border-bottom: 1px solid #000 !important;
        }
        
        
        
        #billPaper .bill-summary {
          border-top: 1px solid #000 !important;
        }
        
        #billPaper .bill-footer {
          border-top: none !important;
        }
        
        #billPaper * {
          background: white !important;
          color: black !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        #billPaper input,
        #billPaper select,
        #billPaper button,
        #billPaper .no-print {
          display: none !important;
        }
        
        #billPaper .payment-section {
          display: none !important;
        }
        
        #billPaper .customer-section input,
        #billPaper .customer-section select,
        #billPaper .customer-section button {
          display: none !important;
        }
        
        #billPaper .customer-section {
          border: none !important;
          padding: 0 !important;
          margin: 10px 0 !important;
        }
        
        #billPaper .discount-section {
          display: none !important;
        }
        
        @page {
          size: 80mm auto !important;
          margin: 0 !important;
        }
        
        .no-print {
          display: none !important;
        }
      }
      
      @media screen {
        #billPaper input,
        #billPaper select,
        #billPaper button {
          display: block;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Clear payment method specific fields when method changes
  useEffect(() => {
    setShowPaymentDetails(true);
    switch (paymentMethod) {
      case 'cash':
        setCardNumber('');
        setCardHolderName('');
        setUpiId('');
        setTransactionId('');
        setBankName('');
        setChequeNumber('');
        break;
      case 'card':
        setCashReceived(0);
        setUpiId('');
        setTransactionId('');
        setBankName('');
        setChequeNumber('');
        break;
      case 'upi':
        setCashReceived(0);
        setCardNumber('');
        setCardHolderName('');
        setBankName('');
        setChequeNumber('');
        break;
      case 'cheque':
        setCashReceived(0);
        setCardNumber('');
        setCardHolderName('');
        setUpiId('');
        setTransactionId('');
        break;
      default:
        break;
    }
  }, [paymentMethod]);

  // Fetch customer by phone
  const fetchCustomerByPhone = async (phone) => {
    if (phone.length < 10) return;

    setFetchingCustomer(true);
    try {
      const response = await api.get(`/billing/customer/${phone}`);
      if (response.data && response.data.exists) {
        const customer = response.data.customer;
        setCustomerName(customer.name || 'Walk-in Customer');
        setCustomerEmail(customer.email || '');
        setCustomerAddress(customer.address || '');
        setCustomerGST(customer.gst || '');
        setCustomerType(customer.type || 'external');
        setSuccess('Customer found! Details auto-filled.');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error fetching customer:', err);
    } finally {
      setFetchingCustomer(false);
    }
  };

  // Auto-fetch customer when phone reaches 10 digits
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      fetchCustomerByPhone(cleanPhone);
    }
  }, [customerPhone]);




  // Search products API call
  const searchProducts = async () => {
    if (!isAuthenticated) return;

    setSearchLoading(true);
    setError('');

    try {
      const response = await api.get(`/billing/search-products?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Search error:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError(err.response?.data?.error || 'Failed to search products');
      }
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Get product by barcode
  const getProductByBarcode = async () => {
    if (!isAuthenticated) return;
    if (!barcode.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/billing/product/barcode/${barcode}`);
      addProductToBill(response.data);
      setBarcode('');
    } catch (err) {
      console.error('Barcode error:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError(err.response?.data?.error || 'Product not found');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add product to bill
  const addProductToBill = (product) => {
    const existingProduct = selectedProducts.find(p => p.id === product.id);

    if (existingProduct) {
      if (existingProduct.quantity < product.quantity) {
        const updatedProducts = selectedProducts.map(p =>
          p.id === product.id
            ? {
              ...p,
              quantity: p.quantity + 1,
              total: (p.quantity + 1) * p.sellPrice
            }
            : p
        );
        setSelectedProducts(updatedProducts);
        setSuccess(`Added another ${product.name}`);
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError(`Insufficient stock! Max available: ${product.quantity}`);
        setTimeout(() => setError(''), 3000);
      }
    } else {
      if (product.quantity > 0) {
        const newProduct = {
          id: product.id,
          name: product.name,
          model: product.model || '',
          type: product.type || '',
          batchNo: product.batchNo || '',
          expiryDate: product.expiryDate || '',
          hsnCode: product.hsnCode || '',
          gstRate: product.gstRate || 0,
          sellPrice: product.sellPrice,
          quantity: 1,
          total: product.sellPrice,
          maxQuantity: product.quantity,
          isPrescriptionRequired: product.isPrescriptionRequired || false
        };

        setSelectedProducts([...selectedProducts, newProduct]);

        // Check if this new product requires a prescription
        if (newProduct.isPrescriptionRequired) {
          setIsPrescriptionRequired(true);
        }

        setSuccess(`${product.name} added to bill`);
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError('Out of stock!');
        setTimeout(() => setError(''), 3000);
      }
    }

    setSearchQuery('');
    setSearchResults([]);
  };

  // Update quantity - Now sets to 0 instead of deleting
  const updateQuantity = (productId, newQuantity) => {
    const product = selectedProducts.find(p => p.id === productId);

    if (product) {
      newQuantity = parseInt(newQuantity) || 0;

      // Allow quantity to be 0 (will show as 0 quantity item)
      if (newQuantity >= 0 && newQuantity <= product.maxQuantity) {
        const updatedProducts = selectedProducts.map(p =>
          p.id === productId
            ? { ...p, quantity: newQuantity, total: newQuantity * p.sellPrice }
            : p
        );
        setSelectedProducts(updatedProducts);

        if (newQuantity === 0) {
          setSuccess(`${product.name} quantity set to 0`);
        } else {
          setSuccess(`Updated ${product.name} quantity`);
        }
        setTimeout(() => setSuccess(''), 2000);
      } else if (newQuantity > product.maxQuantity) {
        setError(`Invalid quantity! Max available: ${product.maxQuantity}`);
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  // Remove product - Only for complete removal (separate function)
  const removeProduct = (productId) => {
    const product = selectedProducts.find(p => p.id === productId);
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    setSuccess(`${product.name} removed from bill`);
    setTimeout(() => setSuccess(''), 2000);
  };

  // Calculate subtotal (only items with quantity > 0)
  const calculateSubtotal = () => {
    return selectedProducts
      .filter(p => p.quantity > 0)
      .reduce((sum, p) => sum + p.total, 0);
  };

  // Calculate discount amount
  const calculateDiscountAmount = () => {
    const subtotal = calculateSubtotal();
    if (subtotal === 0) return 0;

    if (discountType === 'percentage') {
      return (subtotal * discount) / 100;
    }
    return Math.min(discount, subtotal); // Fixed amount cannot exceed subtotal
  };

  // Calculate tax amount (applied after discount)
  const calculateTaxAmount = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscountAmount();
    const afterDiscount = subtotal - discountAmount;

    if (afterDiscount <= 0) return 0;

    if (taxType === 'percentage') {
      return (afterDiscount * tax) / 100;
    }
    return Math.min(tax, afterDiscount); // Fixed tax cannot exceed after discount amount
  };

  // Calculate total (subtotal - discount + tax)
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscountAmount();
    const taxAmount = calculateTaxAmount();
    return Math.max(0, subtotal - discountAmount + taxAmount);
  };

  // Calculate change
  const calculateChange = () => {
    const total = calculateTotal();
    return Math.max(0, paidAmount - total);
  };

  // Calculate due amount
  const calculateDue = () => {
    const total = calculateTotal();
    return Math.max(0, total - paidAmount);
  };

  // Handle discount change
  const handleDiscountChange = (value) => {
    setManualDiscount(true); // Mark as manually set
    const numValue = parseFloat(value) || 0;
    const subtotal = calculateSubtotal();

    // Validate based on discount type
    if (discountType === 'percentage') {
      if (numValue > 100) {
        setError('Percentage discount cannot exceed 100%');
        setDiscount(100);
      } else if (numValue < 0) {
        setDiscount(0);
      } else {
        setDiscount(numValue);
      }
    } else {
      if (numValue > subtotal) {
        setError('Fixed discount cannot exceed subtotal');
        setDiscount(subtotal);
      } else if (numValue < 0) {
        setDiscount(0);
      } else {
        setDiscount(numValue);
      }
    }

    // Clear error after 3 seconds
    setTimeout(() => setError(''), 3000);
  };

  // Handle discount type change
  const handleDiscountTypeChange = (type) => {
    setManualDiscount(true); // Mark as manually set
    const subtotal = calculateSubtotal();
    setDiscountType(type);

    // Convert discount value when type changes
    if (type === 'percentage') {
      // If switching to percentage, convert fixed amount to percentage
      if (discountType === 'fixed' && subtotal > 0) {
        const percentage = (discount / subtotal) * 100;
        setDiscount(Math.min(100, Math.round(percentage * 100) / 100));
      } else if (discount > 100) {
        setDiscount(100);
      }
    } else {
      // If switching to fixed, convert percentage to fixed amount
      if (discountType === 'percentage' && subtotal > 0) {
        const fixed = (subtotal * discount) / 100;
        setDiscount(Math.min(subtotal, Math.round(fixed * 100) / 100));
      } else if (discount > subtotal) {
        setDiscount(subtotal);
      }
    }
  };

  // Reset discount to customer default
  const resetDiscountToDefault = () => {
    setManualDiscount(false);
    if (customerType === 'internal') {
      setDiscount(10);
      setDiscountType('percentage');
    } else {
      setDiscount(0);
      setDiscountType('percentage');
    }
  };

  // Handle cash payment
  const handleCashPayment = (received) => {
    const amount = parseFloat(received) || 0;
    setCashReceived(amount);
    setPaidAmount(amount);
  };

  // Handle exact payment
  const handleExactPayment = () => {
    const total = calculateTotal();
    setPaidAmount(total);
    if (paymentMethod === 'cash') {
      setCashReceived(total);
    }
  };

  // Save bill to database
  const saveBillToDatabase = async () => {
    const activeProducts = selectedProducts.filter(p => p.quantity > 0);

    if (activeProducts.length === 0) {
      setError('No items with quantity > 0 to save!');
      return null;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare bill data for API
      const billData = {
        customerName: customerName,
        customerPhone: customerPhone,
        customerEmail: customerEmail,
        customerGST: customerGST,
        customerAddress: customerAddress,
        customerType: customerType === 'internal' ? 'internal' : 'regular',
        doctorName: doctorName,
        doctorRegNo: doctorRegNo,
        patientName: patientName,
        patientAge: patientAge,
        patientGender: patientGender,
        prescriptionImage: prescriptionImage,
        companyId: selectedCompany?.id,
        discount: discount,
        discountType: discountType === 'percentage' ? 'percentage' : 'amount',
        tax: tax,
        taxType: taxType === 'percentage' ? 'percentage' : 'amount',
        paidAmount: paidAmount,
        paymentMethod: paymentMethod,
        createdBy: JSON.parse(localStorage.getItem('user'))?.id,
        createdByName: createdBy, // Using the state variable which now has the correct name
        items: activeProducts.map(p => ({
          productId: p.id,
          quantity: p.quantity
        }))
      };

      console.log('Saving bill:', billData);

      const response = await api.post('/billing/bills', billData);

      if (response.data.success) {
        setSuccess('Bill saved successfully!');
        setSavedBillId(response.data.billId);
        setBillNumber(response.data.billNumber); // Update with actual bill number from backend
        setLastGeneratedBill({
          billNumber: response.data.billNumber,
          customerPhone: customerPhone,
          customerName: customerName
        });
        setShowWhatsApp(true);
        setBillSaved(true);

        return {
          billId: response.data.billId,
          billNumber: response.data.billNumber
        };
      } else {
        throw new Error(response.data.error || 'Failed to save bill');
      }
    } catch (err) {
      console.error('Save bill error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to save bill');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Generate HTML content for bill with updated shop details
  const generateBillHTML = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscountAmount();
    const taxAmount = calculateTaxAmount();
    const total = calculateTotal();
    const due = calculateDue();
    const change = calculateChange();
    const activeProducts = selectedProducts.filter(p => p.quantity > 0);


    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill - ${billNumber}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              margin: 0;
              padding: 20px;
              width: 80mm;
              font-family: 'Courier New', monospace;
              font-size: 11px;
              line-height: 1.3;
              background: white;
            }
            
            #billPaper {
              width: 280px;
              margin: 0 auto;
              padding: 12px;
              background: white;
            }
            
            .bill-header {
              text-align: center;
              margin-bottom: 4px;
            }
            .bill-logo {
              max-width: 120px;
              max-height: 60px;
              margin-bottom: 5px;
              object-fit: contain;
            }
            .bill-header h1 {
              font-size: 22px;
              letter-spacing: 0px;
              margin-bottom: 3px;
              color: #000;
              font-weight: bold;
              text-align: center;
            }
            
            .bill-header p {
              text-align: center;
            }
            
            .bill-header .owner {
              font-size: 10px;
              font-weight: bold;
              color: #333;
              margin: 2px 0;
            }
            
            .bill-header p {
              font-size: 9px;
              color: #666;
              margin: 1px 0;
              line-height: 1.2;
            }
            
            .bill-info {
              margin: 4px 0;
              padding: 4px 0;
            }
            
            .bill-info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
              font-size: 10px;
            }
            
            .bill-number {
              font-weight: bold;
              color: #007bff;
            }
            
            .customer-section {
              margin: 10px 0;
              padding: 8px;
              background: #f9f9f9;
              border-radius: 2px;
              border: 1px solid #e9ecef;
            }
            
            .customer-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;
              font-size: 10px;
            }
            
            .customer-label {
              font-weight: bold;
              color: #555;
            }
            
            .customer-value {
              color: #333;
              max-width: 180px;
              text-align: right;
            }
            
            .customer-type-badge {
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 9px;
              font-weight: bold;
              text-transform: uppercase;
            }
            
            .internal-badge {
              background: #cce5ff;
              color: #004085;
            }
            
            .external-badge {
              background: #fff3cd;
              color: #856404;
            }
            
            
            .bill-items {
              margin: 10px 0;
            }
            
            .bill-items table {
              width: 100%;
              border-collapse: collapse;
              font-size: 9px;
            }
            
            .bill-items th {
              font-weight: bold;
              padding: 3px 2px;
              border-top: 1px solid #000;
              border-bottom: 1px solid #000;
              background: #f0f0f0;
              text-align: left;
              font-size: 9px;
            }
            
            .bill-items td {
              padding: 3px 2px;
              border-bottom: 1px dotted #ccc;
              font-size: 9px;
              vertical-align: top;
            }
            
            .bill-items tfoot td {
              border-top: 1px solid #000;
              border-bottom: none;
              font-weight: bold;
            }
            
            .bill-item-empty {
              text-align: center;
              color: #999;
              padding: 10px;
              font-style: italic;
              font-size: 10px;
            }
            
            .bill-item-name {
              display: flex;
              flex-direction: column;
            }
            
            .bill-item-small {
              font-size: 7px;
              color: #666;
            }
            
            .bill-summary {
              margin: 10px 0;
              padding: 8px 0;
              border-top: 1px solid #000;
            }
            
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
              font-size: 10px;
            }
            
            .summary-row-total {
              font-weight: bold;
              font-size: 12px;
              border-top: 1px dashed #000;
              padding-top: 6px;
              margin-top: 6px;
              color: #333;
            }
            
            .payment-section {
              margin: 10px 0;
              padding: 8px;
              background: #f0f0f0;
              border-radius: 2px;
              border: 1px solid #ddd;
              font-size: 10px;
            }
            
            .payment-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;
              align-items: center;
            }
            
            .bill-footer {
              text-align: center;
              margin-top: 15px;
              padding-top: 10px;
              border-top: none;
              font-size: 8px;
            }
            
            .bill-footer p {
              margin-bottom: 2px;
              color: #666;
            }
            
            .change-amount {
              font-weight: bold;
              color: ${paidAmount >= total ? '#28a745' : '#dc3545'};
              font-size: 10px;
            }
            
            .created-by {
              margin-top: 8px;
              padding-top: 5px;
              border-top: 1px dotted #ccc;
              font-size: 8px;
              text-align: center;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div id="billPaper">
            <div class="bill-header">
              <img src="/ganapathy-logo.png" class="bill-logo" alt="GANAPATHY MEDICALS Logo">
              <h1>${shopDetails.name}</h1>
              <p>${shopDetails.address}</p>
              <p>${shopDetails.city}</p>
              ${shopDetails.phone ? `<p>Ph: ${shopDetails.phone}</p>` : ''}
              ${shopDetails.gst ? `<p>GST: ${shopDetails.gst}</p>` : ''}
            </div>
            
            <div class="bill-info">
              <div class="bill-info-row">
                <span>Bill No:</span>
                <span class="bill-number">${billNumber}</span>
              </div>
              <div class="bill-info-row">
                <span>Date:</span>
                <span>${currentDate}</span>
              </div>
              <div class="bill-info-row">
                <span>Time:</span>
                <span>${currentTime}</span>
              </div>
            </div>
            
            <div class="customer-section">
              <div class="customer-row">
                <span class="customer-label">Customer Type:</span>
                <span class="customer-type-badge ${customerType === 'internal' ? 'internal-badge' : 'external-badge'}">
                  ${customerType === 'internal' ? '🏢 INTERNAL' : '👤 EXTERNAL'}
                </span>
              </div>
              
              <div class="customer-row">
                <span class="customer-label">Name:</span>
                <span class="customer-value">${customerName}</span>
              </div>
              
              ${customerPhone ? `
              <div class="customer-row">
                <span class="customer-label">Phone:</span>
                <span class="customer-value">${customerPhone}</span>
              </div>
              ` : ''}
              
              ${customerEmail ? `
              <div class="customer-row">
                <span class="customer-label">Email:</span>
                <span class="customer-value">${customerEmail}</span>
              </div>
              ` : ''}
              
              ${customerAddress ? `
              <div class="customer-row">
                <span class="customer-label">Address:</span>
                <span class="customer-value">${customerAddress}</span>
              </div>
              ` : ''}
              
              ${customerGST ? `
              <div class="customer-row">
                <span class="customer-label">GST:</span>
                <span class="customer-value">${customerGST}</span>
              </div>
              ` : ''}
            </div>
            
            
            ${discount > 0 ? `
            <div class="discount-section">
              <div class="discount-amount">
                Discount Amount: -₹${discountAmount.toFixed(2)}
                ${!manualDiscount && customerType === 'internal' ? ' (Staff discount)' : ''}
              </div>
            </div>
            ` : ''}
            
            <div class="bill-items">
              <table>
                <thead>
                  <tr>
                    <th>Qty.</th>
                    <th>PARTICULARS</th>
                    <th>Batch</th>
                    <th>Expiry</th>
                    <th style="text-align:right">Amount<br/><span style="font-size:8px;font-weight:normal">Rs.&nbsp;&nbsp;&nbsp;&nbsp;P.</span></th>
                  </tr>
                </thead>
                <tbody>
                  ${activeProducts.length === 0 ? `
                    <tr><td colspan="5" style="text-align:center;color:#999;font-style:italic;padding:15px 0">--- No items in bill ---</td></tr>
                  ` : activeProducts.map(product => `
                    <tr>
                      <td>${product.quantity}</td>
                      <td>
                        <div class="bill-item-name">
                          ${product.name}
                          ${product.model ? `<small class="bill-item-small">${product.model}</small>` : ''}
                        </div>
                      </td>
                      <td style="font-size:7px">${product.batchNo || ''}</td>
                      <td style="font-size:7px">${product.expiryDate || ''}</td>
                      <td style="text-align:right">₹${product.total.toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3">E. &amp; O.E.</td>
                    <td>TOTAL</td>
                    <td style="text-align:right">₹${total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div class="bill-summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>₹${subtotal.toFixed(2)}</span>
              </div>
              
              ${discount > 0 ? `
              <div class="summary-row">
                <span>Discount (${discount}${discountType === 'percentage' ? '%' : '₹'}):</span>
                <span>-₹${discountAmount.toFixed(2)}</span>
              </div>
              ` : ''}
              
              <div class="summary-row">
                <span>After Discount:</span>
                <span>₹${(subtotal - discountAmount).toFixed(2)}</span>
              </div>
              
              ${tax > 0 ? `
              <div class="summary-row">
                <span>Tax (${tax}${taxType === 'percentage' ? '%' : '₹'}):</span>
                <span>+₹${taxAmount.toFixed(2)}</span>
              </div>
              ` : ''}
              
              <div class="summary-row summary-row-total">
                <span>Total:</span>
                <span>₹${total.toFixed(2)}</span>
              </div>
            </div>
            
            <div class="payment-section">
              <div class="payment-row">
                <span>Payment Method:</span>
                <span>${paymentMethod.toUpperCase()}</span>
              </div>
              
              <div class="payment-row">
                <span>Paid Amount:</span>
                <span>₹${paidAmount.toFixed(2)}</span>
              </div>
              
              <div class="payment-row">
                <span>Payment Status:</span>
                <span style="color: ${paymentStatus === 'paid' ? '#28a745' : paymentStatus === 'partial' ? '#ffc107' : '#dc3545'}; font-weight: bold;">
                  ${paymentStatus.toUpperCase()}
                </span>
              </div>
              
              ${due > 0 && paymentStatus !== 'pending' ? `
              <div class="payment-row">
                <span>Due Amount:</span>
                <span>₹${due.toFixed(2)}</span>
              </div>
              ` : ''}
              
              ${paymentMethod === 'cash' && paidAmount >= total ? `
              <div class="payment-row">
                <span>Change:</span>
                <span class="change-amount">₹${change.toFixed(2)}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="bill-footer">
              <p>Thank you for your purchase!</p>
              <p>Goods once sold not returnable</p>
              <p>** Computer generated bill **</p>
              ${paymentMethod !== 'cash' && transactionId ? `
              <p>${paymentMethod.toUpperCase()}: ${transactionId}</p>
              ` : ''}
              <div class="created-by">
                Bill created by: ${createdBy}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  // Download bill as HTML file
  const downloadBill = () => {
    const subtotal = calculateSubtotal();
    if (subtotal === 0) {
      setError('No items with quantity > 0 to download!');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const billHTML = generateBillHTML();
    const blob = new Blob([billHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bill_${billNumber.replace(/[/\\]/g, '-')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setSuccess('Bill downloaded successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Handle payment completion - Save to DB then download/print
  const handlePaymentComplete = async () => {
    const subtotal = calculateSubtotal();
    if (subtotal === 0) {
      setError('No items with quantity > 0 in bill!');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Save to database first
    const savedData = await saveBillToDatabase();

    if (savedData) {
      // Then download the bill
      downloadBill();
    }
  };

  // Handle print - Save to DB then print
  const handlePrint = async () => {
    const subtotal = calculateSubtotal();
    if (subtotal === 0) {
      setError('No items with quantity > 0 to print!');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Save to database first
    const savedData = await saveBillToDatabase();

    if (savedData) {
      // Then print
      // Get the bill content
      const billContent = billPaperRef.current.outerHTML;

      // Create a new window for printing
      const printWindow = window.open('', '_blank');

      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Bill - ${billNumber}</title>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                  border: none;
                  background: none;
                  box-shadow: none;
                  outline: none;
                }
                
                body {
                  margin: 0;
                  padding: 0;
                  width: 80mm;
                  font-family: 'Courier New', monospace;
                  font-size: 11px;
                  line-height: 1.3;
                  background: white;
                }
                
                #billPaper {
                  width: 280px;
                  margin: 0 auto;
                  padding: 12px;
                  background: white;
                  border: none;
                }
                
                .bill-header {
                  text-align: center;
                  margin-bottom: 4px;
                  padding-bottom: 0px;
                  border-bottom: none !important;
                }
                
                .bill-header h1 {
                  font-size: 22px !important;
                  font-weight: bold !important;
                  letter-spacing: 0px !important;
                  color: #000 !important;
                  text-align: center !important;
                }
                
                .bill-header p {
                  text-align: center !important;
                }
                
                .bill-info {
                  margin: 4px 0 !important;
                  padding: 2px 0 !important;
                }
                
                .customer-section {
                  margin: 10px 0;
                  padding: 6px;
                  border: 1px solid #ddd !important;
                }
                
                .customer-row {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 3px;
                  font-size: 10px;
                }
                
                .customer-type-badge {
                  padding: 2px 6px;
                  border-radius: 3px;
                  font-size: 9px;
                  font-weight: bold;
                }
                
                .internal-badge {
                  background: #cce5ff !important;
                  color: #004085 !important;
                }
                
                .external-badge {
                  background: #fff3cd !important;
                  color: #856404 !important;
                }
                
                .vehicle-section {
                  margin: 8px 0;
                  padding: 6px;
                  border: 1px solid #ddd !important;
                }
                
                .vehicle-row {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 4px;
                  font-size: 10px;
                }
                
                .bill-items table {
                  width: 100%;
                  border-collapse: collapse;
                  font-size: 9px;
                }
                
                .bill-items th {
                  font-weight: bold;
                  padding: 3px 2px;
                  border-top: 1px solid #000 !important;
                  border-bottom: 1px solid #000 !important;
                  text-align: left;
                  font-size: 9px;
                }
                
                .bill-items td {
                  padding: 3px 2px;
                  border-bottom: 1px dotted #000 !important;
                  font-size: 9px;
                  vertical-align: top;
                }
                
                .bill-items tfoot td {
                  border-top: 1px solid #000 !important;
                  border-bottom: none !important;
                  font-weight: bold;
                }
                
                .bill-summary {
                  margin: 10px 0;
                  padding: 8px 0;
                  border-top: 1px solid #000 !important;
                }
                
                .summary-row {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 3px;
                  font-size: 10px;
                }
                
                .summary-row-total {
                  font-weight: bold;
                  font-size: 12px;
                  border-top: 1px dashed #000 !important;
                  padding-top: 6px;
                  margin-top: 6px;
                }
                
                .bill-footer {
                  text-align: center;
                  margin-top: 15px;
                  padding-top: 10px;
                  border-top: none !important;
                  font-size: 8px;
                }
                
                .created-by {
                  margin-top: 8px;
                  padding-top: 5px;
                  border-top: 1px dotted #000 !important;
                  font-size: 8px;
                  text-align: center;
                }
                
                input, select, button, textarea, .no-print {
                  display: none !important;
                }
                
                .payment-section {
                  display: none !important;
                }
                
                .discount-section {
                  display: none !important;
                }
                
                * {
                  background: white !important;
                  color: black !important;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                
                @page {
                  size: 80mm auto;
                  margin: 0;
                }
              </style>
            </head>
            <body>
              ${billContent}
              <script>
                window.onload = function() {
                  // Small delay to ensure styles are applied
                  setTimeout(function() {
                    window.print();
                    // Close after print dialog is handled
                    setTimeout(function() {
                      window.close();
                    }, 500);
                  }, 300);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        setError('Pop-up blocked! Please allow pop-ups for this site to print.');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  // Handle WhatsApp share
  const handleWhatsAppShare = () => {
    if (!customerPhone) {
      setError('Please enter customer phone number to share via WhatsApp');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Clean phone number (remove non-digits)
    const cleanPhone = customerPhone.replace(/\D/g, '');

    // Check if phone number is valid
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Format phone number for WhatsApp (add country code if not present)
    const whatsappNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    // Create message
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscountAmount();
    const taxAmount = calculateTaxAmount();
    const total = calculateTotal();
    const due = calculateDue();
    const activeProducts = selectedProducts.filter(p => p.quantity > 0);

    let message = `*GANAPATHY MEDICALS*\n`;
    message += `${shopDetails.address}\n`;
    message += `${shopDetails.city}\n`;
    if (shopDetails.phone) message += `Ph: ${shopDetails.phone}\n`;
    message += `Bill No: ${billNumber}\n`;
    message += `Date: ${currentDate} ${currentTime}\n`;
    message += `Customer: ${customerName}\n`;
    message += `Type: ${customerType === 'internal' ? 'INTERNAL' : 'EXTERNAL'}\n`;
    if (doctorName) message += `Doctor: ${doctorName}\n`;
    if (patientAge) message += `Patient: ${patientAge}Y / ${patientGender}\n`;
    message += `================\n`;
    message += `ITEMS:\n`;

    activeProducts.forEach(p => {
      message += `${p.name.substring(0, 15)}... ${p.quantity}x ₹${p.sellPrice} = ₹${p.total.toFixed(2)}\n`;
    });

    message += `================\n`;
    message += `Subtotal: ₹${subtotal.toFixed(2)}\n`;
    if (discountAmount > 0) message += `Discount: -₹${discountAmount.toFixed(2)}\n`;
    if (taxAmount > 0) message += `Tax: +₹${taxAmount.toFixed(2)}\n`;
    message += `*TOTAL: ₹${total.toFixed(2)}*\n`;
    message += `================\n`;
    message += `Payment: ${paymentMethod.toUpperCase()}\n`;
    message += `Paid: ₹${paidAmount.toFixed(2)}\n`;
    message += `Status: ${paymentStatus.toUpperCase()}\n`;
    if (due > 0) message += `Due: ₹${due.toFixed(2)}\n`;
    message += `================\n`;
    message += `Thank you for shopping with us!\n`;
    message += `Goods once sold not returnable\n`;
    message += `Created by: ${createdBy}`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);

    // Open WhatsApp with customer's number
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');

    setSuccess('WhatsApp opened with bill details!');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Clear bill
  const clearBill = () => {
    if (window.confirm('Clear all items?')) {
      setSelectedProducts([]);
      setCustomerName('Walk-in Customer');
      setCustomerPhone('');
      setCustomerEmail('');
      setCustomerGST('');
      setCustomerAddress('');
      setCustomerType('external');
      setCustomerDiscount(0);
      setDoctorName('');
      setDoctorRegNo('');
      setPatientName('');
      setPatientAge('');
      setPatientGender('Male');
      setPrescriptionImage(null);
      setIsPrescriptionRequired(false);
      setDiscount(0);
      setDiscountType('percentage');
      setManualDiscount(false);
      setTax(0);
      setTaxType('percentage');
      setPaidAmount(0);
      setCashReceived(0);
      setPaymentMethod('cash');
      setPaymentStatus('pending');
      setCardNumber('');
      setCardHolderName('');
      setUpiId('');
      setTransactionId('');
      setBankName('');
      setChequeNumber('');
      setError('');
      setSuccess('');
      setBillSaved(false);
      setShowWhatsApp(false);
      setLastGeneratedBill(null);
      setSavedBillId(null);
      generateBillNumber();
    }
  };

  // Handle new bill
  const handleNewBill = () => {
    clearBill();
  };

  // Handle key press for barcode
  const handleBarcodeKeyPress = (e) => {
    if (e.key === 'Enter') {
      getProductByBarcode();
    }
  };

  // Test API connection
  const testAPIConnection = async () => {
    try {
      const response = await api.get('/health');
      console.log('API Health:', response.data);
    } catch (err) {
      console.error('API Health Check Failed:', err);
    }
  };

  // Run API test on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { testAPIConnection(); }, []);

  // Filter out items with quantity 0 for display in bill summary
  const activeProducts = selectedProducts.filter(p => p.quantity > 0);
  const subtotal = calculateSubtotal();
  const discountAmount = calculateDiscountAmount();
  const taxAmount = calculateTaxAmount();
  const total = calculateTotal();
  const due = calculateDue();
  const change = calculateChange();

  // Dynamic styles that depend on state
  const dynamicStyles = {
    changeAmount: {
      fontWeight: 'bold',
      color: paidAmount >= total ? '#28a745' : '#dc3545',
      fontSize: '10px',
    },
    zeroQuantity: {
      opacity: 0.5,
      background: '#fff3cd',
    }
  };

  // Show login required message if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{ ...baseStyles.container, justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '10px', textAlign: 'center' }}>
          <h2>🔒 Authentication Required</h2>
          <p style={{ color: '#dc3545', margin: '20px 0' }}>{error || 'Please login to access billing'}</p>
          <button
            style={{ ...baseStyles.btn, ...baseStyles.btnPrimary, padding: '10px 30px' }}
            onClick={() => window.location.href = '/login'}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Handle phone number input change
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 10) {
      setCustomerPhone(value);
    }
  };

  return (
    <div style={baseStyles.container}>
      {/* Left Panel - Product Search & Selection */}
      <div style={baseStyles.productPanel} className="no-print">
        <h2 style={baseStyles.productPanelTitle}>🔍 Search & Add Products</h2>

        {/* Company Selector */}
        {companies.length > 0 && (
          <div style={baseStyles.companySelector}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onClick={() => setShowCompanySelector(!showCompanySelector)}
            >
              <span>🏢 <span style={baseStyles.companyName}>{selectedCompany ? selectedCompany.name : 'Select Company'}</span></span>
              <span style={{ fontSize: '12px' }}>{showCompanySelector ? '▲' : '▼'}</span>
            </div>
            {showCompanySelector && (
              <div style={baseStyles.companyDropdown}>
                {companies.map(company => (
                  <div
                    key={company.id}
                    style={baseStyles.companyOption}
                    onClick={() => handleCompanySelect(company)}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0f7ff'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {company.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && <div style={{ ...baseStyles.alert, ...baseStyles.alertError }}>⚠️ {error}</div>}
        {success && <div style={{ ...baseStyles.alert, ...baseStyles.alertSuccess }}>✅ {success}</div>}

        {/* Product Search - TOP PRIORITY */}
        <div style={{ ...baseStyles.searchSection, border: '2px solid #007bff', background: '#f0f7ff' }}>
          <div style={baseStyles.searchBox}>
            <label style={{ ...baseStyles.searchLabel, fontSize: '16px', color: '#007bff' }}>🔍 Search Products:</label>
            <input
              type="text"
              style={{ ...baseStyles.searchInput, borderColor: '#007bff', fontSize: '16px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type product name or model..."
              autoComplete="off"
              autoFocus
              onFocus={(e) => e.target.style.borderColor = '#0056b3'}
              onBlur={(e) => e.target.style.borderColor = '#007bff'}
            />
            {searchLoading && <div style={baseStyles.searchLoading}>Searching...</div>}
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div style={{ ...baseStyles.searchResults, position: 'relative', width: '100%', maxHeight: '250px' }}>
              {searchResults.map(product => (
                <div
                  key={product.id}
                  style={baseStyles.searchResultItem}
                  onClick={() => addProductToBill(product)}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e8f4ff'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={baseStyles.resultInfo}>
                    <div style={baseStyles.resultName}>{product.name}</div>
                    <div style={baseStyles.resultDetails}>
                      {product.model && `${product.model} | `}Batch: {product.batchNo || 'N/A'} | Exp: {product.expiryDate || 'N/A'} | Stock: {product.quantity}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={baseStyles.resultPrice}>₹{product.sellPrice}</div>
                    <div style={{ fontSize: '10px', color: '#28a745' }}>+ Add</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Barcode Scanner */}
          <div style={{ ...baseStyles.barcodeInput, marginTop: '10px' }}>
            <input
              type="text"
              style={baseStyles.barcodeField}
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyPress={handleBarcodeKeyPress}
              placeholder="📱 Scan barcode..."
              onFocus={(e) => e.target.style.borderColor = '#28a745'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
            <button
              style={{ ...baseStyles.barcodeButton, ...(loading ? baseStyles.barcodeButtonDisabled : {}) }}
              onClick={getProductByBarcode}
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>

        {/* Added Items List */}
        <div style={baseStyles.selectedProducts}>
          <h3 style={baseStyles.selectedProductsTitle}>
            🛒 Bill Items ({activeProducts.length} active / {selectedProducts.length} total)
          </h3>
          <div style={baseStyles.selectedItemsList}>
            {selectedProducts.length === 0 ? (
              <p style={baseStyles.noItems}>No items added yet. Search or scan products above.</p>
            ) : (
              selectedProducts.map(product => (
                <div
                  key={product.id}
                  style={{ ...baseStyles.selectedItem, ...(product.quantity === 0 ? dynamicStyles.zeroQuantity : {}) }}
                >
                  <div style={baseStyles.itemInfo}>
                    <span style={baseStyles.itemName}>{product.name}</span>
                    {product.model && <span style={baseStyles.itemModel}>{product.model}</span>}
                    <span style={{ fontSize: '10px', color: '#666' }}>
                      Batch: {product.batchNo || '-'} | Exp: {product.expiryDate || '-'}
                    </span>
                    {product.quantity === 0 && <span style={{ fontSize: '9px', color: '#856404' }}>(Zero qty)</span>}
                  </div>
                  <div style={baseStyles.itemPrice}>₹{product.sellPrice}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <button
                      style={{ width: '22px', height: '22px', border: '1px solid #ccc', borderRadius: '3px', background: '#f0f0f0', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', lineHeight: '1', padding: '0' }}
                      onClick={() => updateQuantity(product.id, product.quantity - 1)}
                    >−</button>
                    <input
                      type="number"
                      style={{ ...baseStyles.itemQuantity, width: '45px' }}
                      value={product.quantity}
                      min="0"
                      max={product.maxQuantity}
                      onChange={(e) => updateQuantity(product.id, e.target.value)}
                    />
                    <button
                      style={{ width: '22px', height: '22px', border: '1px solid #ccc', borderRadius: '3px', background: '#f0f0f0', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', lineHeight: '1', padding: '0' }}
                      onClick={() => updateQuantity(product.id, product.quantity + 1)}
                      disabled={product.quantity >= product.maxQuantity}
                    >+</button>
                  </div>
                  <div style={baseStyles.itemTotal}>₹{product.total.toFixed(2)}</div>
                  <button
                    style={baseStyles.removeBtn}
                    onClick={() => removeProduct(product.id)}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#c82333'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#dc3545'}
                    title="Remove"
                  >×</button>
                </div>
              ))
            )}
          </div>
          {selectedProducts.length > 0 && (
            <p style={{ fontSize: '11px', color: '#666', marginTop: '10px', textAlign: 'center' }}>
              💡 Set quantity to 0 to keep item without billing
            </p>
          )}
        </div>

        {/* Patient / Doctor Section - Below products */}
        <div style={{ ...baseStyles.searchSection, marginTop: '20px' }}>
          <h3 style={{ ...baseStyles.selectedProductsTitle, border: 'none', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🩺 Patient & Doctor Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div style={baseStyles.searchBox}>
              <label style={baseStyles.searchLabel}>Doctor Name:</label>
              <input type="text" style={baseStyles.searchInput} value={doctorName} onChange={(e) => setDoctorName(e.target.value)} placeholder="Dr. Name" />
            </div>
            <div style={baseStyles.searchBox}>
              <label style={baseStyles.searchLabel}>Doctor Reg No:</label>
              <input type="text" style={baseStyles.searchInput} value={doctorRegNo || ''} onChange={(e) => setDoctorRegNo(e.target.value)} placeholder="Reg No" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div style={baseStyles.searchBox}>
              <label style={baseStyles.searchLabel}>Patient Name:</label>
              <input type="text" style={baseStyles.searchInput} value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Patient Name" />
            </div>
            <div style={baseStyles.searchBox}>
              <label style={baseStyles.searchLabel}>Patient Age:</label>
              <input type="number" style={baseStyles.searchInput} value={patientAge} onChange={(e) => setPatientAge(e.target.value)} placeholder="Age" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div style={baseStyles.searchBox}>
              <label style={baseStyles.searchLabel}>Patient Gender:</label>
              <select style={baseStyles.searchInput} value={patientGender} onChange={(e) => setPatientGender(e.target.value)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div style={{ ...baseStyles.searchBox, border: isPrescriptionRequired ? '2px solid #ef4444' : '1px solid #ddd', padding: '10px', borderRadius: '8px', background: isPrescriptionRequired ? '#fef2f2' : 'transparent' }}>
            <label style={{ ...baseStyles.searchLabel, color: isPrescriptionRequired ? '#ef4444' : '#333' }}>
              {isPrescriptionRequired ? '⚠️ Prescription Required' : '📄 Upload Prescription'}
            </label>
            <input
              type="file"
              accept="image/*"
              style={{ ...baseStyles.searchInput, padding: '5px' }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setPrescriptionImage(reader.result);
                  reader.readAsDataURL(file);
                }
              }}
            />
            {prescriptionImage && (
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <img src={prescriptionImage} alt="Prescription" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px', border: '1px solid #ddd' }} />
                <button onClick={() => setPrescriptionImage(null)} style={{ ...baseStyles.btn, ...baseStyles.btnDanger, padding: '4px 8px', fontSize: '10px', marginTop: '5px' }}>Remove</button>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Right Panel - Thermal Bill */}
      <div style={baseStyles.billPanel} className="no-print">
        <div style={baseStyles.billContainer}>
          <div
            style={baseStyles.billPaper}
            id="billPaper"
            ref={billPaperRef}
          >
            <div className="bill-header">
              {/* Top info bar: GSTIN | CASH BILL | Mobile */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px', marginBottom: '4px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
                <div><strong>GSTIN:</strong> {customerGST || shopDetails.gst || defaultShopDetails.gst}</div>
                <span style={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '10px' }}>CASH BILL</span>
                <span style={{ fontWeight: 'bold' }}>Mob: {shopDetails.phone || defaultShopDetails.phone}</span>
              </div>
              <h1 style={baseStyles.billHeaderH1}>{shopDetails.name}</h1>
              <p style={{ ...baseStyles.billHeaderP, fontWeight: 'bold', fontSize: '10px' }}>{shopDetails.subtitle || defaultShopDetails.subtitle}</p>
              <p style={baseStyles.billHeaderP}>{shopDetails.address}</p>
              {shopDetails.city && <p style={baseStyles.billHeaderP}>{shopDetails.city}</p>}
            </div>

            <div className="bill-info" style={{ margin: '4px 0', padding: '2px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', fontSize: '10px', marginBottom: '4px', gap: '4px', overflow: 'hidden' }}>
                <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}><strong>Bill No.</strong> <span style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0px' }}>{billNumber}</span></span>
                <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}><strong>Date:</strong> {currentDate}</span>
              </div>
              <div style={{ fontSize: '10px', marginBottom: '8px' }}>
                <strong>Dr.</strong>&nbsp;{doctorName ? `${doctorName}${doctorRegNo ? ` (${doctorRegNo})` : ''}` : ''}
                <div style={{ borderBottom: '1px dotted #999', marginTop: '4px' }}></div>
              </div>
              <div style={{ fontSize: '10px', marginBottom: '8px' }}>
                <strong>Name.</strong>&nbsp;{patientName}{patientAge ? `, ${patientAge}Y` : ''}{patientGender ? ` / ${patientGender}` : ''}
                <div style={{ borderBottom: '1px dotted #999', marginTop: '4px' }}></div>
              </div>
            </div>
            <div className="no-print" style={{ fontSize: '10px', borderBottom: '1px dotted #999', paddingBottom: '4px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>

              <input type="text" style={{ ...baseStyles.customerInput, marginBottom: 0, flex: 1 }} value={customerGST} onChange={(e) => setCustomerGST(e.target.value)} placeholder="Customer GSTIN" />
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #333', marginTop: '4px', fontSize: '9px', fontFamily: "'Courier New', monospace" }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #333', padding: '3px 2px', fontWeight: 'bold', textAlign: 'center', width: '28px' }}>Qty.</th>
                  <th style={{ border: '1px solid #333', padding: '3px 2px', fontWeight: 'bold', textAlign: 'center' }}>PARTICULARS</th>
                  <th style={{ border: '1px solid #333', padding: '3px 2px', fontWeight: 'bold', textAlign: 'center', width: '36px' }}>Batch</th>
                  <th style={{ border: '1px solid #333', padding: '3px 2px', fontWeight: 'bold', textAlign: 'center', width: '36px' }}>Expiry</th>
                  <th style={{ border: '1px solid #333', padding: '0', fontWeight: 'bold', textAlign: 'center', width: '54px' }}>
                    <div style={{ borderBottom: '1px solid #333', padding: '2px 3px' }}>Amount</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 4px', fontSize: '8px' }}><span>Rs.</span><span>P.</span></div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeProducts.length === 0 ? (
                  <tr>
                    <td style={{ border: '1px solid #333', padding: '3px 2px', textAlign: 'center', height: '140px', verticalAlign: 'top' }}></td>
                    <td style={{ border: '1px solid #333', padding: '3px 2px', height: '140px', verticalAlign: 'top' }}></td>
                    <td style={{ border: '1px solid #333', padding: '3px 2px', height: '140px', verticalAlign: 'top' }}></td>
                    <td style={{ border: '1px solid #333', padding: '3px 2px', height: '140px', verticalAlign: 'top' }}></td>
                    <td style={{ border: '1px solid #333', padding: '3px 2px', height: '140px', verticalAlign: 'top' }}></td>
                  </tr>
                ) : (
                  activeProducts.map(product => (
                    <tr key={product.id}>
                      <td style={{ border: '1px solid #333', padding: '3px 2px', textAlign: 'center', verticalAlign: 'top' }}>{product.quantity}</td>
                      <td style={{ border: '1px solid #333', padding: '3px 2px', verticalAlign: 'top' }}>
                        {product.name}
                        {product.model && <div style={{ fontSize: '7px', color: '#555' }}>{product.model}</div>}
                      </td>
                      <td style={{ border: '1px solid #333', padding: '3px 2px', fontSize: '7px', textAlign: 'center', verticalAlign: 'top' }}>{product.batchNo}</td>
                      <td style={{ border: '1px solid #333', padding: '3px 2px', fontSize: '7px', textAlign: 'center', verticalAlign: 'top' }}>{product.expiryDate}</td>
                      <td style={{ border: '1px solid #333', padding: '3px 2px', textAlign: 'right', verticalAlign: 'top' }}>{product.total.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td style={{ border: '1px solid #333', padding: '3px 2px' }}></td>
                  <td style={{ border: '1px solid #333', padding: '3px 2px', fontSize: '8px' }}>E. &amp; O.E.</td>
                  <td style={{ border: '1px solid #333', padding: '3px 2px' }}></td>
                  <td style={{ border: '1px solid #333', padding: '3px 2px', fontWeight: 'bold', fontSize: '8px', textAlign: 'center' }}>TOTAL</td>
                  <td style={{ border: '1px solid #333', padding: '3px 2px', fontWeight: 'bold', textAlign: 'right' }}>{total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            {/* Summary only shows discount/tax if applicable */}
            {(discount > 0 || tax > 0) && (
              <div style={{ fontSize: '9px', padding: '3px 2px', borderBottom: '1px dotted #ccc' }}>
                {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Discount ({discount}{discountType === 'percentage' ? '%' : '₹'}):</span><span>-₹{discountAmount.toFixed(2)}</span></div>}
                {tax > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tax ({tax}{taxType === 'percentage' ? '%' : '₹'}):</span><span>+₹{taxAmount.toFixed(2)}</span></div>}
              </div>
            )}

            <div className="payment-section">
              <div style={baseStyles.paymentRow}>
                <span>Payment Method:</span>
                <select
                  style={baseStyles.paymentSelect}
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="cash">💵 Cash</option>
                  <option value="card">💳 Card</option>
                  <option value="upi">📱 UPI</option>
                  <option value="cheque">📝 Cheque</option>
                  <option value="mixed">🔄 Mixed</option>
                </select>
              </div>

              {showPaymentDetails && (
                <div style={baseStyles.paymentDetails}>
                  {paymentMethod === 'cash' && (
                    <>
                      <div style={baseStyles.paymentRow}>
                        <span>Cash Received:</span>
                        <input
                          type="number"
                          style={baseStyles.paymentInput}
                          value={cashReceived}
                          onChange={(e) => handleCashPayment(e.target.value)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div style={baseStyles.paymentRow}>
                        <span>Change:</span>
                        <span style={dynamicStyles.changeAmount}>₹{change.toFixed(2)}</span>
                      </div>
                    </>
                  )}

                  {paymentMethod === 'card' && (
                    <>
                      <input
                        type="text"
                        style={baseStyles.paymentDetailsInput}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="Card Number (last 4 digits)"
                        maxLength="4"
                      />
                      <input
                        type="text"
                        style={baseStyles.paymentDetailsInput}
                        value={cardHolderName}
                        onChange={(e) => setCardHolderName(e.target.value)}
                        placeholder="Card Holder Name"
                      />
                      <input
                        type="text"
                        style={baseStyles.paymentDetailsInput}
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Transaction ID"
                      />
                    </>
                  )}

                  {paymentMethod === 'upi' && (
                    <>
                      <input
                        type="text"
                        style={baseStyles.paymentDetailsInput}
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="UPI ID"
                      />
                      <input
                        type="text"
                        style={baseStyles.paymentDetailsInput}
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Transaction ID"
                      />
                    </>
                  )}

                  {paymentMethod === 'cheque' && (
                    <>
                      <input
                        type="text"
                        style={baseStyles.paymentDetailsInput}
                        value={chequeNumber}
                        onChange={(e) => setChequeNumber(e.target.value)}
                        placeholder="Cheque Number"
                      />
                      <input
                        type="text"
                        style={baseStyles.paymentDetailsInput}
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="Bank Name"
                      />
                    </>
                  )}

                  {paymentMethod === 'mixed' && (
                    <div style={{ fontSize: '9px', color: '#666' }}>
                      <p>Mixed payment - Please enter details in POS</p>
                    </div>
                  )}
                </div>
              )}

              <div style={baseStyles.paymentRow}>
                <span>Paid Amount:</span>
                <input
                  type="number"
                  style={baseStyles.paymentInput}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div style={baseStyles.paymentRow}>
                <span>Payment Status:</span>
                <span style={{
                  color: paymentStatus === 'paid' ? '#28a745' :
                    paymentStatus === 'partial' ? '#ffc107' : '#dc3545',
                  fontWeight: 'bold'
                }}>
                  {paymentStatus.toUpperCase()}
                </span>
              </div>

              {due > 0 && paymentStatus !== 'pending' && (
                <div style={baseStyles.paymentRow}>
                  <span>Due Amount:</span>
                  <span>₹{due.toFixed(2)}</span>
                </div>
              )}

              <button
                style={{
                  ...baseStyles.btn,
                  ...baseStyles.btnSecondary,
                  width: '100%',
                  marginTop: '5px',
                  padding: '5px'
                }}
                onClick={handleExactPayment}
              >
                Exact Amount
              </button>
            </div>

            <div className="bill-footer" style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #333', fontSize: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span>Cash Received with thanks</span>
                <span style={{ fontWeight: 'bold' }}>Signature</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ ...baseStyles.billFooterP, margin: '0 0 2px 0' }}>Goods once sold cannot be taken back.</p>
                  <p style={{ ...baseStyles.billFooterP, margin: '0 0 2px 0' }}>{shopDetails.dlNo || defaultShopDetails.dlNo}</p>
                  {paymentMethod !== 'cash' && transactionId && (
                    <p style={{ ...baseStyles.billFooterP, margin: '0' }}>{paymentMethod.toUpperCase()}: {transactionId}</p>
                  )}
                </div>
                <div style={{ color: '#666', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                  Served by: {createdBy}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={baseStyles.actionButtons} className="no-print">
          <button
            style={{
              ...baseStyles.btn,
              ...baseStyles.btnPrimary,
              ...(loading || activeProducts.length === 0 ? baseStyles.btnDisabled : {})
            }}
            onClick={handlePrint}
            disabled={loading || activeProducts.length === 0}
          >
            {loading ? '⏳ Saving...' : '🖨️ Print'}
          </button>
          <button
            style={{
              ...baseStyles.btn,
              ...baseStyles.btnSuccess,
              ...(loading || activeProducts.length === 0 ? baseStyles.btnDisabled : {})
            }}
            onClick={handlePaymentComplete}
            disabled={loading || activeProducts.length === 0}
          >
            {loading ? '⏳ Saving...' : '💰 Pay & Download'}
          </button>
          <button
            style={{
              ...baseStyles.btn,
              ...baseStyles.btnInfo,
              ...(loading ? baseStyles.btnDisabled : {})
            }}
            onClick={handleNewBill}
            disabled={loading}
          >
            🆕 New
          </button>
          <button
            style={{
              ...baseStyles.btn,
              ...baseStyles.btnDanger,
              ...(loading ? baseStyles.btnDisabled : {})
            }}
            onClick={clearBill}
            disabled={loading}
          >
            🗑️ Clear
          </button>
        </div>

        {/* WhatsApp Share Button - Always visible when bill is saved */}
        {showWhatsApp && lastGeneratedBill && (
          <button
            style={baseStyles.whatsappButton}
            onClick={handleWhatsAppShare}
            onMouseEnter={(e) => e.currentTarget.style.background = '#128C7E'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#25D366'}
          >
            <span>📱</span>
            Share Bill on WhatsApp to {customerPhone || 'Customer'}
          </button>
        )}

        {billSaved && (
          <p style={{ fontSize: '10px', color: '#28a745', textAlign: 'center', marginTop: '5px' }}>
            ✓ Bill saved to database
          </p>
        )}
      </div>
      <div>
        {/* Hidden download link */}
        {/* eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/anchor-is-valid */}
        <a ref={downloadLinkRef} style={baseStyles.downloadLink} href="#download" aria-hidden="true" />
      </div>
    </div>
  );
};

export default Bill;

