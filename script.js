// এস.আর. ইলেকট্রনিক্স পার্ক - অফিশিয়াল কম্বাইন্ড সামারি ডেটাবেজ (ভার্সন ২ - ফ্রেশ রিসেট)
let sovereignLedger = {
    dealerCode: "DEAL002905",
    dealerName: "S.R ELECTRONICS PARK, CHUADANGA",
    summary: {
        opening: 1415777.70,
        debit: 4216038.30,
        credit: 3110828.00
    },
    logs: []
};

// নতুন স্টোরেজ কি, যাতে পুরোনো কোনো ক্যাশ বা ডেটা আটকে না থাকে
const STORAGE_KEY = 'sovereignCombinedLedger_v2';

if (localStorage.getItem(STORAGE_KEY)) {
    sovereignLedger = JSON.parse(localStorage.getItem(STORAGE_KEY));
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

    // কম্বাইন্ড সামারিতে ডেবিট বা ক্রেডিট আপডেট করা
    if (type === 'Credit') {
        sovereignLedger.summary.credit += amount;
    } else {
        sovereignLedger.summary.debit += amount;
    }

    // লগ যুক্ত করা
    sovereignLedger.logs.unshift({
        date: new Date().toLocaleDateString('en-GB'),
        company: compKey.toUpperCase(),
        type: type,
        amount: amount.toLocaleString('en-IN', {minimumFractionDigits: 2})
    });

    // ডাটা সেভ ও ইউআই আপডেট
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sovereignLedger));
    updateDashboardUI();
    
    document.getElementById('inpAmount').value = '';
    alert("সফলভাবে পেমেন্ট কনফার্ম করা হয়েছে এবং লেজার আপডেট হয়েছে!");
}

// ড্যাশবোর্ড সামারি হিসাব ও ইউআই রেন্ডার
function updateDashboardUI() {
    let totalOpening = sovereignLedger.summary.opening;
    let totalDebit = sovereignLedger.summary.debit;
    let totalCredit = sovereignLedger.summary.credit;

    // সূত্র: Opening + Debit - Credit = Balance
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
