// আপনার অফিশিয়াল লেজার ডেটাসেট (প্রতিটি কোম্পানির স্টেটমেন্ট টেবিলসহ)
const defaultCorporateData = {
    dealerCode: "DEAL002905",
    companies: {
        parks: {
            name: "PARKS (S.R. Park Statement)",
            openingBalance: 323077.20,
            transactions: [
                { date: "2026-07-01", particulars: "Opening Balance Brought Forward", debit: 0, credit: 0 },
                { date: "2026-07-05", particulars: "Bill Invoice #P-1042", debit: 228469.40, credit: 0 },
                { date: "2026-07-20", particulars: "Bank Deposit / Payment Collection", debit: 0, credit: 551546.60 }
            ]
        },
        ele: {
            name: "ELE (Minister Hi-Tech Statement)",
            openingBalance: 773125.50,
            transactions: [
                { date: "2026-07-01", particulars: "Opening Balance Brought Forward", debit: 0, credit: 0 },
                { date: "2026-07-10", particulars: "Official Goods Supply Bill", debit: 3082821.90, credit: 0 },
                { date: "2026-07-25", particulars: "Dealer Payment / Collection Adjustment", debit: 0, credit: 2545773.00 }
            ]
        },
        myone: {
            name: "MYONE Electronics Statement",
            openingBalance: 319575.00,
            transactions: [
                { date: "2026-07-01", particulars: "Opening Balance Brought Forward", debit: 0, credit: 0 },
                { date: "2026-07-12", particulars: "Invoice Bill #M-8890", debit: 904747.00, credit: 0 },
                { date: "2026-07-28", particulars: "Remittance / Payment Received", debit: 0, credit: 555005.00 }
            ]
        }
    }
};

let currentCompany = 'parks';
let appState = JSON.parse(localStorage.getItem('sovereignCorporateLedger')) || defaultCorporateData;

// কোম্পানি ট্যাব পরিবর্তনের ফাংশন
function switchCompany(compKey) {
    currentCompany = compKey;
    
    // ট্যাবের স্টাইল আপডেট
    ['parks', 'ele', 'myone'].forEach(key => {
        const btn = document.getElementById(`tab-${key}`);
        if(key === compKey) {
            btn.className = "px-4 py-2 text-xs font-bold rounded-lg transition bg-blue-600 text-white shadow";
        } else {
            btn.className = "px-4 py-2 text-xs font-bold rounded-lg transition bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800";
        }
    });

    renderPortal();
}

// নতুন এন্ট্রি যোগ করার ফাংশন (যাতে টেবিল এবং সামারি উভয় দিক একসাথে আপডেট হয়)
function addNewLedgerEntry() {
    const date = document.getElementById('inpDate').value || new Date().toISOString().split('T')[0];
    const particulars = document.getElementById('inpParticulars').value.trim();
    const type = document.getElementById('inpType').value;
    const amount = parseFloat(document.getElementById('inpAmount').value);

    if (!particulars || isNaN(amount) || amount <= 0) {
        alert("দয়া করে সঠিক বিবরণ এবং টাকার পরিমাণ লিখুন!");
        return;
    }

    let debit = type === 'debit' ? amount : 0;
    let credit = type === 'credit' ? amount : 0;

    // নির্দিষ্ট কোম্পানির ট্রানজ্যাকশন লিস্টে পুশ করা
    appState.companies[currentCompany].transactions.push({
        date: date,
        particulars: particulars,
        debit: debit,
        credit: credit
    });

    // লোকালস্টোরেজে সেভ এবং দুদিক সিংক করা
    saveAndSync();

    // ইনপুট ফিল্ড খালি করা
    document.getElementById('inpParticulars').value = '';
    document.getElementById('inpAmount').value = '';
    alert("এন্ট্রি সফলভাবে পোস্ট হয়েছে এবং উভয় দিকে সিংক সম্পন্ন হয়েছে!");
}

