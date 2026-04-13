import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { MenuItem } from '../types';

const DEFAULT_MENU: MenuItem[] = [
  {
    id: '1',
    title: 'Zaatar Manakish',
    description: 'Traditional Lebanese thyme and olive oil flatbread.',
    price: 150000,
    category: 'Manakish',
    imageUrl: 'https://picsum.photos/seed/zaatar/800/600'
  },
  {
    id: '2',
    title: 'Cheese Manakish',
    description: 'Freshly baked flatbread topped with Akkawi cheese.',
    price: 350000,
    category: 'Manakish',
    imageUrl: 'https://picsum.photos/seed/cheese/800/600'
  },
  {
    id: '3',
    title: 'Fresh Sourdough',
    description: 'Artisanal sourdough bread baked daily.',
    price: 500000,
    category: 'Bread',
    imageUrl: 'https://picsum.photos/seed/bread/800/600'
  }
];

// The user will need to replace this with their published CSV URL
// Example: https://docs.google.com/spreadsheets/d/e/2PACX-1v.../pub?output=csv
const SHEET_URL = import.meta.env.VITE_GOOGLE_SHEET_URL || '';

export function useMenu() {
  const [items, setItems] = useState<MenuItem[]>(DEFAULT_MENU);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!SHEET_URL) return;

    const fetchMenu = async () => {
      setLoading(true);
      try {
        const response = await fetch(SHEET_URL);
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedItems = results.data.map((rawRow: any, index: number) => {
              // Clean keys to handle spaces, invisible characters (BOM), and casing
              const row: any = {};
              const keys = Object.keys(rawRow);
              
              keys.forEach(key => {
                // Remove invisible characters and trim
                const cleanKey = key.replace(/[^\x20-\x7E]/g, '').trim().toLowerCase();
                row[cleanKey] = rawRow[key];
              });

              // Fallback: if 'title' isn't found by name, use the first column's value
              const firstColumnKey = keys[0];
              const titleValue = row.title || row.item || row.name || row.product || rawRow[firstColumnKey] || '';

              return {
                id: row.id || String(index),
                title: String(titleValue).trim(),
                description: String(row.description || row.desc || row.info || '').trim(),
                price: parseFloat(String(row.price || '0').replace(/[^0-9.]/g, '')),
                category: String(row.category || row.type || 'General').trim(),
                imageUrl: String(row.imageurl || row.image || row.photo || row.img || 'https://picsum.photos/seed/bakery/800/600').trim()
              };
            });
            setItems(parsedItems);
            setLoading(false);
          },
          error: (err: any) => {
            console.error('CSV Parsing Error:', err);
            setError('Failed to parse menu data');
            setLoading(false);
          }
        });
      } catch (err) {
        console.error('Fetch Error:', err);
        setError('Failed to fetch menu data');
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  return { items, loading, error };
}
