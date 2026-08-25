import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, CATEGORY_LIST } from '../../engine/categories';
import { predictPaymentCategory, PredictionResult } from '../../engine/merchantMemory';
import { Category, ClassificationType } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Brain, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Smartphone,
  Layers,
  Zap,
  Info
} from 'lucide-react';

export const PaymentModal: React.FC = () => {
  const { 
    isPaymentModalOpen, 
    closePaymentModal, 
    paymentModalData, 
    merchantMemory, 
    addPaymentTransaction,
    demoStep,
    nextDemoStep 
  } = useApp();

  const [recipient, setRecipient] = useState<string>('Ramesh Kumar');
  const [amount, setAmount] = useState<string>('20');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Food');
  const [userOverrodeCategory, setUserOverrodeCategory] = useState<boolean>(false);
  const [isForcedFirstTime, setIsForcedFirstTime] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');
  
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [completedTx, setCompletedTx] = useState<any>(null);

  // Initialize or update fields when modal opens
  useEffect(() => {
    if (isPaymentModalOpen) {
      setIsSuccess(false);
      setUserOverrodeCategory(false);
      const initialRecipient = paymentModalData?.recipient || 'Ramesh Kumar';
      const initialAmount = paymentModalData?.amount !== undefined ? String(paymentModalData.amount) : '20';
      const stepNum = paymentModalData?.demoStepNumber;
      
      setRecipient(initialRecipient);
      setAmount(initialAmount);
      setNote('');

      const numAmt = parseFloat(initialAmount) || 0;
      let pred = predictPaymentCategory(initialRecipient, numAmt, merchantMemory);
      
      if (stepNum === 1) {
        setIsForcedFirstTime(true);
        pred = {
          category: 'Food',
          classificationType: 'user_classified',
          confidence: 0.1,
          reason: 'Unknown recipient (First payment)',
          isUnusual: false,
          isMultiPurpose: false,
          requiresPrompt: true,
        };
      } else {
        setIsForcedFirstTime(false);
      }

      setPrediction(pred);
      setSelectedCategory(pred.category);
    }
  }, [isPaymentModalOpen, paymentModalData, merchantMemory]);

  // Re-calculate prediction whenever recipient or amount changes
  const handleRecipientOrAmountChange = (newRecipient: string, newAmountStr: string, forceUnknown: boolean = false) => {
    setRecipient(newRecipient);
    setAmount(newAmountStr);
    setIsForcedFirstTime(forceUnknown);

    if (forceUnknown) {
      setPrediction({
        category: 'Food',
        classificationType: 'user_classified',
        confidence: 0.1,
        reason: 'Unknown recipient (First payment)',
        isUnusual: false,
        isMultiPurpose: false,
        requiresPrompt: true,
      });
      setSelectedCategory('Food');
      setUserOverrodeCategory(false);
      return;
    }

    const numAmt = parseFloat(newAmountStr) || 0;
    const pred = predictPaymentCategory(newRecipient, numAmt, merchantMemory);
    setPrediction(pred);
    if (!userOverrodeCategory) {
      setSelectedCategory(pred.category);
    }
  };

  const handleSelectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setUserOverrodeCategory(true);
  };

  const handlePay = () => {
    const numAmt = parseFloat(amount) || 0;
    if (!recipient.trim() || numAmt <= 0) return;

    let classificationType: ClassificationType = 'user_classified';
    let reason = '';

    if (isForcedFirstTime) {
      classificationType = 'user_classified';
      reason = `Initial payment classified as ${selectedCategory}`;
    } else if (prediction?.classificationType === 'auto_merchant') {
      classificationType = 'auto_merchant';
      reason = prediction.reason;
    } else if (prediction?.isUnusual) {
      classificationType = 'unusual_detected';
      reason = `Unusual payment confirmed as ${selectedCategory}`;
    } else if (prediction?.isMultiPurpose) {
      classificationType = userOverrodeCategory ? 'user_classified' : 'multi_purpose_suggested';
      reason = userOverrodeCategory
        ? `User selected ${selectedCategory} for multi-purpose recipient`
        : prediction.reason;
    } else if (prediction?.classificationType === 'merchant_memory' && !userOverrodeCategory) {
      classificationType = 'merchant_memory';
      reason = prediction.reason;
    } else {
      classificationType = 'user_classified';
      reason = `User classified as ${selectedCategory}`;
    }

    const tx = addPaymentTransaction(
      recipient,
      numAmt,
      selectedCategory,
      classificationType,
      reason,
      note
    );

    setCompletedTx(tx);
    setIsSuccess(true);
  };

  if (!isPaymentModalOpen) return null;

  const numAmount = parseFloat(amount) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                <span>UPI Payment Simulator</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  DEMO SAFE
                </span>
              </h3>
              <p className="text-xs text-slate-400">Scan & Pay / Send Money</p>
            </div>
          </div>
          <button
            onClick={closePaymentModal}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {!isSuccess ? (
            <>
              {/* Preset Scenario Shortcuts */}
              <div className="bg-slate-950/50 rounded-2xl p-3 border border-slate-800">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Quick Test Scenarios</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleRecipientOrAmountChange('Ramesh Kumar', '20', true)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      recipient === 'Ramesh Kumar' && amount === '20' && isForcedFirstTime
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-medium'
                        : 'bg-slate-800/80 border-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    1. Ramesh ₹20 (1st Pay / Unknown)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRecipientOrAmountChange('Ramesh Kumar', '30', false)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      recipient === 'Ramesh Kumar' && amount === '30' && !isForcedFirstTime
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-medium'
                        : 'bg-slate-800/80 border-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    2. Ramesh ₹30 (Remembered)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRecipientOrAmountChange('Ramesh Kumar', '1500', false)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      recipient === 'Ramesh Kumar' && amount === '1500'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-medium'
                        : 'bg-slate-800/80 border-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    3. Ramesh ₹1500 (Unusual)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRecipientOrAmountChange('Rohit Kumar', '300', false)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      recipient === 'Rohit Kumar' && amount === '300'
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 font-medium'
                        : 'bg-slate-800/80 border-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    4. Rohit ₹300 (Multi-Use)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRecipientOrAmountChange('Swiggy', '250', false)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      recipient === 'Swiggy'
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-medium'
                        : 'bg-slate-800/80 border-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    5. Swiggy ₹250 (Merchant)
                  </button>
                </div>
              </div>

              {/* Recipient & Amount Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Paying Recipient (UPI ID / Name)
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => handleRecipientOrAmountChange(e.target.value, amount, false)}
                    placeholder="Enter recipient name (e.g. Ramesh Kumar)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => handleRecipientOrAmountChange(recipient, e.target.value, isForcedFirstTime)}
                      placeholder="0"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-slate-100 font-semibold text-lg focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* DYNAMIC MERCHANT MEMORY INTELLIGENCE SECTION */}
              <div className="pt-1">
                {/* 1. SCENARIO: UNUSUAL PAYMENT DETECTED */}
                {!isForcedFirstTime && prediction?.isUnusual && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-3 animate-slideDown">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-amber-300 text-sm">⚠ Unusual Payment Detected</h4>
                          <span className="text-[10px] uppercase font-bold bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-full">
                            Anomaly
                          </span>
                        </div>
                        <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                          You normally pay <strong className="text-white">{recipient}</strong> around{' '}
                          <strong className="text-amber-300">
                            ₹{prediction.normalRange?.min || 10}–₹{prediction.normalRange?.max || 50}
                          </strong>
                          . This ₹{numAmount.toLocaleString('en-IN')} payment is outside your normal range.
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-amber-500/20 pt-3">
                      <p className="text-xs font-semibold text-amber-100 mb-2">
                        What was this payment for?
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {CATEGORY_LIST.map((catKey) => {
                          const isSelected = selectedCategory === catKey;
                          const catInfo = CATEGORIES[catKey];
                          return (
                            <button
                              key={catKey}
                              type="button"
                              onClick={() => handleSelectCategory(catKey)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                                isSelected
                                  ? `${catInfo.bgColor} ${catInfo.borderColor} ${catInfo.textColor} ring-2 ring-amber-400/50 shadow-md`
                                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                              }`}
                            >
                              <CategoryIcon category={catKey} className="w-3.5 h-3.5" />
                              <span className="truncate">{catInfo.label.split(' ')[0]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. SCENARIO: REMEMBERED RECIPIENT (Merchant Memory Active) */}
                {!isForcedFirstTime && !prediction?.isUnusual && prediction?.classificationType === 'merchant_memory' && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 space-y-2.5 animate-slideDown">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                          <Brain className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          Merchant Memory Recognized
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                        {Math.round((prediction.confidence || 0.95) * 100)}% Match
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-slate-950/70 rounded-xl p-3 border border-emerald-500/20">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg ${CATEGORIES[selectedCategory].bgColor} flex items-center justify-center border ${CATEGORIES[selectedCategory].borderColor}`}>
                          <CategoryIcon category={selectedCategory} className={`w-4 h-4 ${CATEGORIES[selectedCategory].textColor}`} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                            <span>✓ {CATEGORIES[selectedCategory].label}</span>
                          </p>
                          <p className="text-[11px] text-emerald-300/80">
                            Automatically categorized from your previous payment
                          </p>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setUserOverrodeCategory(!userOverrodeCategory)}
                        className="text-[11px] text-slate-400 hover:text-slate-200 underline font-medium"
                      >
                        {userOverrodeCategory ? 'Done' : 'Change'}
                      </button>
                    </div>

                    {userOverrodeCategory && (
                      <div className="grid grid-cols-3 gap-1.5 pt-2 animate-fadeIn">
                        {CATEGORY_LIST.map((catKey) => (
                          <button
                            key={catKey}
                            type="button"
                            onClick={() => handleSelectCategory(catKey)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              selectedCategory === catKey
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                          >
                            {catKey}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. SCENARIO: MULTI-PURPOSE RECIPIENT (e.g. Rohit Kumar) */}
                {!isForcedFirstTime && !prediction?.isUnusual && prediction?.isMultiPurpose && (
                  <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-4 space-y-3 animate-slideDown">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                          <Layers className="w-4 h-4 text-indigo-400" />
                        </div>
                        <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                          Multi-Purpose Recipient
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Historical Split
                      </span>
                    </div>

                    <p className="text-xs text-indigo-200/90 leading-relaxed">
                      You pay <strong className="text-white">{recipient}</strong> for multiple purposes. SpendWise predicts{' '}
                      <strong className="text-indigo-300">Likely {selectedCategory}</strong> based on your payment patterns.
                    </p>

                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase">
                        Select Purpose for this ₹{numAmount} payment:
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {(prediction.suggestedCategories || [
                          { category: 'Food' as Category, percentage: 40 },
                          { category: 'Personal' as Category, percentage: 35 },
                          { category: 'Education' as Category, percentage: 25 },
                        ]).map((sug) => {
                          const isSelected = selectedCategory === sug.category;
                          return (
                            <button
                              key={sug.category}
                              type="button"
                              onClick={() => handleSelectCategory(sug.category)}
                              className={`p-2 rounded-xl text-left border transition-all ${
                                isSelected
                                  ? 'bg-indigo-500/20 border-indigo-500/60 text-indigo-200 ring-2 ring-indigo-400/40'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span>{sug.category}</span>
                                <span className="text-[10px] opacity-75">{sug.percentage}%</span>
                              </div>
                              <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                                <div
                                  className="bg-indigo-400 h-full rounded-full"
                                  style={{ width: `${sug.percentage}%` }}
                                />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. SCENARIO: KNOWN COMMERCIAL MERCHANT (Swiggy, Uber, etc.) */}
                {!isForcedFirstTime && !prediction?.isUnusual && prediction?.classificationType === 'auto_merchant' && (
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 space-y-2 animate-slideDown">
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Zap className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Verified Merchant Catalog Match
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong>{recipient}</strong> is automatically classified as{' '}
                      <strong className="text-cyan-300">{selectedCategory}</strong> from standard commercial directories.
                    </p>
                  </div>
                )}

                {/* 5. SCENARIO: FIRST-TIME UNKNOWN RECIPIENT */}
                {(isForcedFirstTime ||
                  (!prediction?.isUnusual &&
                    !prediction?.isMultiPurpose &&
                    prediction?.classificationType === 'user_classified')) && (
                  <div className="bg-slate-950/80 border border-slate-700/70 rounded-2xl p-4 space-y-3 animate-slideDown">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Info className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          First Payment to {recipient}
                        </span>
                      </div>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                        Unknown Recipient
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      <strong className="text-emerald-400 font-semibold">What was this payment for?</strong>
                      <br />
                      SpendWise will remember this category for future transactions with {recipient}.
                    </p>

                    <div className="grid grid-cols-3 gap-2">
                      {CATEGORY_LIST.map((catKey) => {
                        const isSelected = selectedCategory === catKey;
                        const catInfo = CATEGORIES[catKey];
                        return (
                          <button
                            key={catKey}
                            type="button"
                            onClick={() => handleSelectCategory(catKey)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all text-left ${
                              isSelected
                                ? `${catInfo.bgColor} ${catInfo.borderColor} ${catInfo.textColor} ring-2 ring-emerald-400/40 font-bold shadow-md`
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                          >
                            <CategoryIcon category={catKey} className="w-4 h-4 shrink-0" />
                            <span className="truncate">{catInfo.label.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* SUCCESS SCREEN */
            <div className="py-8 px-4 text-center space-y-5 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center mx-auto shadow-glow-emerald">
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              </div>

              <div>
                <h4 className="text-xl font-extrabold text-slate-100">
                  ₹{numAmount.toLocaleString('en-IN')} Paid Successfully
                </h4>
                <p className="text-xs text-slate-400 mt-1">To {recipient} • UPI Ref: {completedTx?.id}</p>
              </div>

              {/* Learning summary card */}
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-left space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Brain className="w-4 h-4" />
                  <span>Merchant Memory Learned</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Recipient:</span>
                  <span className="font-semibold text-slate-200">{recipient}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Assigned Category:</span>
                  <span className={`font-semibold ${CATEGORIES[selectedCategory].textColor}`}>
                    {selectedCategory}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Behavioral Rule:</span>
                  <span className="text-xs font-mono text-emerald-300">
                    {recipient} → {selectedCategory}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  ✓ Future payments to {recipient} will automatically be classified as {selectedCategory} without prompting.
                </p>
              </div>

              {demoStep && demoStep < 7 && (
                <div className="p-3 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-xs text-indigo-300 text-left flex items-center justify-between">
                  <div>
                    <p className="font-bold">Next Judge Step Ready</p>
                    <p className="text-[11px] text-indigo-200">
                      Step {demoStep + 1}: Check remembered classification or next test case.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      closePaymentModal();
                      nextDemoStep();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow"
                  >
                    <span>Proceed</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          {!isSuccess ? (
            <>
              <button
                type="button"
                onClick={closePaymentModal}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePay}
                disabled={!recipient.trim() || numAmount <= 0}
                className="flex-1 py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-glow-emerald disabled:opacity-50 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Pay ₹{numAmount.toLocaleString('en-IN') || '0'}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={closePaymentModal}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm transition-colors"
            >
              Done & View Transactions
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
