import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { MenuItem } from '../types';

const DEFAULT_MENU: MenuItem[] = [
  {
    id: '1',
    title: 'chicken mushroom',
    description: 'sample items please reload the menu.',
    price: 350000,
    category: 'Chicken Platters',
    mainCategory: 'Occidental',
    imageUrl: 'https://drive.google.com/thumbnail?id=18CE6SHJIdx3vYIY0ES48_xD1T2YarqLF&sz=s800'
  },
  {
    id: '2',
    title: 'Chicken crispy',
    description: 'sample items please reload the menu.',
    price: 350000,
    category: 'Chicken Platters',
    mainCategory: 'Occidental',
    imageUrl: 'https://drive.google.com/thumbnail?id=18CE6SHJIdx3vYIY0ES48_xD1T2YarqLF&sz=s800'
  },
  {
    id: '3',
    title: 'Beef Stroganoff',
    description: 'sample items please reload the menu.',
    price: 500000,
    category: 'Steak & Beef Platters',
    mainCategory: 'Oriental',
    imageUrl: 'https://drive.google.com/thumbnail?id=18CE6SHJIdx3vYIY0ES48_xD1T2YarqLF&sz=s800'
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
                mainCategory: String(row.maincategory || row['main category'] || row.main_category || 'Other').trim(),
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
