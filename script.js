// অফিশিয়াল লেজার ডেটাসেট (সঠিক সামারি ডেটা অনুযায়ী)
const defaultLedgerData = {
    dealerCode: "DEAL002905",
    dealerName: "S.R ELECTRONICS PARK, CHUADANGA",
    companies: {
        parks: { name: "PARKS (S.R. Park)", opening: 323077.20, debit: 228469.40, credit: 551546.60 },
        ele:   { name: "ELE (Minister Hi-Tech)", opening: 773125.50, debit: 3082821.90, credit: 2545773.00 },
        myone: { name: "MYONE Electronics", opening: 319575.00, debit: 904747.00, credit: 555005.00 }
    },
    logs: []
};

// লোকালস্টোরেজ থেকে ডাটা লোড বা ডিফল্ট ডাটা ইনিশিয়ালাইজেশন
let sovereignLedger = JSON.parse(localStorage.getItem('sovereignLedgerData')) || defaultLedgerData;

// ম্যানুয়াল পেমেন্ট কনফার্মেশন ও লেজার আপডেট করার লজিক
function handleManualPayment() {
    const compKey = document.getElementById('selCompany').value;
    const type = document.getElementById('selType').value;
    const amount = parseFloat(document.getElementById('inpAmount').value);

    if (!amount || amount <= 0) {
        alert("দয়া করে সঠিক টাকার পরিমাণ লিখুন!");
        return;
    }

    // নির্দিষ্ট কোম্পানির ডেবিট বা ক্রেডিট আপডেট করা
    if (type === 'Credit') {
        sovereignLedger.companies[compKey].credit += amount;
    } else {
        sovereignLedger.companies[compKey].debit += amount;
    }

    // ট্রানজ্যাকশন লগ যুক্ত করা
    sovereignLedger.logs.unshift({
        date: new Date().toLocaleDateString('en-GB'),
        company: sovereignLedger.companies[compKey].name,
        type: type,
        amount: amount.toLocaleString('en-IN', {minimumFractionDigits: 2})
    });

    // লোকালস্টোরেজে সেভ এবং ইউআই রিফ্রেশ
    saveAndRefresh();
    document.getElementById('inpAmount').value = '';
    alert("সফলভাবে পেমেন্ট কনফার্ম করা হয়েছে এবং লেজার আপডেট হয়েছে!");
}

// ডাটা রিসেট করার ফাংশন
function resetLedgerData() {
    if (confirm("আপনি কি নিশ্চিতভাবে সমস্ত কাস্টম ওভাররাইড রিসেট করে অফিশিয়াল বেসলাইনে ফিরে যেতে চান?")) {
        sovereignLedger = JSON.parse(JSON.stringify(defaultLedgerData));
        saveAndRefresh();
        alert("সিস্টেম সফলভাবে অফিশিয়াল বেসলাইন লেজারে ফিরে এসেছে।");
    }
}

// লোকালস্টোরেজে সেভ করার হেল্পার
function saveAndRefresh() {
    localStorage.setItem('sovereignLedgerData', JSON.stringify(sovereignLedger));
    updateDashboardUI();
}

// ড্যাশবোর্ড সামারি এবং কোম্পানি ব্রেকডাউন রেন্ডার করার মাস্টার ফাংশন
function updateDashboardUI() {
    let totalOpening = 0;
    let totalDebit = 0;
    let totalCredit = 0;

    let companyCardsHTML = '';

    for (let key in sovereignLedger.companies) {
        let comp = sovereignLedger.companies[key];
        totalOpening += comp.opening;
        totalDebit += comp.debit;
        totalCredit += comp.credit;

        let compBalance = (comp.opening + comp.debit) - comp.credit;

        companyCardsHTML += `
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 shadow">
                <h3 class="text-xs font-bold text-white border-b border-slate-800 pb-2">${comp.name}</h3>
                <div class="text-[11px] space-y-1 text-slate-300">
                    <p class="flex justify-between"><span>Opening:</span> <span class="font-semibold text-white">৳ ${comp.opening.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></p>
                    <p class="flex justify-between"><span>Debit:</span> <span class="font-semibold text-blue-400">৳ ${comp.debit.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></p>
                    <p class="flex justify-between"><span>Credit:</span> <span class="font-semibold text-emerald-400">৳ ${comp.credit.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></p>
                    <p class="flex justify-between border-t border-slate-800/80 pt-1 font-bold"><span>Balance:</span> <span class="text-amber-400">৳ ${compBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></p>
                </div>
            </div>
        `;
    }

    // মাস্টার ফর্মুলা: Opening + Debit - Credit = Balance
    let totalBalance = (totalOpening + totalDebit) - totalCredit;

    // টপ সামারি কার্ডে মান বসানো
    document.getElementById('sumOpening').innerText = '৳ ' + totalOpening.toLocaleString('en-IN', {minimumFractionDigits: 2});
    document.getElementById('sumDebit').innerText = '৳ ' + totalDebit.toLocaleString('en-IN', {minimumFractionDigits: 2});
    document.getElementById('sumCredit').innerText = '৳ ' + totalCredit.toLocaleString('en-IN', {minimumFractionDigits: 2});
    document.getElementById('sumBalance').innerText = '৳ ' + totalBalance.toLocaleString('en-IN', {minimumFractionDigits: 2});

    // কোম্পানি কার্ড রেন্ডার করা
    document.getElementById('companyCardsContainer').innerHTML = companyCardsHTML;

    // ট্রানজ্যাকশন টেবিল রেন্ডার করা
    const tbody = document.getElementById('logTableBody');
    if (sovereignLedger.logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-slate-500">No manual overrides recorded yet. System running on baseline official ledger.</td></tr>`;
    } else {
        tbody.innerHTML = '';
        sovereignLedger.logs.forEach(log => {
            tbody.innerHTML += `
                <tr class="hover:bg-slate-950/50 transition">
                    <td class="p-3">${log.date}</td>
                    <td class="p-3 font-semibold text-white">${log.company}</td>
                    <td class="p-3">${log.type}</td>
                    <td class="p-3 font-semibold ${log.type === 'Credit' ? 'text-emerald-400' : 'text-blue-400'}">${log.amount}</td>
                    <td class="p-3"><span class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px]">OVERRIDDEN</span></td>
                </tr>
            `;
        });
    }
}

// পেজ লোড হওয়ার সাথে সাথে রান হবে
window.onload = function() {
    updateDashboardUI();
};
