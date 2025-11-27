import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CustomerDashboard({ user, onLogout }) {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/accounts/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data.transactions);
      setBalance(response.data.balance);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTransaction = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/accounts/${type}`,
        { amount: parseFloat(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage(response.data.message);
      setAmount('');
      fetchTransactions();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Transaction failed');
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user.username}</h1>
        <button onClick={onLogout} className="btn btn-danger">Logout</button>
      </div>

      <div className="balance-card">
        <h3>Current Balance</h3>
        <p className="amount">${balance.toFixed(2)}</p>
      </div>

      <div className="transaction-form">
        <h3>Make a Transaction</h3>
        {message && <div className={message.includes('successful') ? 'success' : 'error'}>{message}</div>}
        
        <div className="form-row">
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="0.01"
            />
          </div>
        </div>
        
        <div className="form-row">
          <button onClick={() => handleTransaction('deposit')} className="btn btn-primary">
            Deposit
          </button>
          <button onClick={() => handleTransaction('withdraw')} className="btn btn-danger">
            Withdraw
          </button>
        </div>
      </div>

      <div className="transactions-list">
        <h3>Transaction History</h3>
        {transactions.length === 0 ? (
          <p>No transactions yet</p>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="transaction-item">
              <div>
                <span className={`transaction-type ${transaction.type}`}>
                  {transaction.type}
                </span>
                <br />
                <small>{new Date(transaction.date).toLocaleString()}</small>
              </div>
              <div className="transaction-amount">
                {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CustomerDashboard;
