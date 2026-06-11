
import { useState, useRef, useEffect } from "react";
import { useHostel } from '@/context/useHostel';

import { toast } from 'sonner';
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const YEARS = ["2023","2024","2025","2026","2027"];

const today = () => new Date().toISOString().split("T")[0];

const initialForm = {
  boardingNo: "", boarderName: "", fatherName: "", contact: "",  walletProvider: "",
  totalAmount: "", receivedAmount: "", paymentMethod: "", transactionNo: "",
  feeMonth: "", feeYear: "", receivingDate: today(), dueDate: "",
  remarks: "",
};

const lastPayments = [
  { month: "April 2026", amount: "15,000", received: "15,000", date: "2026-04-05", method: "Cash", status: "Paid" },
  { month: "March 2026", amount: "15,000", received: "12,000", date: "2026-03-07", method: "Bank Transfer", status: "Partial" },
  { month: "February 2026", amount: "15,000", received: "15,000", date: "2026-02-03", method: "Cash", status: "Paid" },
];

const statusStyle = (s) => ({
  Paid:    { bg: "#e6f4ea", color: "#1a6e35", border: "#b2dfbc" },
  Partial: { bg: "#fff8e1", color: "#7a5c00", border: "#ffe082" },
  Unpaid:  { bg: "#fdecea", color: "#8b1a1a", border: "#f5c6c6" },
}[s] || {});

