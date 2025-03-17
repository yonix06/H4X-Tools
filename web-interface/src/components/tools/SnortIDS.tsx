import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../../services/api';

const snortSchema = z.object({
  interface: z.string().min(1, { message: 'Interface is required' }),
  duration: z.number().min(1, { message: 'Duration must be at least 1 second' }).default(60),
});

type SnortFormValues = z.infer<typeof snortSchema>;

const SnortIDS: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<SnortFormValues>({
    resolver: zodResolver(snortSchema),
    defaultValues: {
      duration: 60,
    },
  });

  const onSubmit = async (data: SnortFormValues) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post('/tools/snort-ids', data);
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Snort IDS Configuration
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md">
        <div className="mb-4">
          <label htmlFor="interface" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Interface:
          </label>
          <input
            type="text"
            id="interface"
            className={`
              mt-1 block w-full rounded-md shadow-sm
              ${isDark ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-white text-gray-700 border-gray-300'}
              focus:ring-purple-500 focus:border-purple-500
            `}
            {...register('interface')}
          />
          {errors.interface && (
            <p className="text-red-500 text-xs mt-1">{errors.interface.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="duration" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Duration (seconds):
          </label>
          <input
            type="number"
            id="duration"
            className={`
              mt-1 block w-full rounded-md shadow-sm
              ${isDark ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-white text-gray-700 border-gray-300'}
              focus:ring-purple-500 focus:border-purple-500
            `}
            {...register('duration', { valueAsNumber: true })}
          />
          {errors.duration && (
            <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>
          )}
        </div>

        <button
          type="submit"
          className={`
            px-4 py-2 rounded-md font-medium
            ${isDark ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'}
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          disabled={loading}
        >
          {loading ? 'Running...' : 'Run Snort IDS'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 rounded-md" style={{ backgroundColor: isDark ? '#4a5568' : '#edf2f7', color: isDark ? '#edf2f7' : '#2d3748' }}>
          <h4 className="font-semibold">Snort IDS Result:</h4>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default SnortIDS;
