import React, { useState, useEffect } from 'react';
import * as apollo from '@apollo/client';
const { ApolloClient, ApolloProvider, useMutation, useQuery } = apollo;
import { InMemoryCache } from '@apollo/client/cache';
import { gql } from '@apollo/client/core';
import { createHttpLink } from '@apollo/client/link/http';
import { setContext } from '@apollo/client/link/context';

// --- GraphQL Queries/Mutations ---
const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      refreshToken
    }
  }
`;

const SEGMENT_QUERY = gql`
  query Segment($segmentId: ID!) {
    segment(segmentId: $segmentId) {
      userIds
    }
  }
`;

const WALLET_CONNECTION_QUERY = gql`
  query WalletConnection($userId: ID, $first: Int) {
    walletConnection(userId: $userId, first: $first) {
      edges {
        node {
          currentBalance
          user {
            firstName
            lastName
          }
        }
      }
    }
  }
`;

// --- Apollo Client Setup ---
const httpLink = createHttpLink({
  uri: 'https://www.ambassadoribet.com/_internal/gql', // Replace with your GraphQL endpoint
});

const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('refreshToken') : null;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// --- Login Component ---
function Login() {
  const [brandId, setBrandId] = useState('ab');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [login, { loading, error }] = useMutation(LOGIN_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login({
        variables: {
          input: { brandId, username, password }
        },
      });
      if (result?.data?.login?.refreshToken) {
        sessionStorage.setItem('refreshToken', result.data.login.refreshToken);
        window.location.reload();
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Brand ID:</label>
          <input
            type="text"
            value={brandId}
            onChange={e => setBrandId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Username:</label>
          <input
            type="email"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button className='ballance-button' type="submit" disabled={loading}>Login</button>
      </form>
      {loading && <p>Logging in...</p>}
      {error && <p>Error logging in. Please try again.</p>}
    </div>
  );
}

// --- Dashboard Component ---
function Dashboard() {
  const segmentId = "HaORYpvPR6wxqZi0e5az";
  const { data: segmentData, loading: segmentLoading, error: segmentError, refetch: refetchSegment } = useQuery(SEGMENT_QUERY, { variables: { segmentId } });
  const [walletData, setWalletData] = useState([]);

  const fetchWalletData = async (userIds) => {
    if (!userIds || userIds.length === 0) return;
    const results = [];
    for (const userId of userIds) {
      try {
        const response = await client.query({
          query: WALLET_CONNECTION_QUERY,
          variables: { userId, first: 1 },
          fetchPolicy: 'no-cache',
        });
        if (response?.data?.walletConnection?.edges?.length > 0) {
          const node = response.data.walletConnection.edges[0].node;
          results.push({
            userId,
            firstName: node.user.firstName,
            lastName: node.user.lastName,
            currentBalance: node.currentBalance,
          });
        }
      } catch (err) {
        console.error(`Error fetching wallet data for user ${userId}:`, err);
      }
    }
    setWalletData(results);
  };

  useEffect(() => {
    if (segmentData?.segment?.userIds) {
      fetchWalletData(segmentData.segment.userIds);
    }
  }, [segmentData]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetchSegment();
      if (segmentData?.segment?.userIds) {
        fetchWalletData(segmentData.segment.userIds);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [segmentData, refetchSegment]);

  if (segmentLoading) return <p>Loading segment data...</p>;
  if (segmentError) return <p>Error loading segment data.</p>;

  return (
    <div>
      <h2>Dashboard</h2>
      <button className='ballance-button' onClick={() => {
        refetchSegment();
        if (segmentData?.segment?.userIds) {
          fetchWalletData(segmentData.segment.userIds);
        }
      }}>
        Refresh
      </button>
      <ul>
        {walletData.map((user, index) => (
          <li key={index}>
            {user.firstName} {user.lastName} - {user.currentBalance}₾
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Main App Component ---
function App() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    console.log('Client mounted');
  }, []);

  if (!isClient) return <p>Loading...</p>;

  const token = sessionStorage.getItem('refreshToken');
  console.log('Token found:', token);

  return (
    <ApolloProvider client={client}>
      <div className="balances">
        {token ? <Dashboard /> : <Login />}
      </div>
    </ApolloProvider>
  );
}

export default App;