export default function BoardingFeeForm() {
  const { students,createChallan,challans } = useHostel();
  // ── search state ──
  // console.log("Boarding Form",challans)
  const [query, setQuery]             = useState("");
  const [suggestions, setSuggestions] = useState([]);  // matched students
  const [showDrop, setShowDrop]       = useState(false);

  const [form, setForm]   = useState(initialForm);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});

  const dropRef = useRef(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── search function — filters students from context ──
  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);

    // clear auto-filled fields when user edits the search input
    setForm((f) => ({ ...f, boardingNo: val, boarderName: "", contact: "",fatherName: "" }));

    if (!val.trim() || val.trim().length < 1) {
      setSuggestions([]);
      setShowDrop(false);
      return;
    }

    const q = val.trim().toLowerCase();

    const matches = students.filter((s) => {
      const bn   = s.boardingNumber?.toLowerCase() || "";
      const name = s.user?.name?.toLowerCase()     || "";
      return bn.includes(q) || name.includes(q);
    });

    setSuggestions(matches);
    setShowDrop(true);
  };

  // ── when admin clicks a suggestion — auto-fill the form ──
  const handleSelect = (student) => {
    setQuery(student.boardingNumber);
    setForm((f) => ({
      ...f,
      boardingNo:  student.boardingNumber,
      boarderName: student.user?.name       || "",
      fatherName:        student.fatherName         || "",
      contact:     student.contact          || "",
    }));
    setSuggestions([]);
    setShowDrop(false);
  };

  const balance = () => {
    const t = parseFloat(form.totalAmount) || 0;
    const r = parseFloat(form.receivedAmount) || 0;
    return Math.max(0, t - r).toFixed(2);
  };

  const validate = () => {
    const e = {};
    if (!form.boardingNo.trim()) e.boardingNo = true;
    if (!form.feeMonth)          e.feeMonth = true;
    if (!form.feeYear)           e.feeYear = true;
    if (!form.receivingDate)     e.receivingDate = true;
    if (!form.totalAmount)       e.totalAmount = true;
    if (!form.receivedAmount)    e.receivedAmount = true;
      // Conditional payment validation
  if (form.paymentMethod === "bank_transfer" || form.paymentMethod === "cheque") {
    if (!form.transactionNo?.trim()) e.transactionNo = true;
  }

  if (form.paymentMethod === "mobile_wallet") {
    if (!form.walletProvider)        e.walletProvider = true;
    if (!form.transactionNo?.trim()) e.transactionNo = true;
  }
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setErrors({});
    const result=await createChallan(form);
    if(result.success){
      console.log("Challan created successfully",challans);
      setForm(initialForm);
      setQuery("");
    setSaved(true);
  toast.success('Challan created successfully!')
    setTimeout(() => setSaved(false), 3000);
  };
  };

  const handleCancel = () => {
    if (window.confirm("Discard all changes?")) {
      setForm(initialForm);
      setQuery("");
      setSuggestions([]);
      setErrors({});
    }
  };

  const inp = (err) => ({
    style: {
      width: "100%", padding: "9px 12px", fontSize: 14,
      fontFamily: "inherit", border: `1px solid ${err ? "#e24b4a" : "#ddd"}`,
      borderRadius: 8, background: "#fafafa", color: "#111",
      outline: "none", boxSizing: "border-box",
    }
  });

  const prefixInp = (err) => ({ ...inp(err), style: { ...inp(err).style, paddingLeft: 26 } });

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f2f1ed", minHeight: "100vh", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#1a3a5c", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: "#1a1916", margin: 0 }}>Boarding fee entry</h1>
            <p style={{ fontSize: 13, color: "#6b6a65", margin: 0 }}>Record monthly boarding fee payment</p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3a9e5f" }} />
            <span style={{ fontSize: 13, color: "#6b6a65" }}>Active</span>
          </div>
        </div>

        {/* Main Card */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e4e2da", overflow: "hidden" }}>

          {/* ── Boarder Info ── */}
          <SectionHeader icon="user" label="Boarder information" />
          <div style={{ padding: "1.25rem 1.5rem" }}>
            <Grid cols={2}>

              {/* Boarding number — search input with dropdown */}
              <Field label="Boarding number" required error={errors.boardingNo}>
                <div ref={dropRef} style={{ position: "relative" }}>

                  {/* input + search icon */}
                  <div style={{ position: "relative" }}>
                    <input
                      {...inp(errors.boardingNo)}
                      value={query}
                      onChange={handleSearch}
                      onFocus={() => suggestions.length > 0 && setShowDrop(true)}
                      placeholder="Search boarding no. or name…"
                      autoComplete="off"
                    />
                    <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#bbb", pointerEvents: "none" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                    </span>
                  </div>

                  {/* Dropdown — matches */}
                  {showDrop && suggestions.length > 0 && (
                    <ul style={{
                      position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                      background: "#fff", border: "1px solid #ddd", borderRadius: 8,
                      zIndex: 100, margin: 0, padding: 0, listStyle: "none",
                      maxHeight: 200, overflowY: "auto",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    }}>
                      {suggestions.map((s) => (
                        <li
                          key={s._id}
                          onMouseDown={() => handleSelect(s)}
                          style={{ padding: "9px 12px", cursor: "pointer", fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f0efe9" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#f6f5f1"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <span style={{ fontWeight: 500, color: "#1a1916" }}>{s.boardingNumber}</span>
                          <span style={{ color: "#9e9d98", fontSize: 12 }}>{s.user?.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Dropdown — no results */}
                  {showDrop && query.trim().length >= 1 && suggestions.length === 0 && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                      background: "#fff", border: "1px solid #ddd", borderRadius: 8,
                      zIndex: 100, padding: "10px 12px", fontSize: 13, color: "#9e9d98",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    }}>
                      No student found
                    </div>
                  )}
                </div>
              </Field>

              {/* Auto-filled read-only fields */}
              <Field label="Boarder name">
                <input
                  {...inp()}
                  value={form.boarderName}
                  readOnly
                  placeholder="Auto-filled on selection"
                  style={{ ...inp().style, background: form.boarderName ? "#f0f7ff" : "#fafafa", color: form.boarderName ? "#1a3a5c" : "#aaa" }}
                />
              </Field>
              <Field label="Father Name">
                <input
                  {...inp()}
                  value={form.fatherName}
                  readOnly
                  placeholder="Auto-filled on selection"
                  style={{ ...inp().style, background: form.fatherName ? "#f0f7ff" : "#fafafa", color: form.fatherName ? "#1a3a5c" : "#aaa" }}
                />
              </Field>
              <Field label="Contact number">
                <input
                  {...inp()}
                  value={form.contact}
                  readOnly
                  placeholder="Auto-filled on selection"
                  style={{ ...inp().style, background: form.contact ? "#f0f7ff" : "#fafafa", color: form.contact ? "#1a3a5c" : "#aaa" }}
                  type="tel"
                />
              </Field>
            </Grid>
          </div>

          <Divider />

          {/* ── Payment Details ──
          <SectionHeader icon="credit-card" label="Payment details" />
          <div style={{ padding: "1.25rem 1.5rem" }}>
            <Grid cols={3}>
              <Field label="Total amount" required error={errors.totalAmount}>
                <Prefix symbol="₨">
                  <input {...prefixInp(errors.totalAmount)} value={form.totalAmount} onChange={set("totalAmount")} placeholder="0.00" type="number" min="0" />
                </Prefix>
              </Field>
              <Field label="Received amount" required error={errors.receivedAmount}>
                <Prefix symbol="₨">
                  <input {...prefixInp(errors.receivedAmount)} value={form.receivedAmount} onChange={set("receivedAmount")} placeholder="0.00" type="number" min="0" />
                </Prefix>
              </Field>
              <Field label="Balance / due">
                <Prefix symbol="₨">
                  <input {...prefixInp()} value={balance()} readOnly style={{ ...prefixInp().style, background: "#f5f5f2", color: "#888" }} />
                </Prefix>
              </Field>
            </Grid>
            <Grid cols={2} style={{ marginTop: 14 }}>
              <Field label="Payment method">
                <select {...inp()} value={form.paymentMethod} onChange={set("paymentMethod")}>
                  <option value="">Select method</option>
                  <option>Cash</option>
                  <option>Bank transfer</option>
                  <option>Cheque</option>
                  <option>Mobile wallet</option>
                </select>
              </Field>
              <Field label="Transaction / receipt no.">
                <input {...inp()} value={form.transactionNo} onChange={set("transactionNo")} placeholder="e.g. TXN-789456" />
              </Field>
            </Grid>
          </div> */}
{/* ── Payment Details ── */}
<SectionHeader icon="credit-card" label="Payment details" />
<div style={{ padding: "1.25rem 1.5rem" }}>
  <Grid cols={3}>
    <Field label="Total amount" required error={errors.totalAmount}>
      <Prefix symbol="₨">
        <input {...prefixInp(errors.totalAmount)} value={form.totalAmount} onChange={set("totalAmount")} placeholder="0.00" type="number" min="0" />
      </Prefix>
    </Field>
    <Field label="Received amount" required error={errors.receivedAmount}>
      <Prefix symbol="₨">
        <input {...prefixInp(errors.receivedAmount)} value={form.receivedAmount} onChange={set("receivedAmount")} placeholder="0.00" type="number" min="0" />
      </Prefix>
    </Field>
    <Field label="Balance / due">
      <Prefix symbol="₨">
        <input {...prefixInp()} value={balance()} readOnly style={{ ...prefixInp().style, background: "#f5f5f2", color: "#888" }} />
      </Prefix>
    </Field>
  </Grid>

  {/* Payment method row */}
  <Grid cols={form.paymentMethod === "cash" || !form.paymentMethod ? 1 : 2} style={{ marginTop: 14 }}>
    <Field label="Payment method">
      <select {...inp()} value={form.paymentMethod} onChange={set("paymentMethod")}>
        <option value="">Select method</option>
        <option value="cash">Cash</option>
        <option value="bank_transfer">Bank transfer</option>
        <option value="cheque">Cheque</option>
        <option value="mobile_wallet">Mobile wallet</option>
      </select>
    </Field>

    {/* Transaction field: Bank transfer or Cheque only */}
    {(form.paymentMethod === "bank_transfer" || form.paymentMethod === "cheque") && (
      <Field label="Transaction / receipt no." required error={errors.transactionNo}>
        <input
          {...inp(errors.transactionNo)}
          value={form.transactionNo}
          onChange={set("transactionNo")}
          placeholder="e.g. TXN-789456"
        />
      </Field>
    )}
  </Grid>

  {/* Mobile wallet row */}
  {form.paymentMethod === "mobile_wallet" && (
    <Grid cols={2} style={{ marginTop: 14 }}>
      <Field label="Mobile wallet provider" required error={errors.walletProvider}>
        <select
          {...inp(errors.walletProvider)}
          value={form.walletProvider}
          onChange={set("walletProvider")}
        >
          <option value="">Select provider</option>
          <option value="easypaisa">Easypaisa</option>
          <option value="jazzcash">JazzCash</option>
          <option value="nayapay">NayaPay</option>
          <option value="sadapay">SadaPay</option>
          <option value="upaisa">Upaisa</option>
          <option value="other">Other</option>
        </select>
      </Field>
      <Field label="Transaction / receipt no." required error={errors.transactionNo}>
        <input
          {...inp(errors.transactionNo)}
          value={form.transactionNo}
          onChange={set("transactionNo")}
          placeholder="e.g. TXN-789456"
        />
      </Field>
    </Grid>
  )}
</div>
          <Divider />

          {/* ── Fee Period & Dates ── */}
          <SectionHeader icon="calendar" label="Fee period & dates" />
          <div style={{ padding: "1.25rem 1.5rem" }}>
            <Grid cols={2}>
              <Field label="Fee month" required error={errors.feeMonth || errors.feeYear}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <select {...inp(errors.feeMonth)} value={form.feeMonth} onChange={set("feeMonth")}>
                    <option value="">Month</option>
                    {MONTHS.map(m => <option key={m}>{m}</option>)}
                  </select>
                  <select {...inp(errors.feeYear)} value={form.feeYear} onChange={set("feeYear")}>
                    <option value="">Year</option>
                    {YEARS.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </Field>
              <Field label="Receiving date" required error={errors.receivingDate}>
                <input {...inp(errors.receivingDate)} type="date" value={form.receivingDate} onChange={set("receivingDate")} />
              </Field>
              <Field label="Due date">
                <input {...inp()} type="date" value={form.dueDate} onChange={set("dueDate")} />
              </Field>
            </Grid>
          </div>

          <Divider />

          {/* ── Remarks ── */}
          <SectionHeader icon="notes" label="Remarks" />
          <div style={{ padding: "1.25rem 1.5rem" }}>
            <Field label="Remarks / notes">
              <textarea
                value={form.remarks} onChange={set("remarks")}
                placeholder="Any additional notes about this payment…"
                rows={3}
                style={{ ...inp().style, resize: "vertical", lineHeight: 1.6, minHeight: 80 }}
              />
            </Field>
          </div>

          <Divider />

          {/* ── Last Payment History ── */}
          <SectionHeader icon="history" label="Last payment history" />
          <div style={{ padding: "1.25rem 1.5rem" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f6f5f1" }}>
                    {["Fee month","Total (₨)","Received (₨)","Date","Method","Status"].map(h => (
                      <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontWeight: 500, color: "#6b6a65", borderBottom: "1px solid #e4e2da", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lastPayments.map((p, i) => {
                    const s = statusStyle(p.status);
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #f0efe9" }}>
                        <td style={td()}><strong style={{ fontWeight: 500 }}>{p.month}</strong></td>
                        <td style={td()}>₨ {p.amount}</td>
                        <td style={td()}>₨ {p.received}</td>
                        <td style={td()}>{p.date}</td>
                        <td style={td()}>{p.method}</td>
                        <td style={td()}>
                          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 16 }}>
              {[
                { label: "Total paid (3 months)", value: "₨ 42,000", color: "#1a3a5c" },
                { label: "Outstanding balance",   value: "₨ 3,000",  color: "#8b4a00" },
                { label: "Last payment date",     value: "Apr 5, 2026", color: "#1a4a2e" },
              ].map(c => (
                <div key={c.label} style={{ background: "#f6f5f1", borderRadius: 10, padding: "12px 14px", border: "1px solid #e4e2da" }}>
                  <p style={{ fontSize: 11, color: "#9e9d98", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{c.label}</p>
                  <p style={{ fontSize: 16, fontWeight: 600, color: c.color, margin: 0 }}>{c.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Actions ── */}
          <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid #e4e2da", display: "flex", justifyContent: "flex-end", gap: 10, background: "#fafaf8" }}>
            {saved && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: "auto", color: "#1a6e35", fontSize: 13, fontWeight: 500 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Record saved successfully!
              </div>
            )}
            <button onClick={handleCancel} style={btnStyle("cancel")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Cancel
            </button>
            <button onClick={handleSave} style={btnStyle("save")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Save record
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#b0afa8", marginTop: 16 }}>
          Fields marked with <span style={{ color: "#e24b4a" }}>*</span> are required
        </p>
      </div>
    </div>
  );
}

/* ── Helpers ── */

function SectionHeader({ icon, label }) {
  const icons = {
    user: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>,
    "credit-card": <><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    notes: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>,
    history: <><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></>,
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 1.5rem", background: "#f6f5f1", borderBottom: "1px solid #e4e2da" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {icons[icon]}
        {icon === "user" && <circle cx="12" cy="7" r="4"/>}
      </svg>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#3a3935", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
    </div>
  );
}

function Grid({ cols, children, style }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "14px 16px", ...style }}>
      {children}
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: error ? "#e24b4a" : "#6b6a65", letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}{required && <span style={{ color: "#e24b4a", marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Prefix({ symbol, children }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#9e9d98", pointerEvents: "none", zIndex: 1 }}>{symbol}</span>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#e4e2da" }} />;
}

function td() {
  return { padding: "10px 14px", color: "#3a3935", verticalAlign: "middle" };
}

function btnStyle(type) {
  const base = { display: "flex", alignItems: "center", gap: 7, padding: "9px 20px", fontSize: 14, fontWeight: 500, borderRadius: 8, cursor: "pointer", border: "1px solid", fontFamily: "inherit", transition: "opacity 0.15s" };
  if (type === "save") return { ...base, background: "#1a3a5c", color: "#fff", borderColor: "#1a3a5c" };
  return { ...base, background: "#fff", color: "#3a3935", borderColor: "#ddd" };
}