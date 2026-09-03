import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  BookOpen,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

const ExplainItPanel = ({ onClose }) => {
  const [terms, setTerms] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExplanations = async () => {
      try {
        setLoading(true);
        setError('');

        // IMPORTANT:
        // Vercel keeps VITE_API_URL without /api.
        // We add /api ONLY for this endpoint.
        const response = await axios.get(
          `${API_BASE}/api/explanations`
        );

        console.log('Explanation API response:', response.data);

        /*
          Expected backend response:

          {
            data: [
              {
                term: "...",
                definition: "...",
                whatItIndicates: "...",
                whyItMatters: "...",
                example: "...",
                caution: "..."
              }
            ]
          }
        */

        const explanationData = response.data?.data;

        if (Array.isArray(explanationData)) {
          setTerms(explanationData);
        } else {
          console.error(
            'Unexpected explanation API format:',
            response.data
          );
          setTerms([]);
          setError('Unable to load explanations.');
        }
      } catch (err) {
        console.error('Failed to load explanations:', err);

        setTerms([]);

        if (err.response) {
          console.error('Status:', err.response.status);
          console.error('Response:', err.response.data);
          setError(
            `Server error (${err.response.status}). Please try again.`
          );
        } else if (err.request) {
          setError(
            'Unable to connect to the explanation server.'
          );
        } else {
          setError('Something went wrong while loading terms.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExplanations();
  }, []);

  /*
    Search through:
    - term
    - definition
    - whatItIndicates
    - whyItMatters
    - example
    - caution
  */
  const searchText = search.trim().toLowerCase();

  const filteredTerms = terms.filter((item) => {
    if (!searchText) {
      return true;
    }

    return (
      item?.term?.toLowerCase().includes(searchText) ||
      item?.definition?.toLowerCase().includes(searchText) ||
      item?.whatItIndicates?.toLowerCase().includes(searchText) ||
      item?.whyItMatters?.toLowerCase().includes(searchText) ||
      item?.example?.toLowerCase().includes(searchText) ||
      item?.caution?.toLowerCase().includes(searchText)
    );
  });

  return (
    <AnimatePresence>
      <motion.div
        className="glass-panel"
        initial={{
          x: '100%',
          opacity: 0,
        }}
        animate={{
          x: 0,
          opacity: 1,
        }}
        exit={{
          x: '100%',
          opacity: 0,
        }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 200,
        }}
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          bottom: '1.5rem',
          width: '430px',
          maxWidth: 'calc(100vw - 2rem)',
          zIndex: 1000,

          display: 'flex',
          flexDirection: 'column',

          overflow: 'hidden',

          background: 'rgba(15, 15, 20, 0.98)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',

          boxShadow:
            '0 20px 60px rgba(0, 0, 0, 0.55)',
        }}
      >

        {/* ================= HEADER ================= */}

        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom:
              '1px solid var(--glass-border)',

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',

            flexShrink: 0,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '1.4rem',
                fontWeight: 700,
              }}
            >
              Explain It
            </h2>

            <p
              style={{
                margin: '0.3rem 0 0',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
              }}
            >
              Understand financial terms easily
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',

              padding: '0.4rem',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* ================= SEARCH ================= */}

        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom:
              '1px solid var(--glass-border)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'relative',
            }}
          >
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.9rem',
                top: '50%',
                transform:
                  'translateY(-50%)',
                color: 'var(--text-secondary)',
                pointerEvents: 'none',
              }}
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search financial terms..."
              className="input-field"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                paddingLeft: '2.5rem',
              }}
            />
          </div>
        </div>

        {/* ================= CONTENT ================= */}

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem 1.5rem',
          }}
        >

          {/* LOADING */}

          {loading && (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: 'var(--text-secondary)',
              }}
            >
              <BookOpen
                size={32}
                style={{
                  marginBottom: '0.75rem',
                  opacity: 0.6,
                }}
              />

              <p
                style={{
                  margin: 0,
                }}
              >
                Loading financial terms...
              </p>
            </div>
          )}

          {/* API ERROR */}

          {!loading && error && (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem 1rem',
              }}
            >
              <AlertCircle
                size={36}
                style={{
                  color: '#f59e0b',
                  marginBottom: '0.75rem',
                }}
              />

              <p
                style={{
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                {error}
              </p>

              <p
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                }}
              >
                Check the browser console for details.
              </p>
            </div>
          )}

          {/* TERMS */}

          {!loading &&
            !error &&
            filteredTerms.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                {filteredTerms.map((item, index) => (
                  <motion.div
                    key={
                      item._id ||
                      item.slug ||
                      item.term ||
                      index
                    }
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.2,
                      delay: index * 0.03,
                    }}
                    style={{
                      padding: '1.1rem',

                      background:
                        'rgba(255, 255, 255, 0.035)',

                      border:
                        '1px solid rgba(255, 255, 255, 0.08)',

                      borderRadius: '12px',
                    }}
                  >

                    {/* TERM TITLE */}

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        marginBottom: '0.8rem',
                      }}
                    >
                      <BookOpen
                        size={18}
                        style={{
                          color:
                            'var(--accent-pink)',
                          flexShrink: 0,
                        }}
                      />

                      <h3
                        style={{
                          margin: 0,
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          color:
                            'var(--accent-pink)',
                        }}
                      >
                        {item.term ||
                          'Financial Term'}
                      </h3>
                    </div>

                    {/* MEANING */}

                    <div
                      style={{
                        marginBottom: '0.9rem',
                      }}
                    >
                      <p
                        style={{
                          margin:
                            '0 0 0.3rem',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform:
                            'uppercase',
                          letterSpacing:
                            '0.05em',
                          color:
                            'var(--text-secondary)',
                        }}
                      >
                        Meaning
                      </p>

                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.88rem',
                          lineHeight: 1.6,
                        }}
                      >
                        {item.definition ||
                          'Definition not available.'}
                      </p>
                    </div>

                    {/* WHAT IT INDICATES */}

                    {item.whatItIndicates && (
                      <div
                        style={{
                          padding: '0.75rem',
                          marginBottom:
                            '0.9rem',

                          borderRadius: '8px',

                          background:
                            'rgba(0, 200, 150, 0.06)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems:
                              'center',
                            gap: '0.4rem',
                            marginBottom:
                              '0.35rem',
                          }}
                        >
                          <Lightbulb
                            size={15}
                            style={{
                              color:
                                'var(--accent-green)',
                            }}
                          />

                          <strong
                            style={{
                              fontSize:
                                '0.78rem',
                            }}
                          >
                            What it indicates
                          </strong>
                        </div>

                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.8rem',
                            lineHeight: 1.5,
                            color:
                              'var(--text-secondary)',
                          }}
                        >
                          {item.whatItIndicates}
                        </p>
                      </div>
                    )}

                    {/* WHY IT MATTERS */}

                    {item.whyItMatters && (
                      <div
                        style={{
                          marginBottom:
                            '0.9rem',
                        }}
                      >
                        <p
                          style={{
                            margin:
                              '0 0 0.3rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color:
                              'var(--text-secondary)',
                          }}
                        >
                          Why it matters
                        </p>

                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.8rem',
                            lineHeight: 1.5,
                            color:
                              'var(--text-secondary)',
                          }}
                        >
                          {item.whyItMatters}
                        </p>
                      </div>
                    )}

                    {/* EXAMPLE */}

                    {item.example && (
                      <div
                        style={{
                          padding: '0.7rem',

                          borderRadius: '8px',

                          background:
                            'rgba(0, 255, 150, 0.05)',

                          borderLeft:
                            '3px solid var(--accent-green)',
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.78rem',
                            lineHeight: 1.5,
                            color:
                              'var(--text-secondary)',
                          }}
                        >
                          <strong>
                            Example:
                          </strong>{' '}
                          {item.example}
                        </p>
                      </div>
                    )}

                    {/* CAUTION */}

                    {item.caution && (
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',

                          marginTop:
                            '0.75rem',
                        }}
                      >
                        <AlertCircle
                          size={15}
                          style={{
                            color: '#f59e0b',
                            flexShrink: 0,
                            marginTop: '2px',
                          }}
                        />

                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.75rem',
                            lineHeight: 1.45,
                            color:
                              'var(--text-secondary)',
                          }}
                        >
                          <strong>
                            Caution:
                          </strong>{' '}
                          {item.caution}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

          {/* NO RESULTS */}

          {!loading &&
            !error &&
            filteredTerms.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem 1rem',
                }}
              >
                <BookOpen
                  size={40}
                  style={{
                    color:
                      'var(--text-secondary)',
                    opacity: 0.5,
                    marginBottom:
                      '0.75rem',
                  }}
                />

                <p
                  style={{
                    margin: 0,
                    fontWeight: 600,
                  }}
                >
                  {search
                    ? 'No matching terms found'
                    : 'No financial terms available'}
                </p>

                {search && (
                  <p
                    style={{
                      marginTop:
                        '0.5rem',
                      fontSize: '0.8rem',
                      color:
                        'var(--text-secondary)',
                    }}
                  >
                    Try searching for EPS,
                    P/E Ratio, ROE, Revenue,
                    Market Cap, or Dividend
                    Yield.
                  </p>
                )}
              </div>
            )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExplainItPanel;
