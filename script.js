// অফিশিয়াল লেজার ডাটাবেজ (আপনার দেওয়া পিডিএফ ও কম্বাইন্ড সামারি রিপোর্ট অনুযায়ী)
let sovereignLedger = {
    dealerCode: "DEAL002905",
    dealerName: "S.R ELECTRONICS PARK, CHUADANGA",
    companies: {
        parks: { opening: 323077.20, debit: 228469.40, credit: 551546.60 },
        ele:   { opening: 773125.50, debit: 3082821.90, credit: 2545773.00 },
        myone: { opening: 319575.00, debit: 904747.00, credit: 555005.00 }
    },
    logs: []
};

// লোকালস্টোরেজ থেকে ডাটা লোড করা (যদি থাকে)
if (localStorage.getItem('sovereignLedgerData')) {
    sovereignLedger = JSON.parse(localStorage.getItem('sovereignLedgerData'));
}

// পেমেন্ট কনফার্ম ও লেজার ওভাররাইড করার মূল ফাংশন
function handleManualPayment() {
    const compKey = document.getElementById('selCompany').value;
    const type = document.getElementById('selType').value;
    const amount = parseFloat(document.getElementById('inpAmount').value);

    if (!amount || amount <= 0) {
        alert("দয়া করে সঠিক টাকার পরিমাণ লিখুন!");
        return;
    }

    // হিসাব আপডেট করা
    if (type === 'Credit') {
        sovereignLedger.companies[compKey].credit += amount;
    } else {
        sovereignLedger.companies[compKey].debit += amount;
    }

    // লগ যুক্ত করা
    sovereignLedger.logs.unshift({
        date: new Date().toLocaleDateString('en-GB'),
        company: compKey.toUpperCase(),
        type: type,
        amount: amount.toLocaleString('en-IN', {minimumFractionDigits: 2})
    });

    // ডাটা সেভ ও ইউআই আপডেট
    localStorage.setItem('sovereignLedgerData', JSON.stringify(sovereignLedger));
    updateDashboardUI();
    
    document.getElementById('inpAmount').value = '';
    alert("সফলভাবে পেমেন্ট কনফার্ম করা হয়েছে এবং লেজার আপডেট হয়েছে!");
}

// ড্যাশবোর্ড সামারি হিসাব ও ইউআই রেন্ডার
function updateDashboardUI() {
    let totalOpening = 0;
    let totalDebit = 0;
    let totalCredit = 0;

    for (let key in sovereignLedger.companies) {
        let comp = sovereignLedger.companies[key];
        totalOpening += comp.opening;
        totalDebit += comp.debit;
        totalCredit += comp.credit;
    }

    // ফর্মুলা: Opening + Debit - Credit = Balance
    let totalBalance = (totalOpening + totalDebit) - totalCredit;

    // UI এ মান বসানো
    document.getElementById('sumOpening').innerText = '৳ ' + totalOpening.toLocaleString('en-IN', {minimumFractionDigits: 2});
    document.getElementById('sumDebit').innerText = '৳ ' + totalDebit.toLocaleString('en-IN', {minimumFractionDigits: 2});
    document.getElementById('sumCredit').innerText = '৳ ' + totalCredit.toLocaleString('en-IN', {minimumFractionDigits: 2});
    document.getElementById('sumBalance').innerText = '৳ ' + totalBalance.toLocaleString('en-IN', {minimumFractionDigits: 2});

    // টেবিল রেন্ডার
    const tbody = document.getElementById('logTableBody');
    if (sovereignLedger.logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-slate-500">No manual overrides recorded yet. System running on baseline official ledger.</td></tr>`;
    } else {
        tbody.innerHTML = '';
        sovereignLedger.logs.forEach(log => {
            tbody.innerHTML += `
                <tr>
                    <td class="p-3">${log.date}</td>
                    <td class="p-3 font-semibold text-white">${log.company}</td>
                    <td class="p-3">${log.type}</td>
                    <td class="p-3 font-semibold ${log.type === 'Credit' ? 'text-emerald-400' : 'text-blue-400'}">${log.amount}</td>
                    <td class="p-3"><span class="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px]">OVERRIDDEN</span></td>
                </tr>
            `;
        });
    }
}

// পেজ লোড হলে রান হবে
window.onload = function() {
    updateDashboardUI();
};
