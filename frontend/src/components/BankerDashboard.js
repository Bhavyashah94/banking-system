import React, { useState, useEffect } from 'react';
import axios from 'axios';

function BankerDashboard({ onLogout }) {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/accounts/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data.customers);
    } catch (err) {
      console.error(err);
    }
  };

  const viewCustomerTransactions = async (customerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/accounts/customers/${customerId}/transactions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedCustomer(customerId);
      setTransactions(response.data.transactions);
      setBalance(response.data.balance);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Banker Dashboard</h1>
        <button onClick={onLogout} className="btn btn-danger">Logout</button>
      </div>

      <div className="customers-list">
        <h3>All Customers</h3>
        {customers.length === 0 ? (
          <p>No customers found</p>
        ) : (
          customers.map((customer) => (
            <div
              key={customer.id}
              className="customer-item"
              onClick={() => viewCustomerTransactions(customer.id)}
            >
              <div>
                <strong>{customer.username}</strong>
                <br />
                <small>{customer.email}</small>
              </div>
              <button className="btn btn-primary">View Transactions</button>
            </div>
          ))
        )}
      </div>

      {selectedCustomer && (
        <>
          <div className="balance-card">
            <h3>Customer Balance</h3>
            <p className="amount">${balance.toFixed(2)}</p>
          </div>

          <div className="transactions-list">
            <h3>Customer Transaction History</h3>
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
        </>
      )}
    </div>
  );
}

export default BankerDashboard;