// বেসলাইনে রিসেট করার ফাংশন
function resetLedgerToDefault() {
    if (confirm("আপনি কি সমস্ত ডাটা রিসেট করে অফিশিয়াল বেসলাইনে ফিরে যেতে চান?")) {
        appState = JSON.parse(JSON.stringify(defaultCorporateData));
        saveAndSync();
        alert("সিস্টেম সফলভাবে রিসেট হয়েছে।");
    }
}

// লোকালস্টোরেজ সেভ ও রেন্ডার ট্রিগার
function saveAndSync() {
    localStorage.setItem('sovereignCorporateLedger', JSON.stringify(appState));
    renderPortal();
}

// মাস্টার রেন্ডার ইঞ্জিন (টেবিল ও সামারি দুদিকেই রানিং ব্যালেন্স আপডেট করে)
function renderPortal() {
    let compData = appState.companies[currentCompany];
    document.getElementById('activeCompanyName').innerText = compData.name;

    let runningBalance = compData.openingBalance;
    let totalDebit = 0;
    let totalCredit = 0;

    let tableHTML = `
        <tr class="bg-slate-950/60 font-semibold">
            <td class="p-3">-</td>
            <td class="p-3 text-white">Opening Balance Brought Forward</td>
            <td class="p-3 text-right">-</td>
            <td class="p-3 text-right">-</td>
            <td class="p-3 text-right text-amber-400">৳ ${runningBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
        </tr>
    `;

    compData.transactions.forEach(tx => {
        totalDebit += tx.debit;
        totalCredit += tx.credit;
        // ফর্মুলা: রানিং ব্যালেন্স = আগের ব্যালেন্স + ডেবিট - ক্রেডিট
        runningBalance = (runningBalance + tx.debit) - tx.credit;

        tableHTML += `
            <tr class="hover:bg-slate-950/40 transition">
                <td class="p-3 text-slate-400">${tx.date}</td>
                <td class="p-3 text-white font-medium">${tx.particulars}</td>
                <td class="p-3 text-right text-blue-400">${tx.debit > 0 ? '৳ ' + tx.debit.toLocaleString('en-IN', {minimumFractionDigits: 2}) : '-'}</td>
                <td class="p-3 text-right text-emerald-400">${tx.credit > 0 ? '৳ ' + tx.credit.toLocaleString('en-IN', {minimumFractionDigits: 2}) : '-'}</td>
                <td class="p-3 text-right font-semibold text-amber-300">৳ ${runningBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
            </tr>
        `;
    });

    document.getElementById('ledgerTableBody').innerHTML = tableHTML;

    // মাস্টার কম্বাইন্ড সামারি হিসাব (সব কোম্পানির ওপর ভিত্তি করে)
    let masterOpeningSum = 0;
    let masterDebitSum = 0;
    let masterCreditSum = 0;

    for (let key in appState.companies) {
        let c = appState.companies[key];
        masterOpeningSum += c.openingBalance;
        c.transactions.forEach(t => {
            masterDebitSum += t.debit;
            masterCreditSum += t.credit;
        });
    }

    let masterFinalBalance = (masterOpeningSum + masterDebitSum) - masterCreditSum;

    document.getElementById('masterOpening').innerText = '৳ ' + masterOpeningSum.toLocaleString('en-IN', {minimumFractionDigits: 2});
    document.getElementById('masterDebit').innerText = '৳ ' + masterDebitSum.toLocaleString('en-IN', {minimumFractionDigits: 2});
    document.getElementById('masterCredit').innerText = '৳ ' + masterCreditSum.toLocaleString('en-IN', {minimumFractionDigits: 2});
    document.getElementById('masterBalance').innerText = '৳ ' + masterFinalBalance.toLocaleString('en-IN', {minimumFractionDigits: 2});
}

// পেজ লোড হওয়ার সাথে সাথে রান হবে
window.onload = function() {
    renderPortal();
};
