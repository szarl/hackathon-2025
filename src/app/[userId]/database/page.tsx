'use client';

import { useState, useEffect } from 'react';

interface Person {
  name: string;
  surname: string;
}

export default function DatabasePage() {
  const [data, setData] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    fetchSpreadsheetData();
  }, []);

  const fetchSpreadsheetData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/sheets');

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const result = await response.json();

      // Transform the spreadsheet data into Person objects
      const people: Person[] = [];

      if (result.values && result.values.length > 1) {
        // Skip header row (index 0) and process data rows
        for (let i = 1; i < result.values.length; i++) {
          const row = result.values[i];
          if (row && row.length >= 2 && row[0] && row[1]) {
            people.push({
              name: row[0],
              surname: row[1],
            });
          }
        }
      }

      setData(people);
    } catch (err) {
      console.error('Error fetching spreadsheet data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const askAI = async () => {
    if (data.length === 0) {
      setAiError('No data available to ask about');
      return;
    }

    try {
      setAiLoading(true);
      setAiError(null);
      setAiResponse(null);

      const firstPerson = data[0];
      const question = `Do you know ${firstPerson.name} ${firstPerson.surname}?`;

      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get AI response: ${response.statusText}`);
      }

      const result = await response.json();
      setAiResponse(result.answer);
    } catch (err) {
      console.error('Error asking AI:', err);
      setAiError(err instanceof Error ? err.message : 'Failed to get AI response');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='mt-4 text-gray-600'>Loading spreadsheet data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='max-w-md rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700'>
            <h3 className='mb-2 font-bold'>Error</h3>
            <p>{error}</p>
            <button
              onClick={fetchSpreadsheetData}
              className='mt-4 rounded bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700'
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen py-8'>
      <div className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
        <div className='rounded-lg bg-white shadow'>
          <div className='px-4 py-5 sm:p-6'>
            <div className='mb-6 flex items-center justify-between'>
              <h1 className='text-3xl font-bold text-gray-900'>Database</h1>
              <div className='flex space-x-3'>
                <button
                  onClick={askAI}
                  disabled={data.length === 0 || aiLoading}
                  className='flex items-center rounded bg-purple-600 px-4 py-2 font-bold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-400'
                >
                  {aiLoading ? (
                    <>
                      <div className='mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white'></div>
                      Asking AI...
                    </>
                  ) : (
                    'Ask AI'
                  )}
                </button>
                <button
                  onClick={fetchSpreadsheetData}
                  className='rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700'
                >
                  Refresh
                </button>
              </div>
            </div>

            {data.length === 0 ? (
              <div className='py-12 text-center'>
                <p className='text-lg text-gray-500'>No data found in the spreadsheet.</p>
              </div>
            ) : (
              <div className='ring-opacity-5 overflow-hidden shadow ring-1 ring-black md:rounded-lg'>
                <table className='min-w-full divide-y divide-gray-300'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'
                      >
                        Name
                      </th>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'
                      >
                        Surname
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200 bg-white'>
                    {data.map((person, index) => (
                      <tr key={index} className='hover:bg-gray-50'>
                        <td className='px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900'>{person.name}</td>
                        <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-500'>{person.surname}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* AI Response Section */}
            {(aiResponse || aiError) && (
              <div className='mt-8'>
                <h2 className='mb-4 text-xl font-semibold text-gray-900'>AI Response</h2>
                {aiError ? (
                  <div className='rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700'>
                    <p className='font-bold'>Error:</p>
                    <p>{aiError}</p>
                  </div>
                ) : (
                  <div className='rounded-lg border border-purple-200 bg-purple-50 p-4'>
                    <div className='flex items-start'>
                      <div className='flex-shrink-0'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-purple-600'>
                          <span className='text-sm font-bold text-white'>AI</span>
                        </div>
                      </div>
                      <div className='ml-3 flex-1'>
                        <p className='mb-1 text-sm font-medium text-purple-800'>
                          Question: "Do you know {data[0]?.name} {data[0]?.surname}?"
                        </p>
                        <div className='whitespace-pre-wrap text-gray-700'>{aiResponse}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className='mt-6 text-sm text-gray-500'>
              <p>Total records: {data.length}</p>
              <p className='mt-1'>Data source: Google Spreadsheet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
