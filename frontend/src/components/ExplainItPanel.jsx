import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, BookOpen, Lightbulb, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

const ExplainItPanel = ({ onClose }) => {
  const [terms, setTerms] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExplanations = async () => {
      try {
        const res = await axios.get(`${API_BASE}/explanations`);

        console.log('Explanation API response:', res.data);

        if (Array.isArray(res.data?.data)) {
          setTerms(res.data.data);
        } else {
          setTerms([]);
        }
      } catch (error) {
        console.error('Failed to load explanations:', error);
        setTerms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExplanations();
  }, []);

  // Search through term, definition and other explanation fields
  const filteredTerms = terms.filter((t) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return true;
    }

    return (
      t.term?.toLowerCase().includes(searchText) ||
      t.definition?.toLowerCase().includes(searchText) ||
      t.whatItIndicates?.toLowerCase().includes(searchText) ||
      t.whyItMatters?.toLowerCase().includes(searchText) ||
      t.example?.toLowerCase().includes(searchText)
    );
  });

  return (
    <AnimatePresence>
      <motion.div
        className="glass-panel"
        style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          bottom: '2rem',
          width: '420px',
          maxWidth: 'calc(100vw - 2rem)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'rgba(15, 15, 20, 0.97)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 200,
        }}
      >

        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
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
                margin: '0.25rem 0 0',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
              }}
            >
              Understand financial terms easily
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.4rem',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Search */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--glass-border)',
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
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)',
              }}
            />

            <input
              type="text"
              className="input-field"
              placeholder="Search a term, e.g. P/E Ratio..."
              style={{
                width: '100%',
                paddingLeft: '2.5rem',
                boxSizing: 'border-box',
              }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {loading ? (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                color: 'var(--text-secondary)',
              }}
            >
              Loading financial terms...
            </div>
          ) : filteredTerms.length > 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {filteredTerms.map((t, idx) => (
                <motion.div
                  key={t.slug || t.term || idx}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: idx * 0.05,
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.035)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '1.1rem',
                  }}
                >

                  {/* Term */}
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
                        color: 'var(--accent-pink)',
                        flexShrink: 0,
                      }}
                    />

                    <h3
                      style={{
                        margin: 0,
                        color: 'var(--accent-pink)',
                        fontSize: '1rem',
                      }}
                    >
                      {t.term}
                    </h3>
                  </div>

                  {/* Meaning */}
                  <div
                    style={{
                      marginBottom: '0.9rem',
                    }}
                  >
                    <p
                      style={{
                        margin: '0 0 0.3rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Meaning
                    </p>

                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.88rem',
                        lineHeight: '1.55',
                      }}
                    >
                      {t.definition || 'Definition not available.'}
                    </p>
                  </div>

                  {/* What it indicates */}
                  {t.whatItIndicates && (
                    <div
                      style={{
                        marginBottom: '0.9rem',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: 'rgba(0, 200, 150, 0.06)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          marginBottom: '0.3rem',
                        }}
                      >
                        <Lightbulb
                          size={15}
                          style={{
                            color: 'var(--accent-green)',
                          }}
                        />

                        <strong
                          style={{
                            fontSize: '0.78rem',
                          }}
                        >
                          What it indicates
                        </strong>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.8rem',
                          lineHeight: '1.45',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {t.whatItIndicates}
                      </p>
                    </div>
                  )}

                  {/* Why it matters */}
                  {t.whyItMatters && (
                    <div
                      style={{
                        marginBottom: '0.9rem',
                      }}
                    >
                      <p
                        style={{
                          margin: '0 0 0.3rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        Why it matters
                      </p>

                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.8rem',
                          lineHeight: '1.45',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {t.whyItMatters}
                      </p>
                    </div>
                  )}

                  {/* Example */}
                  {t.example && (
                    <div
                      style={{
                        padding: '0.7rem',
                        borderRadius: '8px',
                        background: 'rgba(0, 255, 150, 0.05)',
                        borderLeft: '3px solid var(--accent-green)',
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.78rem',
                          lineHeight: '1.45',
                          fontStyle: 'italic',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <strong>Example:</strong> {t.example}
                      </p>
                    </div>
                  )}

                  {/* Caution */}
                  {t.caution && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'flex-start',
                      }}
                    >
                      <AlertCircle
                        size={15}
                        style={{
                          color: '#f59e0b',
                          marginTop: '2px',
                          flexShrink: 0,
                        }}
                      />

                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.75rem',
                          lineHeight: '1.4',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <strong>Caution:</strong> {t.caution}
                      </p>
                    </div>
                  )}

                </motion.div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem 1rem',
              }}
            >
              <BookOpen
                size={36}
                style={{
                  color: 'var(--text-secondary)',
                  marginBottom: '0.75rem',
                  opacity: 0.6,
                }}
              />

              <p
                style={{
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                No matching terms found
              </p>

              <p
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.4',
                }}
              >
                Try searching for P/E Ratio, EPS, ROE,
                Revenue or Market Cap.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExplainItPanel;
