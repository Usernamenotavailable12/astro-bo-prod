import React, { useState, useEffect } from 'react';
import * as apollo from '@apollo/client';
const { ApolloClient, ApolloProvider, useMutation, useQuery } = apollo;
import { InMemoryCache } from '@apollo/client/cache';
import { gql } from '@apollo/client/core';
import { createHttpLink } from '@apollo/client/link/http';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// --- Error Link ---
// This link handles GraphQL errors and logs the user out if "unauthenticated" is returned.
const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach((err) => {
      if (
        err.extensions?.code === 'UNAUTHENTICATED' ||
        err.message.toLowerCase().includes('unauthenticated')
      ) {
        // Clear the token and reload the app to show the login prompt
        sessionStorage.removeItem('refreshToken');
        window.location.reload();
      }
    });
  }
});

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
            nickname
            lastName
            firstName
            userId
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

// Combine the errorLink, authLink, and httpLink.
const client = new ApolloClient({
  link: errorLink.concat(authLink).concat(httpLink),
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
        <button className="ballance-button" type="submit" disabled={loading}>
          Login
        </button>
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
            username: node.user.nickname,
            lastName: node.user.lastName,
            constUserId: node.user.userId,
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
    }, 2400000);
    return () => clearInterval(interval);
  }, [segmentData, refetchSegment]);

  if (segmentLoading) return <p>Loading segment data...</p>;
  if (segmentError) return <p>Error loading segment data.</p>;

  return (
    <div>
      <h2>Dashboard</h2>
      <button
        className="ballance-button"
        onClick={() => {
          refetchSegment();
          if (segmentData?.segment?.userIds) {
            fetchWalletData(segmentData.segment.userIds);
          }
        }}
      >
        Refresh
      </button>
      <section className="wallet-list-wrapper">
      <ul className="wallet-list-header">
      <li><span className='userids'>UserID</span> <span className='nickname'>Name</span> <span className='amounts'>Amount</span></li>
      </ul>
      <ul className="wallet-list">
        {walletData.map((user, index) => (
          <li key={index}>
            <span className='userids'>{user.constUserId}</span> <span className='nickname'>{user.firstName} {user.lastName}</span> <span className='amounts'>{user.currentBalance}₾</span>
          </li>
        ))}
      </ul>
      </section>
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
